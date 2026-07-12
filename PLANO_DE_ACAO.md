# PLANO DE AÇÃO — forge360

## Estado atual

STORY-1.1 **entregue e aprovada no gate (PASS)**: validador estrutural `scripts/validate.cjs` (FR-5) — 18 verificações, zero deps. Plugin instalado localmente via marketplace (`.claude-plugin/marketplace.json`) e verificado pelo CLI (5 skills, 6 agentes, 1 hook). Base pronta para as stories 1.2 (gate-enforcer) e 1.3 (/onboarding), que dependiam da 1.1.

## Em andamento

(nada)

## Pendente (ordem de prioridade)

- [ ] **STORY-1.2** — Hook gate-enforcer (FR-6) — desbloqueada pela 1.1 — `docs/stories/1.2.story.md`
- [ ] **STORY-1.3** — Skill /onboarding (FR-7) — desbloqueada pela 1.1 — `docs/stories/1.3.story.md`
- [ ] Piloto SDC completo (FR-9, release v0.3)
- [ ] Piloto da skill /economia em projeto real

## Bloqueios

(nenhum)

## Próxima sessão

Reiniciar o Claude Code **neste diretório** para carregar o plugin instalado (skills/agentes forge360 passam a existir na interface). Implementar na ordem: STORY-1.2 → 1.3 (ambas `Ready`, agora desbloqueadas). Ler CLAUDE.md → PRD → story. Ao final de cada story: `/gate` (reviewer) + atualização de gestão no mesmo commit.
