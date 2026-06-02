"""
Epicure: minimal loader for the three sibling ingredient embeddings.
Source: https://huggingface.co/spaces/Kaikaku/epicure-explorer
Paper:  https://arxiv.org/abs/2605.22391  (Radzikowski & Chen, 2026)
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Iterable

import numpy as np


def _try_hf_download(repo_id: str, filename: str, revision: str | None = None) -> str:
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:
        raise ImportError(
            "huggingface_hub is required for from_pretrained(). "
            "Install with: pip install huggingface_hub safetensors numpy"
        ) from exc
    return hf_hub_download(repo_id=repo_id, filename=filename, revision=revision)


def _load_safetensors(path: str) -> np.ndarray:
    try:
        from safetensors.numpy import load_file
    except ImportError as exc:
        raise ImportError("safetensors required. pip install safetensors") from exc
    return load_file(path)["embeddings"]


def _unit(v: np.ndarray, axis: int = -1, eps: float = 1e-9) -> np.ndarray:
    n = np.linalg.norm(v, axis=axis, keepdims=True)
    return v / np.maximum(n, eps)


@dataclass
class ModeEntry:
    mode_id: str
    kind: str
    property: str
    label: str
    n_members: int
    members: list[str]
    pole: np.ndarray


class Epicure:
    def __init__(self, E, vocab, modes, supervised_poles, config):
        self.E_raw = E.astype(np.float32)
        self.E = _unit(self.E_raw)
        self.vocab = vocab
        self.itos = {i: n for n, i in vocab.items()}
        self.modes = modes
        self.supervised_poles = supervised_poles
        self.config = config

    @classmethod
    def from_pretrained(cls, repo_id_or_path: str, revision: str | None = None) -> "Epicure":
        if os.path.isdir(repo_id_or_path):
            base = repo_id_or_path
            getp = lambda fn: os.path.join(base, fn)
        else:
            getp = lambda fn: _try_hf_download(repo_id_or_path, fn, revision=revision)
        E = _load_safetensors(getp("embeddings.safetensors"))
        with open(getp("vocab.json")) as f:
            vocab = json.load(f)
        with open(getp("modes.json")) as f:
            modes_raw = json.load(f)
        with open(getp("supervised_poles.json")) as f:
            sup_raw = json.load(f)
        with open(getp("config.json")) as f:
            config = json.load(f)
        modes = [
            ModeEntry(
                mode_id=m["mode_id"], kind=m["kind"], property=m["property"],
                label=m["label"], n_members=m["n_members"], members=m["members"],
                pole=np.array(m["pole"], dtype=np.float32),
            )
            for m in modes_raw
        ]
        supervised_poles = {k: np.array(v, dtype=np.float32) for k, v in sup_raw.items()}
        return cls(E, vocab, modes, supervised_poles, config)

    def vec(self, name: str, normalised: bool = True) -> np.ndarray:
        return self.E[self.vocab[name]] if normalised else self.E_raw[self.vocab[name]]

    def neighbors(self, name: str, k: int = 5, exclude_self: bool = True) -> list[tuple[str, float]]:
        v = self.vec(name)
        sims = self.E @ v
        order = np.argsort(-sims)
        start = 1 if exclude_self else 0
        return [(self.itos[int(i)], float(sims[i])) for i in order[start:start + k]]

    def closest_mode(self, name: str, kind: str | None = None, k: int = 3) -> list[tuple[str, str, float]]:
        v = self.vec(name)
        scored = []
        for m in self.modes:
            if kind is not None and m.kind != kind:
                continue
            scored.append((m.mode_id, m.label, float(_unit(m.pole) @ v)))
        scored.sort(key=lambda x: -x[2])
        return scored[:k]
