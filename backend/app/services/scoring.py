from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass


@dataclass
class EntryInput:
    weight: int
    level: float


def compute_score(entries: Iterable[EntryInput]) -> int | None:
    """Score = round((Σ peso × nível) / (Σ pesos) × 100). Retorna None se não há entries."""
    total_weight = 0
    weighted_sum = 0.0
    for e in entries:
        total_weight += e.weight
        weighted_sum += e.weight * e.level
    if total_weight == 0:
        return None
    return round(weighted_sum / total_weight * 100)
