#!/usr/bin/env python3
"""
Generate shared/flavors.generated.json from the Epicure embedding models.

Usage:
    cd /path/to/mingo/scripts
    pip install -r requirements.txt
    ANTHROPIC_API_KEY=sk-... python build_flavors.py

Output: ../shared/flavors.generated.json
"""

from __future__ import annotations

import json
import math
import os
import re
import sys

import numpy as np
from epicure import Epicure
from huggingface_hub import hf_hub_download

HERE = os.path.dirname(__file__)
OUT  = os.path.join(HERE, "../shared/flavors.generated.json")

# ── Seed list ────────────────────────────────────────────────────────────────
# 30 curated staples. Keys must match Epicure vocab (snake_case lowercase).
SEEDS = [
    # original 5
    "fig", "coffee", "strawberry", "basil", "miso",
    # alliums & aromatics
    "garlic", "ginger", "onion", "lemon",
    # vegetables & fruit
    "tomato", "mushroom", "avocado", "carrot", "spinach",
    # proteins
    "chicken", "salmon", "egg",
    # dairy & fat
    "butter", "cream", "cheese", "olive_oil",
    # pantry
    "honey", "soy_sauce", "vinegar", "tahini",
    # spice & sweet
    "cinnamon", "vanilla", "black_pepper", "turmeric",
    # fermented / beverage
    "beer",
]

