---
name: story
description: Cria e valida uma story de desenvolvimento hiperdetalhada via agente planner. Use quando o usuário pedir para criar story, refinar demanda, planejar feature ou preparar trabalho para implementação.
---

# /story — Criar e validar story

## Fluxo

1. **Colete a demanda** do usuário (argumento da skill ou conversa). Se a demanda for vaga, faça no máximo 2 perguntas objetivas antes de prosseguir.
2. **Despache o agente `planner`** (subagent) com a demanda + caminho do projeto. Instrua-o a:
   - explorar o código relevante (delegando varreduras amplas ao `explorer`);
   - escrever a story em `docs/stories/{epico}.{n}.story.md` usando `templates/story.md` do plugin (copie o template para o projeto se ainda não existir);
   - autovalidar com o checklist de 10 pontos e reportar o score.
3. **Apresente ao usuário:** caminho da story, score, veredito GO (≥7) / NO-GO (<7, com correções listadas).
4. Story GO → status `Ready`. Pergunte se o usuário quer seguir direto para `/sdc` (implementação).

## Regras

- Numeração sequencial dentro do épico; épico default = `1` se o projeto não usa épicos.
- Nunca crie story para trabalho já em andamento sem registrar o estado real.
