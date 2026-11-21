#!/usr/bin/env node
/**
 * forge360 — Medidor de contexto (FR-10 / STORY-2.2, Art. IV)
 *
 * Eventos: UserPromptSubmit e Stop. Lê o final do transcript, calcula a ocupação da
 * janela pela última resposta do assistente (conversa principal) e avisa UMA vez por
 * marco (50/75/95%) por sessão. Só avisa: nunca bloqueia, nunca força continuação
 * (D-D: sem exit 2, decision, continue:false). No Stop emite só `systemMessage`.
 *
 * Padrões de hook (architecture.md §Hooks): Node stdlib puro (NFR-1); falha silenciosa
 * (exit 0 e stdout vazio em qualquer erro); rápido (NFR-5, lê só o final do arquivo);
 * estado fora do projeto, em os.tmpdir() (CON-3). Código autocontido (D-L).
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const MARCOS = [50, 75, 95];
const TRECHO_INICIAL = 256 * 1024;
const TRECHO_MAXIMO = 2 * 1024 * 1024;

function sair(saida) {
  if (saida) {
    try {
      process.stdout.write(JSON.stringify(saida));
    } catch {
      /* silencioso */
    }
  }
  process.exit(0);
}

// Última entrada válida (D-E, AC-14) dentro de um buffer; null se não houver.
function ultimaEntradaValida(texto, inicioDoArquivo) {
  const linhas = texto.split('\n');
  if (!inicioDoArquivo) linhas.shift(); // primeira linha pode estar cortada (AC-16)
  for (let i = linhas.length - 1; i >= 0; i--) {
    const l = linhas[i].trim();
    if (!l) continue;
    let j;
    try {
      j = JSON.parse(l);
    } catch {
      continue; // linha truncada/inválida (AC-16)
    }
    if (!j || j.type !== 'assistant' || j.isSidechain === true) continue;
    const u = j.message && j.message.usage;
    if (!u || typeof u !== 'object') continue;
    const n = (v) => (typeof v === 'number' && v > 0 ? v : 0);
    const soma =
      n(u.input_tokens) + n(u.cache_read_input_tokens) + n(u.cache_creation_input_tokens) + n(u.output_tokens);
    if (soma > 0) return { ocupacao: soma, modelo: String((j.message && j.message.model) || '') };
  }
  return null;
}

function lerTranscript(arquivo) {
  const fd = fs.openSync(arquivo, 'r');
  try {
    const tamanho = fs.fstatSync(fd).size;
    for (let trecho = TRECHO_INICIAL; ; trecho *= 2) {
      const len = Math.min(trecho, tamanho);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, tamanho - len);
      const achado = ultimaEntradaValida(buf.toString('utf8'), len === tamanho);
      if (achado) return achado;
      if (len === tamanho || trecho >= TRECHO_MAXIMO) return null;
    }
  } finally {
    fs.closeSync(fd);
  }
}

function baseDaJanela(ocupacao, modelo, payload) {
  const env = process.env.FORGE_CONTEXT_WINDOW;
  if (env && /^\d+$/.test(env.trim()) && Number(env) > 0) return Number(env); // D-B.1
  if (/\[1m\]/i.test(modelo) || /\[1m\]/i.test(String((payload && payload.model) || ''))) return 1000000; // D-B.2
  return ocupacao > 200000 ? 1000000 : 200000; // L-1: heurística provisória
}

const k = (n) => Math.round(n / 1000) + 'K';

function mensagens(marco, ocupacao, base) {
  const uso = `${k(ocupacao)} de ${k(base)}`;
  if (marco === 95) {
    return {
      usuario: `[forge360] ATENÇÃO: contexto em ~95% (${uso} tokens). Salve o projeto e abra uma nova janela.`,
      modelo:
        '[forge360] O contexto da sessão passou de 95%. Na próxima resposta, PROPONHA ao usuário o fechamento de janela: ' +
        'atualizar MEMORY.md/PLANO_DE_ACAO.md/ROADMAP.md, commit único (Modelo 1), push pelo shipper ("Suba Git") e abrir uma nova janela. ' +
        'NÃO execute nada disso sem pedido explícito do usuário.',
    };
  }
  if (marco === 75) {
    return { usuario: `[forge360] Contexto em ~75% (${uso}). Planeje fechar esta janela em breve.` };
  }
  return { usuario: `[forge360] Contexto em ~50% (${uso} tokens).` };
}

function main(input) {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return sair();
  }
  if (!payload || typeof payload !== 'object') return sair();
  const evento = payload.hook_event_name;
  if (evento !== 'UserPromptSubmit' && evento !== 'Stop') return sair();
  if (typeof payload.transcript_path !== 'string' || !payload.transcript_path) return sair();

  const medida = lerTranscript(payload.transcript_path);
  if (!medida) return sair();

  const base = baseDaJanela(medida.ocupacao, medida.modelo, payload);
  const pct = (medida.ocupacao / base) * 100;

  const sid = String(payload.session_id || 'sem-sessao').replace(/[^A-Za-z0-9_-]/g, '_');
  const dir = path.join(os.tmpdir(), 'forge360-context-meter');
  const arquivo = path.join(dir, sid + '.json');

  let estado = { disparados: [], pendenteModelo95: false };
  try {
    const lido = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    if (lido && Array.isArray(lido.disparados)) {
      estado = { disparados: lido.disparados.filter((m) => MARCOS.includes(m)), pendenteModelo95: lido.pendenteModelo95 === true };
    }
  } catch {
    /* estado vazio */
  }
  const original = JSON.stringify(estado);

  // D-J: rearme quando a ocupação cai abaixo de marcos já disparados.
  estado.disparados = estado.disparados.filter((m) => m <= pct);
  if (pct < 95) estado.pendenteModelo95 = false;

  let saida = null;
  if (evento === 'UserPromptSubmit' && estado.pendenteModelo95 && pct >= 95) {
    // D-G: entrega só a instrução ao modelo, sem repetir o aviso ao usuário.
    estado.pendenteModelo95 = false;
    saida = { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: mensagens(95, medida.ocupacao, base).modelo } };
  } else {
    const novos = MARCOS.filter((m) => m <= pct && !estado.disparados.includes(m));
    if (novos.length) {
      const maior = novos[novos.length - 1]; // D-H
      estado.disparados = Array.from(new Set(estado.disparados.concat(novos))).sort((a, b) => a - b);
      const msg = mensagens(maior, medida.ocupacao, base);
      saida = { systemMessage: msg.usuario };
      if (maior === 95) {
        if (evento === 'UserPromptSubmit') {
          saida.hookSpecificOutput = { hookEventName: 'UserPromptSubmit', additionalContext: msg.modelo };
        } else {
          estado.pendenteModelo95 = true; // D-D/D-G: Stop não instrui o modelo
        }
      }
    }
  }

  if (JSON.stringify(estado) !== original) {
    // D-F: gravação atômica; falha => silêncio (evita repetir o aviso a cada turno).
    try {
      fs.mkdirSync(dir, { recursive: true });
      const tmp = arquivo + '.' + process.pid + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(estado));
      fs.renameSync(tmp, arquivo);
    } catch {
      return sair();
    }
  }
  return sair(saida);
}

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    main(input);
  } catch {
    process.exit(0);
  }
});
process.stdin.on('error', () => process.exit(0));
