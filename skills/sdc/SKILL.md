---
name: sdc
description: Ciclo completo de desenvolvimento de uma story (Story Development Cycle) — planner valida, builder implementa, reviewer aplica gate, shipper entrega. Use para executar uma story de ponta a ponta.
---

# /sdc — Story Development Cycle

Fluxo canônico do forge360: `story → build → gate → ship`.

## Fluxo

1. **Story:** localize a story alvo (argumento ou a `Ready` mais antiga). Não existe? Rode primeiro o fluxo de `/story`.
2. **Build:** despache o agente `builder` com o caminho da story. Ele implementa, testa localmente, atualiza checkboxes e File List, e commita localmente.
3. **Gate:** rode o fluxo de `/gate` sobre o resultado.
   - FAIL → volte ao passo 2 com os defeitos (máx. 3 ciclos; depois escale ao humano).
   - CONCERNS → confirme com o usuário antes de seguir.
4. **Gestão:** atualize `PLANO_DE_ACAO.md` e `ROADMAP.md` do projeto (entrega vira ✅). **Nunca escreva hash/status de push** (Constituição Art. VI). Essas edições entram no mesmo commit da entrega.
5. **Ship:** com autorização do usuário para push, despache o agente `shipper` (sequência canônica dele: commit único se pendente → push com `FORGE_ACTIVE_AGENT=shipper` → `git fetch` + ahead/behind → **reportar** no chat).
6. **Encerramento:** story vira `Done`; reporte hash e sincronia (lidos do git, nunca gravados).

## Regras

- Cada fase roda no seu agente — não misture papéis no contexto principal.
- Interrompido no meio? O estado fica legível na própria story (checkboxes + seção Gate) — a próxima sessão retoma de lá.
