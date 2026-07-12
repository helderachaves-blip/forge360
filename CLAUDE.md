# CLAUDE.md — forge360

Projeto **interno** da CONSULTORIA 360IA (DEP-TI). Plugin nativo do Claude Code com o método da consultoria. Responda sempre em português do Brasil.

## ⚡ Orientação de sessão — leia primeiro

Ao iniciar qualquer janela de contexto, leia os 3 arquivos de gestão na raiz — fonte única de verdade do estado:

| Arquivo | Função |
|---|---|
| `MEMORY.md` | Contexto permanente (o que é o projeto, decisões, stack) |
| `PLANO_DE_ACAO.md` | Sprint atual — pendente, em andamento, próxima sessão |
| `ROADMAP.md` | Entregas ✅, pendências 🔲, insights 💡 |

Depois, para implementar: **PRD** em `docs/prd.md` → **arquitetura** em `docs/architecture.md` → **stories** em `docs/stories/` (pegue a `Ready` de menor número).

## Regras de trabalho

1. **Story-driven (dogfooding):** só implemente o que uma story `Ready` especifica. Sem story? Crie/valide primeiro (template em `templates/story.md`, checklist de 10 pontos, GO ≥ 7).
2. **Constituição é lei:** `constitution.md` — em especial Art. II (push só do shipper), Art. IV (economia por design), Art. V (não inventar funcionalidade), Art. VI (nunca gravar hash/status de push nos arquivos de gestão).
3. **Zero dependências npm** (NFR-1): hooks e scripts usam só Node stdlib (>=18). Se sentir necessidade de uma lib, pare e registre no ROADMAP como insight.
4. **Rastreabilidade** (CON-4): toda decisão de implementação rastreia a FR-*, NFR-* ou CON-* do PRD. Achou lacuna no PRD? Não invente — registre e pergunte.
5. **Ao entregar:** marque checkboxes e File List na story; atualize `PLANO_DE_ACAO.md` e `ROADMAP.md` na mesma sessão (entrega vira ✅). Tudo num único commit com o código (Modelo 1).
6. **Validação local:** antes de declarar concluído, rode `node --check` em todo `.cjs` tocado e `node scripts/validate.cjs` (quando existir — STORY-1.1 o cria).
7. **Commits:** Conventional Commits em pt-BR com ID da story: `feat: validador estrutural do plugin [STORY-1.1]`.
8. **Fronteira:** nada deste projeto vai para árvores de cliente (`F:\DADOS\CONSULTORIA\...`), e vice-versa.

## Comandos úteis

```bash
node scripts/validate.cjs          # validador estrutural (após STORY-1.1)
node --check hooks/*.cjs           # sintaxe dos hooks
node hooks/push-authority.cjs < payload.json   # teste manual de hook (exit 0/2)
```

## Testando hooks sem disparar o hook da própria sessão

Comandos de teste **não devem conter o literal "git push"** (hooks de push da sessão pattern-matcham o texto). Grave payloads JSON em arquivos e redirecione via stdin, como no exemplo acima.
