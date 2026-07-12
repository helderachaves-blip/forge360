---
name: spec
description: Pipeline de especificação para demandas complexas — requisitos, score de complexidade, pesquisa, spec e crítica. Use antes de /story quando a demanda for grande, ambígua ou de alto risco.
---

# /spec — Pipeline de especificação

Transforma requisito informal em spec executável. O número de fases depende do **score de complexidade**.

## Fase 1 — Score de complexidade (agente architect)

5 dimensões, 1–5 cada: Escopo (arquivos afetados), Integração (APIs externas), Infraestrutura (mudanças), Conhecimento (familiaridade), Risco (criticidade).

| Score | Classe | Fases |
|---|---|---|
| ≤ 8 | SIMPLE | requisitos → spec → crítica |
| 9–15 | STANDARD | todas as 5 |
| ≥ 16 | COMPLEX | todas + ciclo de revisão |

## Fases

1. **Requisitos** (contexto principal): liste FR-*, NFR-*, CON-* a partir da conversa com o usuário. Cada item numerado e verificável.
2. **Score** (architect): classifique e decida as fases.
3. **Pesquisa** (explorer/planner, pular se SIMPLE): levante o que falta saber — código existente, docs, referências externas.
4. **Spec** (planner): escreva `docs/specs/{slug}.spec.md`. **Gate constitucional (Art. V):** cada afirmação rastreia a FR-*, NFR-*, CON-* ou achado de pesquisa — nada inventado.
5. **Crítica** (reviewer): nota 1–5 por seção. Média ≥ 4,0 = APPROVED → derive stories via `/story`; 3,0–3,9 = revisar a spec; < 3,0 = escalar ao architect.

## Saída

Spec aprovada + lista de stories derivadas propostas (títulos + ordem sugerida).
