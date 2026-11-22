#!/usr/bin/env node
/**
 * forge360 — Lançador de caminho estável da status line (STORY-2.3, D-D)
 *
 * Copiar UMA vez para ~/.claude/forge360-statusline.cjs. Acha a versão instalada do
 * plugin em installed_plugins.json e delega a scripts/statusline.cjs dessa versão.
 * Qualquer falha: stdout vazio, exit 0. Node stdlib puro (NFR-1).
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

try {
  const raiz = process.env.CLAUDE_CODE_PLUGIN_CACHE_DIR || path.join(os.homedir(), '.claude', 'plugins');
  const instalados = JSON.parse(fs.readFileSync(path.join(raiz, 'installed_plugins.json'), 'utf8'));
  const entradas = ((instalados.plugins || {})['forge360@forge360'] || []).filter((e) => e && e.installPath && fs.existsSync(e.installPath));
  const entrada = entradas.find((e) => e.scope === 'user') || entradas[0];
  if (entrada) {
    let payload;
    try {
      payload = JSON.parse(fs.readFileSync(0, 'utf8'));
    } catch {
      payload = undefined;
    }
    const { render } = require(path.join(entrada.installPath, 'scripts', 'statusline.cjs'));
    process.stdout.write(render(payload, process.env));
  }
} catch {
  /* falha silenciosa */
}
process.exit(0);
