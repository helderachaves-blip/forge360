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
| 2026-07-12 | **STORY-1.3** entregue e aprovada no gate (PASS): skill `skills/onboarding/SKILL.md` (FR-7) — bootstrap de projeto de cliente (3 arquivos de gestão + docs/stories/ + CLAUDE.md ≤40 linhas), idempotente e com proteção anti-recursão. Validador em 20 verificações |
| 2026-07-12 | **Release v0.2 fechada** — Épico 1 completo (1.1+1.2+1.3); método validado por dogfooding (cadeia builder→reviewer→shipper + governança push-authority/gate-enforcer rodando sobre o próprio plugin) |
| 2026-11-18 | Revisão completa do plugin (validador 20/20; hooks testados com payloads de borda — 5 furos de governança confirmados) |
| 2026-11-18 | **STORY-2.1** criada e validada (Ready, 9/10): endurecimento dos hooks — autoridade por `agent_type`, Bash+PowerShell, detecção robusta, gate pela story do HEAD, veredito ancorado, suíte `scripts/test-hooks.cjs` |
| 2026-11-20 | **STORY-2.2** criada e validada (Ready, 9/10): hook `context-meter` alerta 50/75/95% da janela de contexto e recomenda fechamento de janela; PRD ganha FR-10 (v0.3) |
| 2026-11-20 | **STORY-2.2** entregue (gate CONCERNS, sem defeitos): hook `hooks/context-meter.cjs` (FR-10) — alerta 50/75/95% da janela de contexto via UserPromptSubmit+Stop, rearme após /compact, só recomenda fechamento de janela; suíte `scripts/test-context-meter.cjs` (39 casos); `validate.cjs` varre todos os eventos de hooks (21 verificações); plugin 0.3.0 |
| 2026-11-18 | PRD: FR-4/FR-5/FR-6 reescritos no lugar (sem FR novo, para não duplicar regra); FR-7 marcado ✅; release v0.3 aponta a STORY-2.1 |

## 🔲 Pendente

| Prioridade | Item | Dependências |
|---|---|---|
| 0 | Implementar STORY-2.1 (endurecimento da governança) | aprovação do Helder das decisões D-A..D-E |
| 0 | Verificar canais de saída do context-meter em sessão real + revisitar lacunas L-1..L-4 da STORY-2.2 | próxima janela |
| 1 | Piloto do fluxo SDC (FR-9, v0.3) em projeto de cliente | STORY-2.1 |
| 3 | Piloto da skill /economia em projeto real | — |
| 4 | Repositório remoto e versionamento de releases | decisão do Helder |
| 5 | Templates de gestão aplicados a novo projeto de cliente | piloto ok |

## 💡 INSIGHTS (v.next)

- Skill `/onboarding` para bootstrap de projeto novo de cliente (copia templates de gestão + configura agents).
- Hook de gate-enforcer: bloquear push se a story alvo não tem veredito PASS/CONCERNS registrado.
- Avaliar suporte a `fable` como modelo opcional do planner para épicos longos (custo 2× opus — só sob demanda explícita).
- `/economia` poderia gerar Artifact visual com o relatório para apresentação a cliente.
- ✅ (STORY-2.2) `validate.cjs`: `verificarHooks()` só varre `PreToolUse`. Quando um hook for registrado sob outro evento (`PostToolUse`, `Stop`…), generalizar a varredura para todos os eventos de `hooks.json` (existência + `node --check`). Observação do gate da STORY-1.1.
- `/onboarding`: o fallback de localização dos templates sem `${CLAUDE_PLUGIN_ROOT}` está descrito em alto nível — detalhar o passo a passo (via `claude plugin list`) quando validado num projeto de cliente real. Ressalva do gate da STORY-1.3.
- `docs/economia.md`: adicionar alerta explícito de que **preço de Batch (−50%) ≠ preço padrão** — a auditoria mensal quase gerou falso positivo ao comparar preço padrão do arquivo com preço de Batch retornado por busca web. Ancorar sempre na página oficial de pricing (input/output padrão), não em resumos de busca. (Achado da auditoria de 2026-07-12.)
- **Auditoria mensal 2026-08-01:** preços em `docs/economia.md` (Fable 5, Opus 4.8, Sonnet 5 promo/padrão, Haiku 4.5) conferidos contra `platform.claude.com/docs/en/about-claude/pricing` — **nenhuma divergência**, todos os valores batem exatamente. Nenhuma correção de preço foi necessária.
- Anthropic lançou **Claude Opus 5** (mesmo preço de Opus 4.8: $5/$25 MTok) — `docs/economia.md` só cita "Opus 4.8" na tabela. `architect.md`/`planner.md` usam `model: opus` (sem versão), então já herdam o modelo mais novo automaticamente; sem ação urgente, mas vale atualizar a tabela na próxima revisão do arquivo para refletir o nome atual do modelo.
- Overhead fixo de contexto medido em 2026-08-01: MEMORY.md (1957B) + PLANO_DE_ACAO.md (1160B) + ROADMAP.md (3698B) + CLAUDE.md do projeto (2619B) + CLAUDE.md global (4744B) ≈ 14,2KB ≈ **~3.550 tokens/sessão** (estimativa bytes/4, sem contar skills/agentes). Nenhuma duplicação exata encontrada entre CLAUDE.md global e do projeto. `ROADMAP.md` é o maior e cresce a cada entrega — se passar de ~150 linhas, considerar arquivar entregas com >3 meses em `docs/CHANGELOG.md` para conter o overhead always-on.
- **Revisão 2026-11-18 (fora da STORY-2.1):** (a) `/sdc` — builder commita antes do gate e da gestão, o que contradiz o commit único do Modelo 1; definir a ordem. (b) Distribuição — sem `.gitignore`, a instalação copia MEMORY.md (com contatos e nome de cliente), PLANO, ROADMAP, docs/ e o TXT/DOCX; separar produto de gestão interna. (c) `/story` e `/economia` citam "templates/docs do plugin" sem caminho (mesmo problema do fallback do `/onboarding`). (d) Docs desatualizadas: `plugin.json` 0.1.0, README (5 skills, instalação), MEMORY (5 skills, 1 hook), `docs/economia.md` com modelos de 07/2026. (e) `validate.cjs` só aceita aliases de modelo, rejeitaria ID completo.
- Roteamento de modelo dos 6 agentes (`architect`/`planner`→opus, `builder`/`reviewer`→sonnet, `explorer`/`shipper`→haiku) segue coerente com a doutrina de `docs/economia.md`; nenhuma troca de modelo recomendada nesta auditoria.
- **Medição de contexto sob demanda (insight do Helder, 2026-11-20):** comando manual para rodar a varredura do `context-meter` a qualquer momento. Antes de criar, avaliar sobreposição com o `/context` nativo do Claude Code, que já mostra a ocupação da janela (Art. V: não duplicar o nativo). Se valer a pena, o diferencial seria uma skill leve (ex.: `/janela`) que reusa a lógica do hook e devolve % + marco atual + recomendação de fechamento quando ≥ 95%.
