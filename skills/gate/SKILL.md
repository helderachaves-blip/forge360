---
name: gate
description: Executa o quality gate de uma story implementada via agente reviewer, com veredito PASS/CONCERNS/FAIL. Use após implementação, antes de qualquer entrega/push.
---

# /gate — Quality gate

## Fluxo

1. Identifique a story alvo (argumento ou a story `InProgress` mais recente em `docs/stories/`).
2. **Despache o agente `reviewer`** (subagent) com: caminho da story, diff relevante (`git diff` ou branch), e instrução de rodar o checklist de 7 pontos do seu perfil.
3. **Registre o veredito na story** (seção Gate): PASS / CONCERNS (com ressalvas) / FAIL (com defeitos concretos: cenário de falha + arquivo:linha).
4. **Roteie:**
   - PASS → informe que está liberado para o `shipper`.
   - CONCERNS → pergunte ao usuário se aceita entregar com as ressalvas registradas.
   - FAIL → devolva os defeitos ao `builder` (ou ao usuário). Máximo 3 iterações gate↔builder; na 4ª, escale ao humano com histórico.

## Regras

- O veredito vem do reviewer em contexto isolado — não revise no contexto principal.
- Complemente com as ferramentas nativas quando fizer sentido: `/code-review` para bugs, `/verify` para exercitar o fluxo real.
