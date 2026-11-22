# forge360

Método enxuto de desenvolvimento orientado a stories para **Claude Code**, empacotado como plugin nativo. Destilação do que funciona no AIOX (story-driven, autoridade de agentes, quality gates) sem a maquinaria que o Claude Code já absorveu (installer, ide-sync, engine de workflow, handoff manual).

## Princípio

> **A metodologia é nossa; a mecânica é do Claude Code.**
> Agentes = subagents nativos. Tasks = skills. Governança = hooks. Memória = memória nativa + 3 arquivos de gestão.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `agents/` | 6 subagents com roteamento de modelo embutido (economia por design) |
| `skills/` | 5 skills: `story`, `gate`, `sdc`, `spec`, `economia` |
| `hooks/` | Governança determinística (push exclusivo do shipper) + medidor de contexto |
| `templates/` | Template de story hiperdetalhada + arquivos de gestão |
| `docs/economia.md` | Doutrina de economia de tokens (preços revisados por versão) |
| `constitution.md` | Princípios inegociáveis |

## Medidor de contexto

O hook `context-meter` avisa uma vez por sessão quando a janela chega a 50%, 75% e 95% (custo zero fora dos marcos). No 95% ele só recomenda fechar a janela (atualizar gestão, commit único, "Suba Git", nova janela); não executa nada.

- Base: `FORGE_CONTEXT_WINDOW` (inteiro, ex.: `1000000`) se definida; senão 1M quando o modelo indicar `[1m]`; senão 200K, passando a 1M se a ocupação exceder 200K (heurística: nas sessões 1M, os avisos de 100K/150K podem vir cedo).
- Se a ocupação cair (ex.: `/compact`), os marcos rearmam.

## Status line de contexto

Opt-in: mostra no rodapé `ctx 62% · 124K/200K` o tempo todo, sem gastar tokens (a status line roda local). Faixas: verde < 50%, amarelo 50–74%, laranja 75–94%, vermelho ≥ 95%. Usa o payload oficial da status line (inclui o tamanho real da janela).

1. Copie **uma vez** o lançador: `scripts/statusline-launcher.cjs` do plugin → `~/.claude/forge360-statusline.cjs`. Ele acha a versão instalada, então sobrevive a updates; só recopie se o próprio lançador mudar.
2. Em `~/.claude/settings.json`:
   `{ "statusLine": { "type": "command", "command": "node ~/.claude/forge360-statusline.cjs" } }`
   (barras normais; se o `~` não expandir no Windows, use `C:/Users/<usuário>/.claude/forge360-statusline.cjs`).

- **Com status line própria:** chame o lançador dentro do seu script repassando o stdin, ex. Bash: `input=$(cat); ctx=$(printf '%s' "$input" | node ~/.claude/forge360-statusline.cjs); echo "$minha_parte | $ctx"`. Cada linha impressa vira uma linha da status line.
- `NO_COLOR` (não vazio) tira as cores; `FORGE_CONTEXT_WINDOW` (inteiro) força a base da janela.
- A status line só aparece em workspace confiável e some com `disableAllHooks: true`.

## Agentes e roteamento de modelo

| Agente | Modelo | Papel |
|---|---|---|
| `planner` | opus | Demanda → story hiperdetalhada validada (funde analyst/pm/po/sm) |
| `architect` | opus | Arquitetura + banco (funde architect/data-engineer) |
| `builder` | sonnet | Implementação da story |
| `reviewer` | sonnet | Quality gate PASS / CONCERNS / FAIL |
| `explorer` | haiku | Exploração/busca barata, somente leitura |
| `shipper` | haiku | Git push e PR — autoridade EXCLUSIVA |

## Fluxo canônico (SDC)

```
/story → planner cria e valida → builder implementa → /gate (reviewer) → shipper entrega
```

## Instalação

```bash
claude plugin install <caminho-ou-repo>/forge360
```

## Origem

Inspirado no [AIOX (SynkraAI/aiox-core)](https://github.com/SynkraAI/aiox-core), MIT. O forge360 reimplementa a metodologia sobre os recursos nativos do Claude Code de 2026.
