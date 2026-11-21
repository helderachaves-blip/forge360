#!/usr/bin/env node
/**
 * forge360 — testes do hook context-meter (STORY-2.2, AC-3..AC-17, AC-2 regressão).
 * Node stdlib puro. os.tmpdir() isolado por mkdtemp (TEMP/TMP/TMPDIR no env do hook).
 * Sem o literal do subcomando de push no código (CLAUDE.md): o ritual é comparado por trechos.
 * Uso: node scripts/test-context-meter.cjs  (exit 0 só se todos os casos passarem)
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOOK = path.join(ROOT, 'hooks', 'context-meter.cjs');
const BASE = fs.mkdtempSync(path.join(os.tmpdir(), 'f360-cm-'));
const TMP = path.join(BASE, 'tmp'); // os.tmpdir() do hook
const CWD = path.join(BASE, 'cwd'); // cwd do payload (não pode receber nada)
fs.mkdirSync(TMP);
fs.mkdirSync(CWD);

let seq = 0;
const rows = [];
function check(caso, esperado, obtido, ok) {
  rows.push({ caso, esperado: String(esperado), obtido: String(obtido), ok: !!ok });
}

function asst(total, extra = {}) {
  return JSON.stringify(
    Object.assign(
      { type: 'assistant', isSidechain: false, message: { model: 'claude-opus-5', usage: { input_tokens: 2, cache_read_input_tokens: total - 2 - 100, cache_creation_input_tokens: 0, output_tokens: 100 } } },
      extra
    )
  );
}
const user = () => JSON.stringify({ type: 'user', message: { content: 'oi' } });

function transcript(linhas, nome) {
  const f = path.join(BASE, `t${++seq}-${nome || 'x'}.jsonl`);
  fs.writeFileSync(f, linhas.join('\n') + '\n');
  return f;
}

function run(payload, env = {}, bruto) {
  const e = Object.assign({}, process.env, { TEMP: TMP, TMP: TMP, TMPDIR: TMP }, env);
  delete e.FORGE_CONTEXT_WINDOW;
  Object.assign(e, env);
  const t0 = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [HOOK], { input: bruto !== undefined ? bruto : JSON.stringify(payload), env: e, encoding: 'utf8' });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let json = null;
  try {
    json = r.stdout ? JSON.parse(r.stdout) : null;
  } catch {
    /* stdout inválido => json null e stdout não vazio */
  }
  return { code: r.status, out: r.stdout, json, ms };
}

const sessoes = [];
function sid(p = 's') {
  const id = `${p}-${process.pid}-${++seq}`;
  sessoes.push(id);
  return id;
}
const pay = (id, f, evento = 'UserPromptSubmit') => ({ session_id: id, transcript_path: f, cwd: CWD, hook_event_name: evento });
const estadoDe = (id) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(TMP, 'forge360-context-meter', id + '.json'), 'utf8'));
  } catch {
    return null;
  }
};
const vazio = (r) => r.code === 0 && r.out === '';

