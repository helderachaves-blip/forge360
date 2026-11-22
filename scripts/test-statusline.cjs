#!/usr/bin/env node
/**
 * forge360 — testes da status line de contexto (STORY-2.3, AC-2..AC-9, AC-12).
 * Node stdlib puro. Temporários via fs.mkdtempSync, removidos no fim.
 * Sem o literal do subcomando de push no código (CLAUDE.md).
 * Uso: node scripts/test-statusline.cjs  (exit 0 só se todos os casos passarem)
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'statusline.cjs');
const LAUNCHER = path.join(ROOT, 'scripts', 'statusline-launcher.cjs');
const BASE = fs.mkdtempSync(path.join(os.tmpdir(), 'f360-sl-'));

const rows = [];
function check(caso, esperado, obtido, ok) {
  rows.push({ caso, esperado: JSON.stringify(esperado), obtido: JSON.stringify(obtido), ok: !!ok });
}
const eq = (caso, esperado, obtido) => check(caso, esperado, obtido, esperado === obtido);

// O env parte de process.env e remove as variáveis que o usuário pode ter definido.
function run(alvo, entrada, env = {}) {
  const e = Object.assign({}, process.env);
  for (const v of ['NO_COLOR', 'FORGE_CONTEXT_WINDOW', 'CLAUDE_CODE_PLUGIN_CACHE_DIR']) delete e[v];
  Object.assign(e, env);
  const input = typeof entrada === 'string' ? entrada : JSON.stringify(entrada);
  const t0 = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [alvo], { input, env: e, encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
}
const semEsc = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
// Formato real do payload (T-1, Claude Code 2.1.330): total_input_tokens, current_usage, used_percentage...
const pl = (c) => ({ version: '2.1.330', context_window: c, exceeds_200k_tokens: false });
const cw = (P, T, size = 200000) => pl({ total_input_tokens: T, total_output_tokens: 800, context_window_size: size, used_percentage: P, remaining_percentage: 100 - P });

const VERDE = '\x1b[32m';
const AMARELO = '\x1b[33m';
const LARANJA = '\x1b[38;5;208m';
const VERMELHO = '\x1b[1;31m';
const RESET = '\x1b[0m';

// ── AC-2: bordas de faixa ───────────────────────────────────────────────────
const bordas = [
  [0, 'ctx 0%', VERDE], [49, 'ctx 49%', VERDE], [49.9, 'ctx 49%', VERDE],
  [50, 'ctx 50%', AMARELO], [74, 'ctx 74%', AMARELO],
  [75, 'ctx 75%', LARANJA], [94, 'ctx 94%', LARANJA], [94.99, 'ctx 94%', LARANJA],
  [95, 'ctx 95%', VERMELHO], [100, 'ctx 100%', VERMELHO],
];
for (const [P, txt, c] of bordas) {
  const r = run(SCRIPT, cw(P, 0));
  eq(`AC-2 P=${P} texto`, txt, semEsc(r.out).replace(/\n$/, ''));
  check(`AC-2 P=${P} cor + reset`, JSON.stringify(c) + '...reset', r.out, r.out.startsWith(c) && r.out.endsWith(RESET + '\n'));
}

// ── AC-3: formato ───────────────────────────────────────────────────────────
eq('AC-3 62% 124K/200K', 'ctx 62% · 124K/200K\n', semEsc(run(SCRIPT, cw(62, 124000)).out));
eq('AC-3 50% 500K/1M', 'ctx 50% · 500K/1M\n', semEsc(run(SCRIPT, cw(50, 500000, 1000000)).out));
const real = {
  context_window: {
    total_input_tokens: 105326, total_output_tokens: 823, context_window_size: 1000000,
    current_usage: { input_tokens: 2, output_tokens: 823, cache_creation_input_tokens: 1577, cache_read_input_tokens: 103747 },
    used_percentage: 11, remaining_percentage: 89,
  },
  exceeds_200k_tokens: false,
};
eq('AC-3 payload real da T-1 (11% 105K/1M)', 'ctx 11% · 105K/1M\n', semEsc(run(SCRIPT, real).out));

// ── AC-4: fallback de cálculo ───────────────────────────────────────────────
{
  const r = run(SCRIPT, pl({ used_percentage: null, total_input_tokens: 150000, context_window_size: 200000 }));
  eq('AC-4 fallback texto', 'ctx 75% · 150K/200K\n', semEsc(r.out));
  check('AC-4 fallback laranja', LARANJA, r.out, r.out.startsWith(LARANJA));
  const u = run(SCRIPT, pl({ used_percentage: null, context_window_size: 200000, current_usage: { input_tokens: 1000, cache_read_input_tokens: 99000, cache_creation_input_tokens: 0, output_tokens: 5000 } }));
  eq('AC-4 current_usage input-only', 'ctx 50% · 100K/200K\n', semEsc(u.out));
}

// ── AC-5: override ──────────────────────────────────────────────────────────
{
  const p = pl({ total_input_tokens: 500000, used_percentage: 99, context_window_size: 200000 });
  const r = run(SCRIPT, p, { FORGE_CONTEXT_WINDOW: '1000000' });
  eq('AC-5 override texto', 'ctx 50% · 500K/1M\n', semEsc(r.out));
  check('AC-5 override amarelo', AMARELO, r.out, r.out.startsWith(AMARELO));
  const sem = run(SCRIPT, p).out;
  for (const v of ['abc', '0', '']) eq(`AC-5 override inválido "${v}" ignorado`, sem, run(SCRIPT, p, { FORGE_CONTEXT_WINDOW: v }).out);
}

// ── AC-6: NO_COLOR ──────────────────────────────────────────────────────────
{
  const r = run(SCRIPT, cw(95, 0), { NO_COLOR: '1' });
  check('AC-6 NO_COLOR=1 sem ESC', 'sem ESC', r.out, !r.out.includes('\x1b'));
  eq('AC-6 NO_COLOR=1 texto', 'ctx 95%\n', r.out);
  const v = run(SCRIPT, cw(95, 0), { NO_COLOR: '' });
  check('AC-6 NO_COLOR="" colorido', VERMELHO, v.out, v.out.includes(VERMELHO));
}

// ── AC-7: saídas neutras ────────────────────────────────────────────────────
const neutras = [
  ['{}', '{}', 'ctx --\n'],
  ['dado nulo', '{"context_window":{"used_percentage":null,"total_input_tokens":0,"current_usage":null}}', 'ctx --\n'],
  ['sem base', '{"context_window":{"used_percentage":40}}', 'ctx 40%\n'],
  ['stdin vazio', '', ''],
  ['não-json', 'não-json', ''],
  ['[]', '[]', ''],
  ['null', 'null', ''],
  ['42', '42', ''],
  ['context_window string', '{"context_window":"x"}', 'ctx --\n'],
];
for (const [nome, entrada, esperado] of neutras) {
  const r = run(SCRIPT, entrada);
  eq(`AC-7 ${nome} (saída)`, esperado, semEsc(r.out));
  check(`AC-7 ${nome} (exit 0, stderr vazio)`, '0 / vazio', `${r.code} / ${JSON.stringify(r.err)}`, r.code === 0 && r.err === '');
}
{
  const b = run(SCRIPT, '{"context_window":{"used_percentage":40}}');
  check('AC-7 sem base é verde', VERDE, b.out, b.out.startsWith(VERDE));
  const n = run(SCRIPT, '{}');
  check('AC-7 ctx -- sem ESC', 'sem ESC', n.out, !n.out.includes('\x1b'));
}

// ── AC-8 / AC-9: lançador ───────────────────────────────────────────────────
function cache(conteudo) {
  const d = fs.mkdtempSync(path.join(BASE, 'cache-'));
  if (conteudo !== undefined) fs.writeFileSync(path.join(d, 'installed_plugins.json'), typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo));
  return d;
}
function plugin(marcador) {
  const d = fs.mkdtempSync(path.join(BASE, 'plug-'));
  fs.mkdirSync(path.join(d, 'scripts'));
  if (marcador) fs.writeFileSync(path.join(d, 'scripts', 'statusline.cjs'), `exports.render = () => ${JSON.stringify(marcador)};`);
  return d;
}
const ent = (scope, installPath) => ({ scope, installPath, version: 'x' });
const doLancador = (d, input = cw(62, 124000)) => run(LAUNCHER, input, { CLAUDE_CODE_PLUGIN_CACHE_DIR: d });
const inexistente = path.join(BASE, 'nao-existe');

{
  const direto = run(SCRIPT, cw(62, 124000)).out;
  const r = doLancador(cache({ version: 2, plugins: { 'forge360@forge360': [ent('user', ROOT)] } }));
  eq('AC-8 lançador == script', direto, r.out);
  check('AC-8 exit 0', 0, r.code, r.code === 0);

  const falhas = {
    'installed_plugins.json ausente': cache(),
    'JSON inválido': cache('{nope'),
    'sem a chave forge360@forge360': cache({ plugins: { 'outro@x': [ent('user', ROOT)] } }),
    'installPath inexistente': cache({ plugins: { 'forge360@forge360': [ent('user', inexistente)] } }),
    'statusline.cjs ausente no installPath': cache({ plugins: { 'forge360@forge360': [ent('user', plugin(null))] } }),
  };
  for (const [nome, d] of Object.entries(falhas)) {
    const f = doLancador(d);
    check(`AC-9 ${nome}`, 'exit 0, stdout vazio', `${f.code} / ${JSON.stringify(f.out)}`, f.code === 0 && f.out === '');
  }
  const duas = doLancador(cache({ plugins: { 'forge360@forge360': [ent('project', plugin('PROJETO')), ent('user', plugin('USUARIO'))] } }));
  eq('AC-9 prefere scope user', 'USUARIO', duas.out);
  const soProj = doLancador(cache({ plugins: { 'forge360@forge360': [ent('user', inexistente), ent('project', plugin('PROJETO'))] } }));
  eq('AC-9 sem user existente usa a primeira existente', 'PROJETO', soProj.out);
}

// ── Latência (informativa, alvo < 200 ms) ───────────────────────────────────
const mediana = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const cacheLat = cache({ plugins: { 'forge360@forge360': [ent('user', ROOT)] } });
const lat = {
  'statusline.cjs': mediana(Array.from({ length: 5 }, () => run(SCRIPT, cw(62, 124000)).ms)),
  'statusline-launcher.cjs': mediana(Array.from({ length: 5 }, () => doLancador(cacheLat).ms)),
};

// ── Relatório ───────────────────────────────────────────────────────────────
fs.rmSync(BASE, { recursive: true, force: true });
console.log('forge360 — testes da status line\n');
for (const r of rows) console.log(`  ${r.ok ? '✔' : '✘'} ${r.caso}${r.ok ? '' : `\n      esperado: ${r.esperado}\n      obtido:   ${r.obtido}`}`);
const nFalhas = rows.filter((r) => !r.ok).length;
console.log(`\n${rows.length} casos, ${nFalhas} falha(s).`);
for (const [n, ms] of Object.entries(lat)) console.log(`latência (mediana de 5) ${n}: ${ms.toFixed(0)} ms (alvo < 200 ms, informativo)`);
process.exit(nFalhas ? 1 : 0);
