# Economia de Tokens — Doutrina forge360

> **Fonte de preços:** tabela da Anthropic verificada em **2026-07-11**. Revisar a cada mudança de tabela — este arquivo é versionado justamente para nunca virar um TXT congelado.

## Preços vigentes (por MTok, input/output)

| Modelo | ID | Contexto | Input | Output | Uso no forge360 |
|---|---|---|---|---|---|
| Fable 5 | `claude-fable-5` | 1M | $10,00 | $50,00 | Sob demanda: planejamento/raciocínio longo |
| Opus 4.8 | `claude-opus-4-8` | 1M | $5,00 | $25,00 | planner, architect |
| Sonnet 5 | `claude-sonnet-5` | 1M | $3,00 (promo $2,00 até 31/08/2026) | $15,00 (promo $10,00) | builder, reviewer |
| Haiku 4.5 | `claude-haiku-4-5` | 200K | $1,00 | $5,00 | explorer, shipper |
| Cache read | — | — | ~0,1× do input | — | automático no Claude Code |

## Hierarquia de economia (maior ganho primeiro)

### 1. Não enviar tokens (contexto enxuto)
- Regras com frontmatter `paths:` — carregam só quando arquivos correspondentes são tocados.
- Skills em vez de regras sempre-carregadas — só a descrição fica residente.
- Exploração em subagent (`explorer`) — o dump de buscas/leituras morre no contexto isolado; só a conclusão volta.
- **Uma regra, um lugar.** Duplicação pai/filho de `.claude/` é desperdício fixo por sessão (caso real corrigido em 11/07/2026: 11 regras AIOX duplicadas em DEP-FINANCEIRO/MAT-INE).
- CLAUDE.md curto: contexto permanente vai para `MEMORY.md`; especificação vai para `docs/`.

### 2. Enviar tokens baratos (cache)
- O cache é **prefix-match**: qualquer byte alterado no prefixo invalida tudo depois.
- Não editar CLAUDE.md/settings no meio de uma sessão de trabalho.
- TTL de 5 min: interações encadeadas dentro da janela pagam ~0,1×; sessões esparsas pagam cheio.
- Cache hit ≈ 90% de economia no input — a técnica isolada mais eficaz.

### 3. Usar cérebros baratos (roteamento por papel)
- O frontmatter de cada agente fixa o modelo (ver tabela acima). Regra prática:
  - **haiku** — buscar, listar, executar procedimentos mecânicos (git, glob, grep).
  - **sonnet** — implementar e revisar código (Sonnet 5 ≈ qualidade Opus em código, a 60% do preço, e promo até ago/2026).
  - **opus** — arquitetura, planejamento, decisões caras de errar.
  - **fable** — só quando o horizonte é realmente longo (migração grande, pesquisa profunda) e explicitamente escolhido.
- `effort` baixo para subagents de tarefa simples; alto só onde inteligência paga o custo.

### 4. Não repetir trabalho (memória)
- Memória nativa por projeto + os 3 arquivos de gestão: a sessão nova não re-deriva o que a anterior descobriu.
- Lições de implementação viram nota em memória, não re-investigação.

### 5. Medir
- Claude Code: `/cost` por sessão; observar `cache read` vs `input` cheio.
- Produtos via API: campos `usage`, **Task Budgets** (beta, mínimo 20K tokens) para loops agênticos, `output_config.effort` para profundidade.
- **Atenção (mudança de 2026):** `budget_tokens` foi removido nos modelos atuais (retorna erro 400 no Fable 5/Opus 4.7+/Sonnet 5). O controle é `effort` + Task Budgets.

## Anti-padrões

- ❌ Regras idênticas em `.claude/` de pai e filho (paga 2× por sessão, para sempre).
- ❌ Explorar codebase no contexto principal quando um subagent haiku resolve.
- ❌ Fable 5 para tarefa que Sonnet 5 resolve (16× o custo de output vs Haiku; 3,3× vs Sonnet).
- ❌ Timestamp/UUID interpolado em prompt de sistema (mata o cache silenciosamente).
- ❌ JSON verboso onde TSV/CSV serve (ganho real, porém marginal — otimize os itens 1–3 primeiro).

## Auditoria

Rode `/economia` (skill deste plugin) em qualquer projeto para medir overhead fixo de contexto, detectar regras duplicadas e conferir roteamento de modelo dos agentes.
