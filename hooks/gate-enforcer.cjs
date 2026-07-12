#!/usr/bin/env node
/**
 * forge360 — Constituição Art. III: Gate obrigatório (FR-6 / STORY-1.2)
 *
 * Quando um `git push` / `gh pr create|merge` é detectado E autorizado (shipper),
 * exige que exista pelo menos uma story em entrega (Status InReview|Done) com
 * veredito PASS ou CONCERNS na seção `## Gate`. Sem isso → bloqueia (exit 2).
 *
 * Padrões de hook (architecture.md §Hooks): Node stdlib puro (NFR-1); tolerante a
 * payload ilegível (permite em caso de dúvida); rápido no caminho feliz (NFR-5).
 */
'use strict';

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0); // AC-6: payload ilegível não bloqueia
  }

  const cmd = (data.tool_input && data.tool_input.command) || '';

  // AC-1: só age em push / gh pr; qualquer outro Bash sai na hora (NFR-5).
  const isPush = /\bgit\s+([\w-]+\s+)*push\b/.test(cmd);
  const isPr = /\bgh\s+pr\s+(create|merge)\b/.test(cmd);
  if (!isPush && !isPr) process.exit(0);

  // AC-5: override explícito de emergência (comando ou ambiente).
  const override =
    /(^|\s|;|&&)FORGE_GATE_OVERRIDE=1(\s|;|&&)/.test(cmd) ||
    process.env.FORGE_GATE_OVERRIDE === '1';
  if (override) {
    console.error('[forge360] Gate ignorado por FORGE_GATE_OVERRIDE=1 (escape de emergência).');
    process.exit(0);
  }

  // Só o shipper cruza o gate; push não-autorizado é problema do push-authority.
  const authorized =
    /(^|\s|;|&&)FORGE_ACTIVE_AGENT=shipper(\s|;|&&)/.test(cmd) ||
    process.env.FORGE_ACTIVE_AGENT === 'shipper';
  if (!authorized) process.exit(0);

  // docs/stories/ é relativo ao projeto onde o plugin roda.
  const cwd = data.cwd || process.cwd();
  const storiesDir = path.join(cwd, 'docs', 'stories');

  let arquivos;
  try {
    arquivos = fs.readdirSync(storiesDir).filter((f) => f.endsWith('.story.md'));
  } catch {
    // AC-4: projeto sem docs/stories/ — não adotou o método completo, não bloqueia.
    console.error('[forge360] docs/stories/ ausente — gate não aplicável a este projeto.');
    process.exit(0);
  }

  const comGate = [];
  for (const arq of arquivos) {
    let texto;
    try {
      texto = fs.readFileSync(path.join(storiesDir, arq), 'utf8').replace(/\r\n/g, '\n');
    } catch {
      continue;
    }
    const status = (texto.match(/^\s*\*\*Status:\*\*\s*(\w+)/m) || [])[1] || '';
    if (status !== 'InReview' && status !== 'Done') continue;

    // Extrai o bloco sob "## Gate": do fim do heading até o próximo "## " ou "---" ou fim.
    const heading = texto.match(/^##\s+Gate\s*$/m);
    let blocoGate = '';
    if (heading) {
      const resto = texto.slice(heading.index + heading[0].length);
      const delim = resto.search(/^(?:##\s|---\s*$)/m);
      blocoGate = delim === -1 ? resto : resto.slice(0, delim);
    }
    if (/\b(PASS|CONCERNS)\b/.test(blocoGate)) comGate.push(arq);
  }

  // AC-2: existe story em entrega com veredito → libera.
  if (comGate.length) process.exit(0);

  // AC-3: há stories, mas nenhuma com gate PASS/CONCERNS → bloqueia.
  console.error(
    '[forge360] BLOQUEADO (Constituição Art. III): nenhuma story em entrega tem gate registrado.\n' +
      'Rode a skill /gate (agente reviewer) e registre PASS ou CONCERNS na seção "## Gate" da story\n' +
      '(com Status: InReview ou Done) antes do push. Emergência: prefixe FORGE_GATE_OVERRIDE=1.'
  );
  process.exit(2);
});
