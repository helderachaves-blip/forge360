---
name: onboarding
description: Bootstrap do método 360IA num projeto de cliente — cria os 3 arquivos de gestão a partir dos templates, docs/stories/ e um CLAUDE.md mínimo. Use quando o usuário pedir "iniciar projeto", "bootstrap", "onboarding de cliente" ou preparar um projeto novo para o fluxo forge360.
---

# /onboarding — Bootstrap de projeto de cliente

Prepara o primeiro minuto de um projeto novo da 360IA: estrutura mínima do método, sem inventar conteúdo. É uma skill de **instruções** — você (agente principal) executa com Read/Write/Bash nativos.

## Proteção anti-recursão (AC-7) — faça primeiro

Antes de qualquer coisa, confira se o diretório alvo **não é o próprio plugin forge360**: se existir `.claude-plugin/plugin.json` na raiz alvo E seu campo `name` for `forge360` (ou a pasta for o repositório do plugin), **RECUSE** com uma linha explicando que o `/onboarding` roda em projetos de cliente, não no plugin. Não crie nada.

## Fluxo

1. **Nome do projeto (AC-2):** derive do nome da pasta raiz. Se ambíguo (genérico como `app`, `temp`, `novo`), pergunte ao usuário o nome real. Guarde como `{Nome do Projeto}`.

2. **Localize os templates do plugin.** Use `${CLAUDE_PLUGIN_ROOT}/templates/` quando a variável estiver disponível. Fallback: localize a instalação do plugin (`claude plugin list` / diretório de plugins) e use `<raiz-do-plugin>/templates/`. Os arquivos-fonte são:
   - `templates/gestao/MEMORY.md`
   - `templates/gestao/PLANO_DE_ACAO.md`
   - `templates/gestao/ROADMAP.md`

3. **Arquivos de gestão (AC-2):** para cada um dos 3, se **não existir** na raiz alvo, leia o template, substitua `{Nome do Projeto}` pelo nome real e escreva na raiz. Se **já existir**, **PULE** (ver AC-5).

4. **docs/stories/ (AC-3):** se não existir, crie o diretório e um `docs/stories/.gitkeep` vazio (para versionar a pasta). Se já existir, pule.

5. **CLAUDE.md do projeto (AC-4):** se a raiz alvo **não** tiver `CLAUDE.md`, crie-o a partir do bloco-modelo abaixo, com `{Nome do Projeto}` preenchido. Se já existir, **NUNCA sobrescreva** — pule.

6. **Resumo (AC-6):** ao final, liste o que foi **criado** e o que foi **pulado** (já existia), e aponte o próximo passo: rodar `/story` para transformar a primeira demanda do cliente em story validada.

## Regra de idempotência (AC-5)

Arquivo/diretório que já existe **nunca** é sobrescrito nem mesclado — é registrado como "pulado (já existe)" no resumo. Rodar `/onboarding` duas vezes é seguro e não destrói trabalho.

## Bloco-modelo do `CLAUDE.md` de cliente (copie e preencha `{Nome do Projeto}`)

Mantenha curto (≤ 40 linhas). Contexto permanente vai para `MEMORY.md`, não aqui (Constituição Art. IV — economia por design).

```markdown
# CLAUDE.md — {Nome do Projeto}

Projeto da CONSULTORIA 360IA. Responder sempre em português do Brasil.

## Orientação de sessão — leia primeiro

Ao iniciar qualquer janela de contexto, leia os 3 arquivos de gestão na raiz — fonte única de verdade do estado:

| Arquivo | Função |
|---|---|
| `MEMORY.md` | Contexto permanente (pessoas, stack, arquitetura, decisões) |
| `PLANO_DE_ACAO.md` | Sprint atual — pendente, em andamento, próxima sessão |
| `ROADMAP.md` | Entregas ✅, pendências 🔲, insights 💡 |

Specs técnicas (stories) ficam em `docs/stories/` — não são gestão.

## Fluxo de trabalho (plugin forge360)

1. Demanda vira story validada: `/story` (use `/spec` antes se for grande/ambígua).
2. Ciclo completo da story: `/sdc` (planner → builder → reviewer → shipper).
3. Gate de qualidade avulso: `/gate` (agente reviewer, veredito PASS/CONCERNS/FAIL).
4. **Push é exclusivo do shipper** (Constituição Art. II), sinalizado por `FORGE_ACTIVE_AGENT=shipper`.

## Regras

- Modelo 1: nunca gravar hash de commit ou status de push nos arquivos de gestão — git é a verdade.
- Ao entregar: marque a story e atualize `PLANO_DE_ACAO.md` e `ROADMAP.md` no mesmo commit do código.
```

## Fora do escopo

Não faça `git init`, não configure remoto/MCP, não crie stories de conteúdo, não instale o plugin. O `/onboarding` só monta o esqueleto do método.
