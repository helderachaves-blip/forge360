# Constituição forge360

Princípios que gates automáticos e agentes devem respeitar. Violação bloqueia a operação.

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | Story-Driven | MUST |
| II | Autoridade de Push | NON-NEGOTIABLE |
| III | Gate antes de Ship | MUST |
| IV | Economia por Design | MUST |
| V | Não-Invenção | MUST |
| VI | Git é a Verdade (Modelo 1) | NON-NEGOTIABLE |

## Artigo I — Story-Driven

Todo desenvolvimento nasce de uma story em `docs/stories/`. A story é o pacote completo de contexto: o builder abre 1 arquivo e sabe **o quê**, **como** e **porquê**. Sem story validada (score ≥ 7), não há implementação.

## Artigo II — Autoridade de Push

`git push`, `gh pr create` e `gh pr merge` são exclusivos do agente **shipper**. Hook determinístico bloqueia qualquer outro caminho. Nenhum agente — nem o principal — contorna isso.

## Artigo III — Gate antes de Ship

Nenhuma entrega sem veredito do reviewer: **PASS** entrega; **CONCERNS** entrega com registro; **FAIL** volta ao builder (máx. 3 iterações, depois escala ao humano). O gate usa as ferramentas nativas (`/code-review`, `/verify`, lint, typecheck, testes).

## Artigo IV — Economia por Design

1. Toda skill é lazy — carrega só quando invocada.
2. Toda regra de contexto usa `paths:` — nunca carga incondicional.
3. Exploração roda no **explorer** (subagent haiku) — o contexto principal não engorda.
4. Cada regra existe em **um único lugar** — duplicação de contexto é bug.
5. Modelo por papel: o frontmatter de cada agente fixa o modelo mais barato que resolve.
6. Detalhes e preços: `docs/economia.md`.

## Artigo V — Não-Invenção

Toda afirmação em spec/story rastreia a um requisito (FR-*, NFR-*, CON-*) ou achado de pesquisa. Funcionalidade inventada é rejeitada no gate.

## Artigo VI — Git é a Verdade (Modelo 1)

Arquivos de gestão (`MEMORY.md`, `PLANO_DE_ACAO.md`, `ROADMAP.md`) registram **o que foi entregue** — nunca hash de commit nem status de push. Essas informações são lidas do git ao vivo. Status de entrega entra no **mesmo commit** do código. Confirmação de push é reportada no chat (`git fetch` + ahead/behind = 0/0), nunca gravada em arquivo.
