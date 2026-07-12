# MEMORY — forge360

> Contexto permanente do projeto. Nunca gravar hash de commit ou status de push (Modelo 1).

## O que é

Plugin nativo do Claude Code com o método de desenvolvimento da CONSULTORIA 360IA: story-driven, autoridade de agentes, quality gates e **economia de tokens por design**. Destilação do AIOX (SynkraAI/aiox-core, MIT) sem a maquinaria que o Claude Code 2026 já absorveu.

## Pessoas

| Papel | Nome |
|---|---|
| Dono / arquiteto | Helder (gerente@ineprotec.com.br) |
| Primeiro cliente do método | Edilvo Sousa (projetos DEP-FINANCEIRO) |

## Stack

- Plugin Claude Code puro: Markdown (agents/skills/templates) + 1 hook Node (`hooks/push-authority.cjs`). Sem dependências npm.

## Arquitetura

- **6 agentes** com modelo fixado no frontmatter: planner (opus), architect (opus), builder (sonnet), reviewer (sonnet), explorer (haiku), shipper (haiku).
- **5 skills:** story, gate, sdc, spec, economia.
- **Governança:** hook PreToolUse bloqueia `git push`/`gh pr` sem `FORGE_ACTIVE_AGENT=shipper`.
- **Constituição:** 6 artigos (constitution.md). Art. IV = Economia por Design; Art. VI = Modelo 1.

## Decisões permanentes

- 2026-07-11: nome **forge360** escolhido pelo Helder; local `F:\DADOS\UTEIS\CONSULTORIA_360IA\DEP-TI\CLAUDE\forge360`.
- Metodologia própria em vez de fork do AIOX: agents = subagents nativos; tasks = skills; ~60% do AIOX é compensação histórica de recursos que hoje são nativos.
- Preços de modelos vivem em `docs/economia.md` (versionado, revisado a cada mudança da Anthropic) — nunca em TXT solto.