// ── AC-3..AC-7: marcos na base 200K ─────────────────────────────────────────
{
  const id = sid();
  const f = (n) => transcript([user(), asst(n), user()], 'm');
  let r = run(pay(id, f(90000)));
  check('AC-3 45% silêncio', 'exit0 stdout vazio, sem estado', `exit${r.code} out="${r.out}" estado=${estadoDe(id)}`, vazio(r) && estadoDe(id) === null);

  r = run(pay(id, f(100000)));
  const m = r.json && r.json.systemMessage;
  check('AC-4 50% aviso', 'systemMessage 50% ~100K de 200K, sem additionalContext', m, r.code === 0 && m && /50%/.test(m) && /100K de 200K/.test(m) && !r.json.hookSpecificOutput);
  r = run(pay(id, f(100000)));
  check('AC-4 50% repetido', 'stdout vazio', `out="${r.out}"`, vazio(r));

  r = run(pay(id, f(150000)));
  check('AC-5 75% aviso', 'systemMessage 75%, sem additionalContext', r.out, r.json && /75%/.test(r.json.systemMessage) && !r.json.hookSpecificOutput);
  r = run(pay(id, f(150000)));
  check('AC-5 75% repetido', 'stdout vazio', `out="${r.out}"`, vazio(r));

  r = run(pay(id, f(190000)));
  const h = r.json && r.json.hookSpecificOutput;
  const ac = (h && h.additionalContext) || '';
  check(
    'AC-6 95% usuário+modelo',
    'systemMessage 95% + additionalContext propor/não executar',
    r.out,
    r.json && /95%/.test(r.json.systemMessage) && /nova janela/.test(r.json.systemMessage) && h && h.hookEventName === 'UserPromptSubmit' &&
      /PROPONHA/.test(ac) && /MEMORY\.md/.test(ac) && /commit único/.test(ac) && ac.includes('pu' + 'sh') && /shipper/.test(ac) && /NÃO execute/.test(ac)
  );
  r = run(pay(id, f(190000)));
  check('AC-6 95% repetido', 'stdout vazio', `out="${r.out}"`, vazio(r));
}
{
  const id = sid();
  const f = transcript([asst(160000)], 'm80');
  let r = run(pay(id, f));
  const st = estadoDe(id);
  check('AC-7 80% uma mensagem (75%)', 'systemMessage 75%, estado [50,75]', `${r.out} estado=${JSON.stringify(st && st.disparados)}`, r.json && /75%/.test(r.json.systemMessage) && st && st.disparados.join() === '50,75');
  r = run(pay(id, f));
  check('AC-7 repetido', 'stdout vazio', `out="${r.out}"`, vazio(r));
}

// ── AC-8, AC-9: Stop ────────────────────────────────────────────────────────
{
  const id = sid();
  let r = run(pay(id, transcript([asst(100000)], 's'), 'Stop'));
  const keys = r.json ? Object.keys(r.json).join() : '';
  check('AC-8 Stop 50%', 'só systemMessage', r.out, r.json && keys === 'systemMessage');

  const id2 = sid();
  const f = transcript([asst(190000)], 's95');
  run(pay(id2, transcript([asst(150000)], 's75'), 'Stop')); // marca 50 e 75
  r = run(pay(id2, f, 'Stop'));
  const st = estadoDe(id2);
  check('AC-9 Stop 95%', 'só systemMessage 95%, pendente=true', `${r.out} pend=${st && st.pendenteModelo95}`, r.json && Object.keys(r.json).join() === 'systemMessage' && /95%/.test(r.json.systemMessage) && st.pendenteModelo95 === true);
  r = run(pay(id2, f));
  const st2 = estadoDe(id2);
  check(
    'AC-9 UPS seguinte',
    'só additionalContext, pendente=false',
    r.out,
    r.json && Object.keys(r.json).join() === 'hookSpecificOutput' && /PROPONHA/.test(r.json.hookSpecificOutput.additionalContext) && st2.pendenteModelo95 === false
  );
  r = run(pay(id2, f));
  check('AC-9 terceiro payload', 'stdout vazio', `out="${r.out}"`, vazio(r));
}

// ── AC-10, AC-11: base da janela ────────────────────────────────────────────
{
  let r = run(pay(sid(), transcript([asst(190000)], 'b')), { FORGE_CONTEXT_WINDOW: '1000000' });
  check('AC-10 1M override 19%', 'stdout vazio', `out="${r.out}"`, vazio(r));
  r = run(pay(sid(), transcript([asst(500000)], 'b')), { FORGE_CONTEXT_WINDOW: '1000000' });
  check('AC-10 1M override 50%', 'aviso 50% de 1000K', r.out, r.json && /50%/.test(r.json.systemMessage) && /de 1000K/.test(r.json.systemMessage));
  for (const v of ['abc', '0']) {
    r = run(pay(sid(), transcript([asst(190000)], 'b')), { FORGE_CONTEXT_WINDOW: v });
    check(`AC-10 inválido "${v}" ignorado`, 'base 200K => aviso 95%', r.out, r.json && /95%/.test(r.json.systemMessage) && /de 200K/.test(r.json.systemMessage));
  }
  // AC-11: a T-1 não achou indicador de 1M no transcript real (L-1) => testa o indicador defensivo [1m] e o fallback.
  const l1m = asst(190000, { message: { model: 'claude-opus-5[1m]', usage: { input_tokens: 190000, output_tokens: 0 } } });
  r = run(pay(sid(), transcript([l1m], 'b1m')));
  check('AC-11 indicador [1m] no modelo', 'base 1M, 190K => vazio', `out="${r.out}"`, vazio(r));
  r = run(pay(sid(), transcript([asst(300000)], 'fb')));
  check('AC-11 fallback ocupação>200K', 'base 1M (30%) => vazio', `out="${r.out}"`, vazio(r));
  r = run(pay(sid(), transcript([asst(600000)], 'fb')));
  check('AC-11 fallback 600K', 'aviso 50% de 1000K', r.out, r.json && /50%/.test(r.json.systemMessage) && /de 1000K/.test(r.json.systemMessage));
}

