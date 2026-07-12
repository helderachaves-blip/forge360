# PLANO DE AÇÃO — forge360

## Estado atual

**Release v0.2 completa** — Épico 1 (3/3) entregue e aprovado em gate (PASS pelo `forge360:reviewer` nativo): STORY-1.1 (validador `scripts/validate.cjs`, FR-5), STORY-1.2 (hook `gate-enforcer.cjs`, FR-6 / Art. III), STORY-1.3 (skill `/onboarding`, FR-7). Plugin instalado e carregado; validador em 20 verificações, zero deps. Cadeia de agentes (builder → reviewer → shipper) e governança determinística (push-authority + gate-enforcer) validadas em produção por dogfooding.

## Em andamento

(nada)

## Pendente (ordem de prioridade)

- [ ] Piloto SDC completo em projeto de cliente (FR-9, release v0.3)
- [ ] Piloto da skill /onboarding num projeto real (validar fallback de templates sem `${CLAUDE_PLUGIN_ROOT}`)
- [ ] Piloto da skill /economia em projeto real

## Bloqueios

(nenhum)

## Próxima sessão

v0.2 fechada. Abrir a release **v0.3**: definir o épico do piloto SDC (FR-9) em projeto de cliente real — usar `/story` para a primeira demanda e rodar o ciclo `/sdc` de ponta a ponta. Antes, decidir com o Helder o projeto-piloto. Ler CLAUDE.md → PRD (§releases) → criar stories.
