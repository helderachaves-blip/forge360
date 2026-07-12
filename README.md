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
| `hooks/` | Governança determinística (push exclusivo do shipper) |
| `templates/` | Template de story hiperdetalhada + arquivos de gestão |
| `docs/economia.md` | Doutrina de economia de tokens (preços revisados por versão) |
| `constitution.md` | Princípios inegociáveis |

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