// ── AC-12: rearme ───────────────────────────────────────────────────────────
{
  const id = sid();
  run(pay(id, transcript([asst(150000)], 'r')));
  let r = run(pay(id, transcript([asst(60000)], 'r')));
  const st = estadoDe(id);
  check('AC-12 queda 30%', 'stdout vazio, estado []', `out="${r.out}" estado=${JSON.stringify(st && st.disparados)}`, vazio(r) && st && st.disparados.length === 0);
  r = run(pay(id, transcript([asst(100000)], 'r')));
  check('AC-12 volta a 50%', 'aviso 50%', r.out, r.json && /50%/.test(r.json.systemMessage));
}

// ── AC-13: isolamento ───────────────────────────────────────────────────────
{
  const f = transcript([asst(100000)], 'i');
  const a = sid('A');
  const b = sid('B');
  const antes = fs.readdirSync(CWD).join();
  run(pay(a, f));
  const rb = run(pay(b, f));
  check('AC-13 sessões independentes', 'B recebe aviso', rb.out, rb.json && /50%/.test(rb.json.systemMessage));
  const mal = '../x-' + process.pid;
  run(pay(mal, f));
  const dir = path.join(TMP, 'forge360-context-meter');
  const fora = fs.existsSync(path.join(TMP, 'x-' + process.pid + '.json')) || fs.existsSync(path.join(dir, '..', 'x-' + process.pid + '.json'));
  const saneado = fs.readdirSync(dir).some((n) => n.startsWith('___x-'));
  check('AC-13 session_id com ../', 'grava só dentro do dir de estado', `fora=${fora} saneado=${saneado}`, !fora && saneado);
  check('AC-13 cwd intocado', 'listagem igual', fs.readdirSync(CWD).join(), fs.readdirSync(CWD).join() === antes);
}

// ── AC-14, AC-16 ────────────────────────────────────────────────────────────
{
  const f = transcript([asst(100000), asst(190000, { isSidechain: true }), JSON.stringify({ type: 'assistant', isSidechain: false, message: { usage: { input_tokens: 0, output_tokens: 0 } } }), user()], 'sc');
  const r = run(pay(sid(), f));
  check('AC-14 sidechain e soma 0 ignorados', 'ocupação 100K (aviso 50%)', r.out, r.json && /50%/.test(r.json.systemMessage));
  const trunc = path.join(BASE, 'trunc.jsonl');
  fs.writeFileSync(trunc, 'PARCIAL-sem-json"}}\n' + [asst(100000), user()].join('\n') + '\n{"type":"assistant","message":{"usage":{"input_tok');
  const r2 = run(pay(sid(), trunc));
  check('AC-16 linha final truncada', 'usa última linha completa (50%)', r2.out, r2.json && /50%/.test(r2.json.systemMessage));
}

// ── AC-15: robustez ─────────────────────────────────────────────────────────
{
  const id = sid();
  const casos = [
    ['payload ilegível', run(null, {}, '{nao json')],
    ['payload vazio', run(null, {}, '')],
    ['transcript_path ausente', run({ session_id: id, hook_event_name: 'Stop' })],
    ['arquivo inexistente', run(pay(id, path.join(BASE, 'nao-existe.jsonl')))],
    ['transcript vazio', run(pay(id, transcript([], 'vazio')))],
    ['só linhas inválidas', run(pay(id, transcript(['xx', '{{', '[1'], 'inv')))],
    ['sem assistente com usage', run(pay(id, transcript([user(), JSON.stringify({ type: 'assistant', message: {} })], 'nu')))],
    ['evento desconhecido', run(Object.assign(pay(id, transcript([asst(190000)], 'ev')), { hook_event_name: 'PostToolUse' }))],
  ];
  // diretório de estado não gravável: TEMP aponta para dentro de um arquivo comum
  const arq = path.join(BASE, 'arquivo-comum');
  fs.writeFileSync(arq, 'x');
  const naoGrav = run(pay(sid(), transcript([asst(190000)], 'ng')), { TEMP: arq, TMP: arq, TMPDIR: arq });
  casos.push(['estado não gravável', naoGrav]);
  for (const [nome, r] of casos) check(`AC-15 ${nome}`, 'exit0 stdout vazio', `exit${r.code} out="${r.out}"`, vazio(r));
}

