# ROADMAP — forge360

## ✅ Entregue

| Data | Entrega |
|---|---|
| 2026-07-11 | Análise comparativa AIOX × Claude Code nativo (fundamentou o design) |
| 2026-07-11 | Auditoria do material de economia de tokens (TXT jun/2026) com preços verificados |
| 2026-07-11 | Scaffold v0.1.0: plugin.json, 6 agentes com roteamento de modelo, 5 skills (story/gate/sdc/spec/economia), hook push-authority, constituição (6 artigos), docs/economia.md, templates |
| 2026-07-11 | Documentação de produto: PRD v1.0 (FR-1..9, NFR-1..5, CON-1..4, releases v0.2→v1.0), arquitetura com decisões D-1..D-6, CLAUDE.md de sessão |
| 2026-07-11 | Épico 1 (v0.2): stories 1.1 (validador estrutural), 1.2 (gate-enforcer) e 1.3 (/onboarding) criadas e validadas — todas Ready (scores 9/8/8) |
| 2026-07-11 | **STORY-1.1** entregue e aprovada no gate (PASS): validador estrutural `scripts/validate.cjs` (FR-5), 18 verificações, zero deps, testado com violação plantada (AC-8) |
| 2026-07-11 | Instalação do plugin (FR-1): `.claude-plugin/marketplace.json` criado; plugin instalado via marketplace local e verificado pelo CLI (5 skills, 6 agentes, 1 hook, ~887 tok always-on) |
| 2026-07-12 | **STORY-1.2** entregue e aprovada no gate (PASS pelo `forge360:reviewer` nativo): hook `hooks/gate-enforcer.cjs` (FR-6 / Art. III) — push autorizado exige story em entrega com veredito PASS/CONCERNS; override de emergência `FORGE_GATE_OVERRIDE=1`; 6 ACs testados. Validador em 19 verificações |

## 🔲 Pendente

| Prioridade | Item | Dependências |
|---|---|---|
| 1 | Implementar STORY-1.3 (/onboarding) — fecha a release v0.2 | 1.1 ✅ |
| 2 | Piloto do fluxo SDC (FR-9, v0.3) | v0.2 |
| 3 | Piloto da skill /economia em projeto real | — |
| 4 | Repositório remoto e versionamento de releases | decisão do Helder |
| 5 | Templates de gestão aplicados a novo projeto de cliente | piloto ok |

## 💡 INSIGHTS (v.next)

- Skill `/onboarding` para bootstrap de projeto novo de cliente (copia templates de gestão + configura agents).
- Hook de gate-enforcer: bloquear push se a story alvo não tem veredito PASS/CONCERNS registrado.
- Avaliar suporte a `fable` como modelo opcional do planner para épicos longos (custo 2× opus — só sob demanda explícita).
- `/economia` poderia gerar Artifact visual com o relatório para apresentação a cliente.
- `validate.cjs`: `verificarHooks()` só varre `PreToolUse`. Quando stories 1.2/1.3 registrarem hooks sob outros eventos (`PostToolUse`, `Stop`…), generalizar a varredura para todos os eventos de `hooks.json` (existência + `node --check`). Observação do gate da STORY-1.1.
