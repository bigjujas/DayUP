"""Testes unitários puros do cálculo de score (sem banco)."""
from __future__ import annotations

from app.services.scoring import EntryInput, compute_score


def test_sem_entries_retorna_none():
    assert compute_score([]) is None


def test_todas_perfeitas_da_100():
    entries = [
        EntryInput(weight=3, level=1.0),
        EntryInput(weight=2, level=1.0),
        EntryInput(weight=1, level=1.0),
    ]
    assert compute_score(entries) == 100


def test_todas_nao_feitas_da_0():
    entries = [EntryInput(weight=3, level=0.0), EntryInput(weight=1, level=0.0)]
    assert compute_score(entries) == 0


def test_mix_de_pesos_e_niveis():
    # (3×1.0 + 1×0.4) / 4 × 100 = 85
    entries = [EntryInput(weight=3, level=1.0), EntryInput(weight=1, level=0.4)]
    assert compute_score(entries) == 85


def test_peso_medio_arredonda_para_inteiro():
    # (2×0.7 + 1×0.4) / 3 × 100 = 60
    entries = [EntryInput(weight=2, level=0.7), EntryInput(weight=1, level=0.4)]
    assert compute_score(entries) == 60


def test_retorno_e_inteiro():
    score = compute_score([EntryInput(weight=2, level=0.7)])
    assert score == 70
    assert isinstance(score, int)
