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

- Plugin Claude Code puro: Markdown (agents/skills/templates) + hooks Node (`push-authority`, `gate-enforcer`, `context-meter`). Sem dependências npm.

## Arquitetura

- **6 agentes** com modelo fixado no frontmatter: planner (opus), architect (opus), builder (sonnet), reviewer (sonnet), explorer (haiku), shipper (haiku).
- **5 skills:** story, gate, sdc, spec, economia.
- **Medidor de contexto (FR-10):** hook `context-meter` em UserPromptSubmit+Stop alerta 50/75/95% da janela; base 200K, heurística >200K ⇒ 1M, override `FORGE_CONTEXT_WINDOW`; estado em `os.tmpdir()/forge360-context-meter/`.
- **Instalação real:** o Claude Code roda a cópia em cache (`~/.claude/plugins/cache/forge360/forge360/<versão>`). Mudança só chega aos projetos após subir `version` no plugin.json + `claude plugin marketplace update forge360` + `claude plugin update forge360@forge360` + nova sessão.
- **Governança:** hook PreToolUse bloqueia `git push`/`gh pr` sem `FORGE_ACTIVE_AGENT=shipper`.
- **Constituição:** 6 artigos (constitution.md). Art. IV = Economia por Design; Art. VI = Modelo 1.

## Decisões permanentes

- 2026-07-11: nome **forge360** escolhido pelo Helder; local `F:\DADOS\UTEIS\CONSULTORIA_360IA\DEP-TI\CLAUDE\forge360`.
- 2026-07-11: **remoto definido** — `origin` = https://github.com/helderachaves-blip/forge360.git.
- 2026-07-11: **instalação** via marketplace local — `.claude-plugin/marketplace.json` (entrada única apontando `source: "./"`); `claude plugin marketplace add <path>` + `claude plugin install forge360@forge360`. Componentes só aparecem na interface após reiniciar a sessão.
- Metodologia própria em vez de fork do AIOX: agents = subagents nativos; tasks = skills; ~60% do AIOX é compensação histórica de recursos que hoje são nativos.
- Preços de modelos vivem em `docs/economia.md` (versionado, revisado a cada mudança da Anthropic) — nunca em TXT solto.
