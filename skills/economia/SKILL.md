---
name: economia
description: Auditoria de economia de tokens do projeto atual — mede overhead fixo de contexto, detecta regras duplicadas, confere roteamento de modelo dos agentes e emite relatório com plano de correção. Use quando o usuário pedir auditoria de custo, economia de tokens ou otimização de contexto.
---

# /economia — Auditoria de custo de contexto

Aplica a doutrina de `docs/economia.md` (do plugin) ao projeto atual. Referência conceitual: hierarquia de 5 níveis (não enviar > cache > roteamento > memória > medir).

## Passo 1 — Inventário do overhead fixo

Liste tudo que carrega em TODA sessão do projeto:

1. `CLAUDE.md` global (`~/.claude/CLAUDE.md`), do projeto e de diretórios pais.
2. `.claude/rules/*.md` do projeto **e de todos os diretórios pais** — regras sem frontmatter `paths:` carregam sempre.
3. `MEMORY.md` da memória automática.

Para cada arquivo: tamanho em bytes e estimativa de tokens (≈ bytes/4 para pt/en; refine com `wc -c`). Some o total.

## Passo 2 — Detecção de duplicação

Compare regras/CLAUDE.md entre projeto e pais (`diff -q`). Arquivos idênticos em dois níveis = desperdício 2× por sessão. Recomende manter no nível mais amplo que realmente precisa e remover os demais (verifique antes se outros subprojetos dependem do nível pai).

## Passo 3 — Regras sem `paths:`

Liste regras carregadas incondicionalmente que só interessam a partes do código (ex.: regra de banco carregando em sessão de frontend). Recomende adicionar frontmatter `paths:`.

## Passo 4 — Roteamento de modelo

Para cada agente em `.claude/agents/` (projeto e global): tem `model:` no frontmatter? O modelo é o mais barato que resolve o papel? (exploração → haiku; implementação/revisão → sonnet; arquitetura/planejamento → opus). Agente sem `model:` herda o principal — geralmente caro demais para papéis mecânicos.

## Passo 5 — Relatório

Emita tabela-resumo:

| Item | Situação | Custo estimado/sessão | Correção |
|---|---|---|---|

E um plano de correção priorizado pelo ganho. **Peça confirmação do usuário antes de aplicar qualquer remoção** — especialmente em `.claude/` de diretórios pais compartilhados.

## Regras

- Estimativas de tokens são aproximações — declare isso no relatório.
- Nunca delete regra sem confirmar que é duplicata exata (`diff`) e que o outro nível permanece.
