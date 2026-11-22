# Arquitetura — forge360

**Referência:** [prd.md](prd.md) | **Constituição:** [../constitution.md](../constitution.md)

## Princípio arquitetural

> A metodologia é nossa; a mecânica é do Claude Code.
> Nenhum runtime próprio: agents = subagents nativos, tasks = skills, governança = hooks, memória = memória nativa + 3 arquivos de gestão.

## Mapa do repositório

```text
forge360/
├── .claude-plugin/plugin.json     # manifesto do plugin (nome, versão, descrição)
├── CLAUDE.md                      # orientação de sessão DESTE projeto (frame dos 3 arquivos)
├── MEMORY.md / PLANO_DE_ACAO.md / ROADMAP.md   # gestão do projeto (Modelo 1)
├── constitution.md                # 6 artigos — lei para agentes e hooks
├── agents/                        # 6 subagents (frontmatter: name, description, model, tools)
│   ├── planner.md    (opus)       # demanda → story validada (score ≥ 7)
│   ├── architect.md  (opus)       # arquitetura + banco + score de complexidade
│   ├── builder.md    (sonnet)     # implementação; git local sim, push não
│   ├── reviewer.md   (sonnet)     # gate PASS/CONCERNS/FAIL; não corrige código
│   ├── explorer.md   (haiku)      # varredura read-only em contexto isolado
│   └── shipper.md    (haiku)      # push/PR EXCLUSIVO; verificação ahead/behind
├── skills/                        # carregamento lazy — só a description fica residente
│   ├── story/SKILL.md             # criar+validar story (usa templates/story.md)
│   ├── gate/SKILL.md              # quality gate via reviewer
│   ├── sdc/SKILL.md               # ciclo completo story→build→gate→ship
│   ├── spec/SKILL.md              # pipeline de spec com score de complexidade
│   ├── economia/SKILL.md          # auditoria de custo de contexto
│   └── onboarding/SKILL.md        # (v0.2, FR-7) bootstrap de projeto de cliente
├── hooks/
│   ├── hooks.json                 # registro PreToolUse (matcher Bash) + UserPromptSubmit/Stop
│   ├── push-authority.cjs         # Art. II — bloqueia push fora do shipper (exit 2)
│   ├── gate-enforcer.cjs          # (v0.2, FR-6) bloqueia push sem gate PASS/CONCERNS
│   └── context-meter.cjs          # (v0.3, FR-10) avisa a ocupação da janela em 50/75/95%
├── scripts/
│   ├── validate.cjs               # (v0.2, FR-5) validador estrutural do plugin
│   ├── statusline.cjs             # (v0.3.1, FR-10b) status line: ocupação da janela com cor por faixa
│   └── statusline-launcher.cjs    # lançador de caminho estável (copiado 1x p/ ~/.claude)
├── templates/
│   ├── story.md                   # story hiperdetalhada + checklist de 10 pontos
│   └── gestao/                    # MEMORY / PLANO_DE_ACAO / ROADMAP para clientes
└── docs/
    ├── prd.md                     # este PRD
    ├── architecture.md            # este arquivo
    ├── economia.md                # doutrina + preços (revisado por versão)
    └── stories/                   # stories do PRÓPRIO forge360 (dogfooding)
```

## Componentes e contratos

### Agents (subagents nativos)
- Contrato: frontmatter `name`, `description` (define quando o Claude os aciona), `model`, `tools`.
- Roteamento de modelo é **decisão de arquitetura fixada no arquivo** (PRD FR-2, doutrina docs/economia.md §3). Mudança de modelo = mudança versionada.

### Skills (lazy)
- Contrato: `SKILL.md` com frontmatter `name` + `description`. Corpo carrega só quando invocada (NFR-5 do custo: overhead residente ≤ 2K tokens, PRD §8.4).
- Skills orquestram agents via subagent dispatch; nunca executam papel de outro agente no contexto principal.

### Hooks (governança determinística)
- `hooks.json` registra `PreToolUse` (governança de push, matcher `Bash`) e `UserPromptSubmit`/`Stop` (medidor de contexto). Cada hook de governança: lê JSON do stdin, decide, `exit 0` (permite) ou `exit 2` + stderr (bloqueia com mensagem ao agente).
- **Padrões obrigatórios:** Node stdlib puro (NFR-1); tolerante a payload ilegível (permite em caso de dúvida de parse — hook nunca pode travar trabalho legítimo não-relacionado); rápido no caminho feliz (NFR-5).
- Medidor de contexto (`context-meter.cjs`): só avisa, nunca bloqueia (sem exit 2/decision/continue:false); no `Stop` emite só `systemMessage`; estado dos marcos em `os.tmpdir()/forge360-context-meter/<session_id>.json`; falha = exit 0 e stdout vazio.
- Status line (`scripts/statusline.cjs`): não é hook; opt-in via `settings.json` do usuário + lançador estável (`statusline-launcher.cjs`, copiado uma vez). Lê o payload da status line, não grava estado, falha = stdout vazio e exit 0.
- Autoridade de push: sinal = prefixo `FORGE_ACTIVE_AGENT=shipper` no comando (mesmo padrão do hook AIOX que o Helder já usa com `AIOX_ACTIVE_AGENT=devops`).

### Validador estrutural (`scripts/validate.cjs`, FR-5)
- Roda local (`node scripts/validate.cjs`) e futuramente em CI.
- Checa: JSON válidos; agents com frontmatter completo e `model` ∈ {haiku, sonnet, opus, fable}; skills com `name`/`description`; hooks referenciados em hooks.json existem e passam `node --check`; scripts da status line existem e passam `node --check`; templates presentes.
- Saída: relatório por item + exit ≠ 0 em qualquer violação (usável como gate de commit).

## Decisões registradas

| # | Decisão | Motivo |
|---|---|---|
| D-1 | Plugin nativo, sem fork do AIOX | ~60% do AIOX compensa lacunas que o Claude Code 2026 fechou |
| D-2 | 6 agentes (não 10) | papel fundido onde a fronteira era artificial; handoff é custo |
| D-3 | Zero deps npm | instalação instantânea, sem supply chain, hooks auditáveis |
| D-4 | Claude Code only | portabilidade multi-IDE era o maior peso morto do AIOX |
| D-5 | Sinal de autoridade via prefixo env no comando | compatível com o hábito já treinado do usuário (AIOX_ACTIVE_AGENT) |
| D-6 | Stories do próprio forge360 em docs/stories/ | dogfooding: o método constrói a si mesmo |
| D-7 | Medidor de contexto via UserPromptSubmit+Stop, só avisa, estado no tmp do SO | FR-10 / Art. IV; nunca trava trabalho, nada gravado em árvore de projeto (CON-3) |
| D-8 | Status line de contexto via payload oficial + lançador de caminho estável copiado uma vez | FR-10(b) / Art. IV (zero tokens); `${CLAUDE_PLUGIN_ROOT}` não expande em `statusLine`, e o diretório de cache muda a cada versão; hook `context-meter` mantido (95% fala com o modelo) |

## Fluxo canônico (SDC)

```
/story ─► planner (opus) ─► story Ready (score ≥ 7)
                                  │
/sdc ───► builder (sonnet) ─► implementação + commit local
                                  │
/gate ──► reviewer (sonnet) ─► PASS ─► shipper (haiku) ─► push + ahead/behind 0/0
                       │ FAIL (máx. 3 ciclos)
                       └────► volta ao builder
```
