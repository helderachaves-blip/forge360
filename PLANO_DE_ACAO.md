# PLANO DE AÇÃO — forge360

## Estado atual

Scaffold v0.1.0 completo + documentação de produto pronta: PRD (`docs/prd.md`), arquitetura (`docs/architecture.md`), CLAUDE.md de sessão e **3 stories Ready** do épico 1 (release v0.2). O projeto está pronto para sessão de implementação com modelo executor (Opus).

## Em andamento

(nada)

## Pendente (ordem de prioridade)

- [ ] **STORY-1.1** — Validador estrutural `scripts/validate.cjs` (FR-5) — `docs/stories/1.1.story.md`
- [ ] **STORY-1.2** — Hook gate-enforcer (FR-6) — depende da 1.1 — `docs/stories/1.2.story.md`
- [ ] **STORY-1.3** — Skill /onboarding (FR-7) — depende da 1.1 — `docs/stories/1.3.story.md`
- [ ] Testar instalação do plugin num projeto real (FR-1)
- [ ] Piloto SDC completo (FR-9, release v0.3)
- [ ] Decidir repositório remoto (GitHub) — decisão do Helder

## Bloqueios

(nenhum)

## Próxima sessão

Abrir o Claude Code **neste diretório** e implementar na ordem: STORY-1.1 → 1.2 → 1.3 (todas `Ready`, contexto completo embutido). Ler CLAUDE.md → PRD → story. Ao final de cada story: gate + atualização de gestão no mesmo commit.