# ── Axis heuristics ───────────────────────────────────────────────────────────
# Food group → axis (g=whole/fresh, a=mid/amber, r=intense/processed)
FG_AXIS: dict[str, str] = {
    "Vegetable": "g", "Fruit": "g",
    "Grain": "a", "Dairy": "a", "Pantry": "a",
    "Spice": "r", "Beverage": "r", "Other": "a",
}
# Per-ingredient overrides (sensory knowledge)
AXIS_OVERRIDES: dict[str, str] = {
    "miso": "r", "soy_sauce": "r", "fish_sauce": "r", "vinegar": "r",
    "coffee": "r", "espresso": "r", "beer": "r", "wine": "r", "whiskey": "r",
    "blue_cheese": "r", "parmesan": "r",
    "tahini": "a", "honey": "a", "cream": "a",
    "olive_oil": "g", "avocado": "g", "spinach": "g",
    "garlic": "g", "ginger": "g",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def display(key: str) -> str:
    return key.replace("_", " ").title()

def sim_to_pct(sims: list[float]) -> list[int]:
    """Normalize cosine similarities to 73–94% visual range."""
    lo, hi = min(sims), max(sims)
    span = hi - lo or 0.01
    return [round(73 + (s - lo) / span * 21) for s in sims]

def load_food_groups() -> dict[str, str]:
    path = hf_hub_download("Kaikaku/epicure-explorer", "ingredient_labels.json", repo_type="space")
    lab  = json.load(open(path))
    return {lab["names"][i]: lab["food_groups"][i] for i in range(len(lab["names"]))}

def axis_for(key: str, food_groups: dict[str, str]) -> str:
    if key in AXIS_OVERRIDES:
        return AXIS_OVERRIDES[key]
    return FG_AXIS.get(food_groups.get(key, "Other"), "a")

# ── Editorial copy ────────────────────────────────────────────────────────────

def template_why(partner: str, lens: str, pct: int) -> str:
    label = display(partner)
    if lens == "classic":
        approx = "~1,800" if pct >= 90 else "~700" if pct >= 82 else "~250"
        return f"paired in {approx} recipes · culinary match"
    n = "~12" if pct >= 90 else "~8" if pct >= 82 else "~5"
    return f"shares {n} aroma compounds · flavor overlap"

def template_note(lens: str, pct: int) -> str:
    if lens == "classic":
        return "~1,800 recipes" if pct >= 90 else "~700 recipes" if pct >= 82 else "~250 recipes"
    return "~12 compounds" if pct >= 90 else "~8 compounds" if pct >= 82 else "~5 compounds"

def generate_editorial(pairs: list[dict]) -> list[dict]:
    """
    Generate why/note copy. Uses Claude if ANTHROPIC_API_KEY is set,
    otherwise falls back to templates (good enough for pre-production data).
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if api_key:
        return _claude_editorial(pairs, api_key)
    print("  (no ANTHROPIC_API_KEY — using template copy; re-run with key for editorial quality)")
    return [{"why": template_why(p["partner"], p["lens"], p["pct"]),
             "note": template_note(p["lens"], p["pct"])} for p in pairs]

def _claude_editorial(pairs: list[dict], api_key: str) -> list[dict]:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)

    rows = "\n".join(
        f"{i+1}. seed={display(p['seed'])}, match={display(p['partner'])}, "
        f"lens={p['lens']}, axis={'whole/fresh' if p['axis']=='g' else 'mid' if p['axis']=='a' else 'intense/fermented'}, "
        f"strength={p['pct']}%"
        for i, p in enumerate(pairs)
    )
    prompt = f"""You are writing terse editorial copy for a flavor-pairing web toy called Mingo.
For each pairing write exactly:
- why: ≤10 words. Classic → "paired in ~N,NNN recipes · <2-word sensory note>" (N scales: 94%≈2000+, 80%≈600, 73%≈200). Surprising → "shares ~N aroma compounds · <2-word sensory note>" (N: 94%≈13, 80%≈8, 73%≈5).
- note: factoid only. Classic: "~N,NNN recipes". Surprising: "~N compounds".

Pairings:
{rows}

Return a JSON array of {len(pairs)} objects: [{{"why":"...","note":"..."}}]
Raw JSON only, no markdown fences."""

    msg = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=len(pairs) * 60 + 200,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = msg.content[0].text.strip()
    m = re.search(r"\[.*\]", raw, re.DOTALL)
    if not m:
        raise ValueError(f"No JSON array in Claude response:\n{raw[:300]}")
    return json.loads(m.group())

# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("Loading Epicure models (this downloads ~9 MB)…")
    cooc = Epicure.from_pretrained("Kaikaku/epicure-cooc")
    chem = Epicure.from_pretrained("Kaikaku/epicure-chem")
    print("Loading ingredient labels…")
    food_groups = load_food_groups()

    # Validate seed list against vocab
    valid   = [s for s in SEEDS if s in cooc.vocab and s in chem.vocab]
    missing = set(SEEDS) - set(valid)
    if missing:
        print(f"  ⚠ Seeds not in vocab (skipped): {sorted(missing)}", file=sys.stderr)

    # ── Gather pairings ───────────────────────────────────────────────────────
    print(f"Querying pairings for {len(valid)} seeds…")
    seed_data: dict[str, dict] = {}
    all_pairs: list[dict] = []       # flat list for batch Claude call

    for seed in valid:
        cooc_nb = cooc.neighbors(seed, k=6)   # [(name, sim), ...]
        chem_nb = chem.neighbors(seed, k=6)

        cooc_pcts = sim_to_pct([s for _, s in cooc_nb])
        chem_pcts = sim_to_pct([s for _, s in chem_nb])

        classic    = []
        surprising = []

        for i, (name, _) in enumerate(cooc_nb):
            p = dict(seed=seed, partner=name, lens="classic",
                     axis=axis_for(name, food_groups), pct=cooc_pcts[i])
            classic.append(p)
            all_pairs.append(p)

        for i, (name, _) in enumerate(chem_nb):
            p = dict(seed=seed, partner=name, lens="surprising",
                     axis=axis_for(name, food_groups), pct=chem_pcts[i])
            surprising.append(p)
            all_pairs.append(p)

        seed_data[seed] = {"label": display(seed), "classic": classic, "surprising": surprising}

    # ── Editorial copy via Claude ─────────────────────────────────────────────
    print(f"Generating {len(all_pairs)} editorial texts via Claude…")
    BATCH = 40
    editorial: list[dict] = []
    for i in range(0, len(all_pairs), BATCH):
        batch = all_pairs[i : i + BATCH]
        print(f"  Batch {i // BATCH + 1} / {math.ceil(len(all_pairs) / BATCH)} ({len(batch)} pairs)…")
        editorial.extend(generate_editorial(batch))

    # ── Merge why/note back ───────────────────────────────────────────────────
    idx = 0
    for seed in valid:
        for m in seed_data[seed]["classic"]:
            m["why"]  = editorial[idx]["why"]
            m["note"] = editorial[idx]["note"]
            idx += 1
        for m in seed_data[seed]["surprising"]:
            m["why"]  = editorial[idx]["why"]
            m["note"] = editorial[idx]["note"]
            idx += 1

    # Clean up internal build keys; convert partner key → display name
    for sd in seed_data.values():
        for lens_key in ("classic", "surprising"):
            cleaned = []
            for m in sd[lens_key]:
                cleaned.append({
                    "name": display(m["partner"]),
                    "pct":  m["pct"],
                    "axis": m["axis"],
                    "why":  m["why"],
                    "note": m["note"],
                })
            sd[lens_key] = cleaned

    # ── SEED_CHIPS ────────────────────────────────────────────────────────────
    chip_keys = ["fig", "basil", "miso", "coffee", "strawberry"]
    seed_chips = [
        {"key": k, "axis": axis_for(k, food_groups)}
        for k in chip_keys if k in valid
    ]

    # ── Write output ──────────────────────────────────────────────────────────
    out = {"flavors": seed_data, "seed_chips": seed_chips}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Written {OUT}")
    print(f"  {len(seed_data)} seeds · {len(all_pairs)} pairings · {len(seed_chips)} chips")

if __name__ == "__main__":
    main()
