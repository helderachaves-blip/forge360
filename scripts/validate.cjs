#!/usr/bin/env node
/**
 * forge360 — Validador estrutural do plugin (STORY-1.1 / FR-5)
 *
 * Confere que a estrutura do plugin está íntegra antes de instalar/commitar:
 * plugin.json, frontmatter dos agents, frontmatter das skills, hooks.json +
 * sintaxe dos hooks referenciados, e presença dos templates.
 *
 * Uso:   node scripts/validate.cjs
 * Saída: relatório ✔/✘ por verificação; exit 0 se tudo passa, exit 1 se há falhas.
 *
 * Sem dependências externas (NFR-1): só Node stdlib.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Raiz do plugin = pasta pai de scripts/. Torna o script executável de qualquer cwd.
const ROOT = path.resolve(__dirname, '..');

const MODELOS_VALIDOS = ['haiku', 'sonnet', 'opus', 'fable', 'inherit'];

/** Resultados acumulados: { ok: boolean, label: string, detalhe?: string } */
const resultados = [];

function ok(label) {
  resultados.push({ ok: true, label });
}

function falha(label, detalhe) {
  resultados.push({ ok: false, label, detalhe });
}

/** Lê um arquivo texto; retorna null se não existir/não ler. */
function lerTexto(abs) {
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Parser de frontmatter simples (chave: valor entre delimitadores ---).
 * Tolera CRLF. Retorna objeto {chave: valor} ou null se não houver frontmatter.
 */
function parseFrontmatter(conteudo) {
  const texto = conteudo.replace(/\r\n/g, '\n');
  if (!texto.startsWith('---\n')) return null;
  const fim = texto.indexOf('\n---', 4);
  if (fim === -1) return null;
  const bloco = texto.slice(4, fim);
  const obj = {};
  for (const linha of bloco.split('\n')) {
    const m = linha.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) obj[m[1]] = m[2].trim();
  }
  return obj;
}

function naoVazio(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// ── AC-2: plugin.json ────────────────────────────────────────────────────────
function verificarPluginJson() {
  const rel = '.claude-plugin/plugin.json';
  const texto = lerTexto(path.join(ROOT, rel));
  if (texto === null) return falha(rel, 'arquivo não encontrado');
  let json;
  try {
    json = JSON.parse(texto);
  } catch (e) {
    return falha(rel, `JSON inválido: ${e.message}`);
  }
  const faltando = ['name', 'version', 'description'].filter((k) => !naoVazio(json[k]));
  if (faltando.length) return falha(rel, `campos ausentes/vazios: ${faltando.join(', ')}`);
  ok(rel);
}

// ── AC-3: agents/*.md ────────────────────────────────────────────────────────
function verificarAgents() {
  const dir = path.join(ROOT, 'agents');
  let arquivos;
  try {
    arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return falha('agents/', 'diretório não encontrado');
  }
  if (arquivos.length === 0) return falha('agents/', 'nenhum agente encontrado');
  for (const arq of arquivos) {
    const rel = `agents/${arq}`;
    const texto = lerTexto(path.join(dir, arq));
    const fm = texto && parseFrontmatter(texto);
    if (!fm) {
      falha(rel, 'sem frontmatter válido (--- ... ---)');
      continue;
    }
    const problemas = [];
    if (!naoVazio(fm.name)) problemas.push('name ausente/vazio');
    if (!naoVazio(fm.description)) problemas.push('description ausente/vazio');
    if (!naoVazio(fm.model)) {
      problemas.push('model ausente/vazio');
    } else if (!MODELOS_VALIDOS.includes(fm.model)) {
      problemas.push(`model inválido "${fm.model}" (use: ${MODELOS_VALIDOS.join(', ')})`);
    }
    if (problemas.length) falha(rel, problemas.join('; '));
    else ok(rel);
  }
}

// ── AC-4: skills/*/SKILL.md ──────────────────────────────────────────────────
function verificarSkills() {
  const dir = path.join(ROOT, 'skills');
  let entradas;
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return falha('skills/', 'diretório não encontrado');
  }
  if (entradas.length === 0) return falha('skills/', 'nenhuma skill encontrada');
  for (const ent of entradas) {
    const rel = `skills/${ent.name}/SKILL.md`;
    const texto = lerTexto(path.join(dir, ent.name, 'SKILL.md'));
    if (texto === null) {
      falha(rel, 'SKILL.md não encontrado');
      continue;
    }
    const fm = parseFrontmatter(texto);
    if (!fm) {
      falha(rel, 'sem frontmatter válido');
      continue;
    }
    const problemas = [];
    if (!naoVazio(fm.name)) problemas.push('name ausente/vazio');
    if (!naoVazio(fm.description)) problemas.push('description ausente/vazio');
    if (problemas.length) falha(rel, problemas.join('; '));
    else ok(rel);
  }
}

// ── AC-5: hooks.json + sintaxe dos hooks referenciados ───────────────────────
function verificarHooks() {
  const rel = 'hooks/hooks.json';
  const texto = lerTexto(path.join(ROOT, rel));
  if (texto === null) return falha(rel, 'arquivo não encontrado');
  let json;
  try {
    json = JSON.parse(texto);
  } catch (e) {
    return falha(rel, `JSON inválido: ${e.message}`);
  }
  ok(rel);

  // Extrai caminhos de arquivos .cjs/.js dos comandos registrados.
  const grupos = (json.hooks && json.hooks.PreToolUse) || [];
  const referenciados = [];
  for (const grupo of grupos) {
    for (const h of grupo.hooks || []) {
      const cmd = (h && h.command) || '';
      const matches = cmd.match(/[^\s"']+\.c?js/g) || [];
      referenciados.push(...matches);
    }
  }
  if (referenciados.length === 0) {
    falha('hooks/hooks.json', 'nenhum arquivo de hook referenciado nos comandos');
    return;
  }
  for (const ref of referenciados) {
    const relHook = ref.replace('${CLAUDE_PLUGIN_ROOT}', '.').replace(/\\/g, '/');
    const abs = path.resolve(ROOT, ref.replace('${CLAUDE_PLUGIN_ROOT}', ROOT));
    if (!fs.existsSync(abs)) {
      falha(relHook, 'arquivo de hook referenciado não existe');
      continue;
    }
    try {
      execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' });
      ok(`${relHook} (node --check)`);
    } catch (e) {
      const msg = (e.stderr && e.stderr.toString().trim().split('\n').slice(-1)[0]) || e.message;
      falha(`${relHook} (node --check)`, msg);
    }
  }
}

// ── AC-6: templates ──────────────────────────────────────────────────────────
function verificarTemplates() {
  const obrigatorios = [
    'templates/story.md',
    'templates/gestao/MEMORY.md',
    'templates/gestao/PLANO_DE_ACAO.md',
    'templates/gestao/ROADMAP.md',
  ];
  for (const rel of obrigatorios) {
    if (fs.existsSync(path.join(ROOT, rel))) ok(rel);
    else falha(rel, 'template obrigatório ausente');
  }
}

// ── Execução + relatório (AC-1, AC-7) ────────────────────────────────────────
function main() {
  verificarPluginJson();
  verificarAgents();
  verificarSkills();
  verificarHooks();
  verificarTemplates();

  console.log('forge360 — validação estrutural\n');
  for (const r of resultados) {
    const marca = r.ok ? '✔' : '✘';
    const detalhe = r.ok ? '' : `  — ${r.detalhe}`;
    console.log(`  ${marca} ${r.label}${detalhe}`);
  }

  const falhas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length} verificações, ${falhas} falha(s).`);
  process.exit(falhas ? 1 : 0);
}

main();
