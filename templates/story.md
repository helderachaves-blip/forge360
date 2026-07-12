# STORY-{EPICO}.{N}: {Título}

**Status:** Draft | Ready | InProgress | InReview | Done
**Épico:** {nome ou —}
**Criada em:** {AAAA-MM-DD}
**Score de validação:** {n}/10

## Por quê (contexto de negócio)

{2–4 frases: qual problema real isto resolve e para quem. Rastreável à demanda do usuário.}

## O quê (escopo)

{Descrição objetiva da entrega. O que ESTÁ e o que NÃO está no escopo.}

## Critérios de aceite

- [ ] AC-1: {comportamento verificável}
- [ ] AC-2: {…}

## Como (orientação técnica)

{Contexto embutido para o builder não redescobrir nada:}

- Arquivos relevantes: `caminho/arquivo.ext:linha` — {por que importa}
- Padrões a seguir: {convenções do projeto aplicáveis}
- Restrições: {CON-* herdadas de spec, se houver}

## Tasks

- [ ] T-1: {passo de implementação}
- [ ] T-2: {…}
- [ ] T-final: lint + typecheck + testes verdes

## File List

{Mantida pelo builder: todo arquivo criado/modificado}

## Gate

{Preenchido pelo reviewer: veredito + data + ressalvas/defeitos}

---

## Checklist de validação (planner — 1 ponto cada)

1. [ ] Por quê rastreável à demanda real
2. [ ] Escopo com fronteira explícita (o que NÃO entra)
3. [ ] ACs verificáveis objetivamente
4. [ ] Arquivos/linhas reais citados
5. [ ] Padrões do projeto referenciados
6. [ ] Tasks em ordem executável
7. [ ] Tamanho: entregável em 1 ciclo (senão, dividir)
8. [ ] Sem funcionalidade inventada (Art. V)
9. [ ] Dependências/bloqueios declarados
10. [ ] Critério de teste/verificação claro

**GO ≥ 7 | NO-GO < 7 (listar correções)**
