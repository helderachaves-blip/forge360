#!/usr/bin/env node
/**
 * forge360 — Status line de contexto (FR-10(b) / STORY-2.3, Art. IV / NFR-3)
 *
 * Lê o JSON da status line no stdin e imprime uma linha `ctx 62% · 124K/200K`,
 * colorida por faixa (verde < 50, amarelo 50-74, laranja 75-94, vermelho >= 95).
 * Fonte = payload oficial (context_window), sem transcript (D-A). Não consome tokens
 * e não grava nada (CON-3). Falha silenciosa: exit 0, stderr vazio, nunca lança.
 * Node stdlib puro (NFR-1).
 */
'use strict';

const RESET = '\x1b[0m';
const k = (n) => Math.round(n / 1000) + 'K'; // igual a context-meter.cjs
const num = (v) => typeof v === 'number' && Number.isFinite(v);

function cor(p) {
  if (p >= 95) return '\x1b[1;31m';
  if (p >= 75) return '\x1b[38;5;208m';
  if (p >= 50) return '\x1b[33m';
  return '\x1b[32m';
}

function formatarBase(base) {
  return base % 1000000 === 0 ? base / 1000000 + 'M' : k(base);
}

function render(payload, env) {
  try {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return '';
    env = env || {};
    const cw = payload.context_window && typeof payload.context_window === 'object' ? payload.context_window : {};

    // tokens: fórmula input-only da doc (D-B)
    let tokens;
    if (num(cw.total_input_tokens)) tokens = cw.total_input_tokens;
    else {
      const u = cw.current_usage && typeof cw.current_usage === 'object' ? cw.current_usage : {};
      tokens = [u.input_tokens, u.cache_creation_input_tokens, u.cache_read_input_tokens].reduce((s, v) => s + (num(v) ? v : 0), 0);
    }

    // override FORGE_CONTEXT_WINDOW: mesma regra do hook (context-meter.cjs)
    const ov = env.FORGE_CONTEXT_WINDOW;
    const override = ov && /^\d+$/.test(String(ov).trim()) && Number(ov) > 0 ? Number(ov) : 0;
    const tamanho = num(cw.context_window_size) && cw.context_window_size > 0 ? cw.context_window_size : 0;
    const base = override || tamanho;

    let pct = null;
    if (override && tokens > 0) pct = (tokens / override) * 100;
    else if (num(cw.used_percentage)) pct = cw.used_percentage;
    else if (tokens > 0 && tamanho) pct = (tokens / tamanho) * 100;

    if (pct === null) return 'ctx --\n';

    const p = Math.max(0, Math.floor(pct));
    const texto = base && tokens > 0 ? `ctx ${p}% · ${k(tokens)}/${formatarBase(base)}` : `ctx ${p}%`;
    if (env.NO_COLOR) return texto + '\n';
    return cor(p) + texto + RESET + '\n';
  } catch {
    return '';
  }
}

module.exports = { render };

if (require.main === module) {
  try {
    let raw = '';
    try {
      raw = require('fs').readFileSync(0, 'utf8');
    } catch {
      /* stdin ausente */
    }
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = undefined;
    }
    process.stdout.write(render(payload, process.env));
  } catch {
    /* falha silenciosa */
  }
  process.exit(0);
}