// ── AC-17: transcript grande + latência ─────────────────────────────────────
{
  const grande = path.join(BASE, 'grande.jsonl');
  const linha = JSON.stringify({ type: 'user', message: { content: 'x'.repeat(1000) } }) + '\n';
  const fd = fs.openSync(grande, 'w');
  const bloco = linha.repeat(1000);
  for (let i = 0; i < 21; i++) fs.writeSync(fd, bloco);
  fs.writeSync(fd, asst(100000) + '\n');
  fs.closeSync(fd);
  const tam = fs.statSync(grande).size;
  const r = run(pay(sid(), grande));
  check(`AC-17 transcript ${(tam / 1048576).toFixed(0)} MB`, '≥20MB, aviso 50% (lê só o final)', `${(tam / 1048576).toFixed(1)}MB ${r.out}`, tam >= 20 * 1048576 && r.json && /50%/.test(r.json.systemMessage));
  const mediana = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const semAviso = transcript([asst(90000)], 'lat');
  const t1 = [];
  const t2 = [];
  for (let i = 0; i < 5; i++) {
    t1.push(run(pay(sid(), semAviso)).ms);
    t2.push(run(pay(sid(), grande)).ms);
  }
  console.log(`Latência (mediana de 5, informativa, alvo <200ms): sem aviso=${mediana(t1).toFixed(0)}ms; transcript grande=${mediana(t2).toFixed(0)}ms`);
}

// ── AC-2: regressão do validador (cópia temporária com hook plantado sob Stop) ─
{
  const copia = path.join(BASE, 'plugin');
  fs.mkdirSync(copia);
  for (const d of fs.readdirSync(ROOT)) {
    if (d === '.git' || d === 'node_modules') continue;
    fs.cpSync(path.join(ROOT, d), path.join(copia, d), { recursive: true });
  }
  const val = () => spawnSync(process.execPath, [path.join(copia, 'scripts', 'validate.cjs')], { encoding: 'utf8' });
  const v0 = val();
  const hj = path.join(copia, 'hooks', 'hooks.json');
  const j = JSON.parse(fs.readFileSync(hj, 'utf8'));
  j.hooks.Stop.push({ hooks: [{ type: 'command', command: 'node "${CLAUDE_PLUGIN_ROOT}/hooks/inexistente.cjs"' }] });
  fs.writeFileSync(hj, JSON.stringify(j));
  const v1 = val();
  const vezes = (v0.stdout.match(/context-meter\.cjs \(node --check\)/g) || []).length;
  check('AC-2 validador limpo', 'exit 0, context-meter 1x no relatório', `exit${v0.status} ocorrências=${vezes}`, v0.status === 0 && vezes === 1);
  check('AC-2 hook plantado sob Stop', 'exit 1', `exit${v1.status}`, v1.status === 1);
}

// ── Relatório ───────────────────────────────────────────────────────────────
for (const id of sessoes) {
  try {
    fs.rmSync(path.join(TMP, 'forge360-context-meter', id + '.json'), { force: true });
  } catch {
    /* ignora */
  }
}
fs.rmSync(BASE, { recursive: true, force: true });

const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));
console.log(`${pad('', 3)}${pad('Caso', 34)}${pad('Esperado', 40)}Obtido`);
for (const r of rows) console.log(`${r.ok ? 'OK ' : 'XX '}${pad(r.caso, 34)}${pad(r.esperado, 40)}${r.obtido.replace(/\s+/g, ' ').slice(0, 90)}`);
const falhas = rows.filter((r) => !r.ok).length;
console.log(`\n${rows.length} casos, ${falhas} falha(s).`);
process.exit(falhas ? 1 : 0);
