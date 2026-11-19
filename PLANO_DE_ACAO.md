# PLANO DE AÇÃO — forge360

## Estado atual

**Release v0.2 completa** — Épico 1 (3/3) entregue e aprovado em gate (PASS pelo `forge360:reviewer` nativo): STORY-1.1 (validador `scripts/validate.cjs`, FR-5), STORY-1.2 (hook `gate-enforcer.cjs`, FR-6 / Art. III), STORY-1.3 (skill `/onboarding`, FR-7). Plugin instalado e carregado; validador em 20 verificações, zero deps. Cadeia de agentes (builder → reviewer → shipper) e governança determinística (push-authority + gate-enforcer) validadas em produção por dogfooding.

**v0.3 aberta (2026-11-18):** revisão do plugin achou 5 furos de governança nos hooks (push via PowerShell sem hook; gate libera se qualquer story antiga tem PASS; autoridade `FORGE_ACTIVE_AGENT` forjável; regex de push contornável; veredito FAIL que cita "PASS" aceito). Virou a **STORY-2.1** (`docs/stories/2.1.story.md`, Ready, 9/10). PRD: FR-4/FR-5/FR-6 reescritos no lugar com o texto endurecido; FR-7 corrigido para ✅.

## Em andamento

- [ ] **STORY-2.1** — aguardando o Helder reler e aprovar as decisões D-A a D-E da story (autoridade por `agent_type`; prefixo deixa de autorizar; gate pela story do commit HEAD; `hooks/_shared.cjs`; docs que mudam junto). Só depois rodar `/sdc`.

## Pendente (ordem de prioridade)

- [ ] Stories derivadas da revisão (fora da 2.1): reordenar commits do `/sdc` (builder commita antes do gate → conflita com commit único); separar arquivos internos (MEMORY, PLANO, ROADMAP, docs/) do que é distribuído ao cliente; caminho dos templates/docs do plugin nas skills `/story` e `/economia`; docs desatualizadas (plugin.json 0.1.0, README, MEMORY, docs/economia.md)
- [ ] Piloto SDC completo em projeto de cliente (FR-9, release v0.3)
- [ ] Piloto da skill /onboarding num projeto real (validar fallback de templates sem `${CLAUDE_PLUGIN_ROOT}`)
- [ ] Piloto da skill /economia em projeto real

## Bloqueios

(nenhum)

## Próxima sessão

Helder relê `docs/stories/2.1.story.md` (seção de decisões D-A a D-E e "Dependências e lacunas") e aprova ou ajusta. Aprovado → `/sdc` na STORY-2.1 (a T-1 verifica o payload real do hook antes de qualquer código). Atenção: até a 2.1 ser entregue, o gate-enforcer libera qualquer push porque as stories 1.1–1.3 têm PASS. Depois da 2.1: piloto SDC (FR-9) em projeto de cliente.
