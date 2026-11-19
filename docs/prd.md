# PRD — forge360 v1.0

**Produto:** forge360 — plugin nativo do Claude Code com o método de desenvolvimento da CONSULTORIA 360IA
**Dono:** Helder (DEP-TI)
**Data:** 2026-07-11 | **Status:** Aprovado para desenvolvimento
**Baseline:** scaffold v0.1.0 já entregue (ver ROADMAP)

---

## 1. Visão

Consultores da 360IA entregam projetos de cliente com **método auditável** (story-driven + quality gates) e **custo de IA controlado** (economia por design), instalando um único plugin em qualquer projeto. O forge360 destila a metodologia do AIOX sobre os recursos nativos do Claude Code — sem installer, sem sync multi-IDE, sem engine própria de workflow.

## 2. Problema

1. O AIOX carrega dezenas de milhares de tokens de contexto fixo por sessão e mantém ~60% de código que compensa lacunas que o Claude Code já fechou (subagents, skills, hooks, memória, compactação).
2. Sem método padronizado, cada projeto de cliente reinventa fluxo, gates e gestão — e desperdiça tokens (caso real: regras duplicadas pai/filho no DEP-FINANCEIRO, 2× o custo por sessão).
3. Não existe auditoria de custo de contexto reproduzível para mostrar a clientes.

## 3. Personas

| Persona | Necessidade |
|---|---|
| **Consultor 360IA** (Helder) | Instalar o método em 1 comando; delegar implementação a modelos (Opus/Sonnet) com guard-rails |
| **Cliente** (ex.: Edilvo) | Entregas rastreáveis (story → gate → ship) e custo de IA justificável |
| **Modelo executor** (Opus etc.) | Stories com contexto completo para codar sem redescobrir o projeto |

## 4. Requisitos Funcionais

| ID | Requisito | Release | Estado |
|---|---|---|---|
| FR-1 | Plugin instalável via `claude plugin install` com agents, skills e hooks carregando corretamente | v0.2 | validar |
| FR-2 | 6 agentes com modelo fixado no frontmatter (planner/architect=opus, builder/reviewer=sonnet, explorer/shipper=haiku) | v0.1 | ✅ entregue |
| FR-3 | Skills `/story`, `/gate`, `/sdc`, `/spec`, `/economia` operacionais | v0.1 | ✅ entregue (piloto pendente) |
| FR-4 | Hook `push-authority`: `git push`, `gh pr create/merge` e `gh api` de criação/merge de PR bloqueados fora do shipper, em **Bash e PowerShell**. Autoridade pela identidade real do agente (`agent_type` do payload do hook), não por texto no comando. Detecção cobre variações do git (`-C`, `-c`, `git.exe`) sem falso positivo (`git stash push`) | v0.1 → v0.3 | endurecimento na STORY-2.1 |
| FR-5 | **Validador estrutural** (`scripts/validate.cjs`): confere plugin.json, frontmatter de agents/skills, hooks.json e sintaxe dos hooks; exit ≠ 0 em violação. **Suíte de contorno** (`scripts/test-hooks.cjs`): casos de bypass conhecidos com exit 0/2 esperado, verde antes de cada entrega | v0.2 → v0.3 | ✅ validador entregue; suíte na STORY-2.1 |
| FR-6 | **Hook gate-enforcer**: bloqueia push se a story do commit HEAD (`[STORY-x.y]` no assunto) não tem `**Veredito: PASS\|CONCERNS**` na seção Gate | v0.2 → v0.3 | endurecimento na STORY-2.1 |
| FR-7 | **Skill `/onboarding`**: bootstrap de projeto de cliente — copia templates de gestão, cria `docs/stories/`, gera CLAUDE.md mínimo do projeto | v0.2 | ✅ entregue (piloto pendente) |
| FR-8 | `/economia` emite relatório em Markdown com tabela de overhead, duplicações e plano de correção priorizado | v0.1 | ✅ entregue (piloto pendente) |
| FR-9 | Piloto documentado: fluxo `/story` → `/sdc` → `/gate` completo num projeto de teste | v0.3 | a executar |

## 5. Requisitos Não-Funcionais

| ID | Requisito |
|---|---|
| NFR-1 | **Zero dependências npm.** Hooks/scripts usam apenas Node stdlib (>=18). |
| NFR-2 | Toda documentação, skills e mensagens em **pt-BR** com ortografia correta. |
| NFR-3 | **Economia por design** (Constituição Art. IV): skills lazy; nenhuma regra de carga incondicional; exploração via subagent haiku. |
| NFR-4 | Compatível com o formato de plugin do Claude Code v2.x (`.claude-plugin/plugin.json`, `agents/`, `skills/`, `hooks/hooks.json`). |
| NFR-5 | Hooks encerram em <200ms no caso não-bloqueante (não penalizar cada Bash). |

## 6. Restrições (CON)

| ID | Restrição |
|---|---|
| CON-1 | Push/PR exclusivos do shipper — inegociável (Constituição Art. II). |
| CON-2 | Modelo 1: arquivos de gestão nunca gravam hash/status de push (Art. VI). |
| CON-3 | Projeto interno da 360IA — nunca residir nem gravar artefatos dentro de árvore de cliente. |
| CON-4 | Nada de afirmação inventada em spec/story (Art. V) — tudo rastreia a FR/NFR/CON deste PRD. |

## 7. Fora de escopo (v1.0)

- Suporte a outras IDEs/CLIs (Gemini, Codex, Cursor) — o forge360 é Claude Code only, por decisão.
- Dashboard/UI de observabilidade.
- Marketplace público do plugin (decisão futura do Helder).
- Squads de domínio não-dev (escrita criativa etc.).

## 8. Métricas de sucesso

1. Instalação em projeto novo em ≤ 2 min, sem edição manual.
2. Piloto SDC completo com ≤ 1 intervenção humana fora dos pontos previstos (aprovação de gate e de push).
3. `/economia` detecta 100% das duplicações plantadas num projeto-fixture de teste.
4. Overhead fixo de contexto do próprio plugin ≤ 2K tokens por sessão (só descrições de skills/agents residentes).

## 9. Releases

| Release | Conteúdo | Critério de saída |
|---|---|---|
| v0.1 | Scaffold (entregue 11/07/2026) | arquivos validados por sintaxe |
| v0.2 | FR-1, FR-5, FR-6, FR-7 — stories 1.1–1.3 | validador verde + hooks testados |
| v0.3 | FR-9 piloto + endurecimento FR-4/FR-5/FR-6 (STORY-2.1) | piloto documentado em docs/ |
| v1.0 | Estabilização + decisão de repositório remoto | 2 projetos reais usando |
