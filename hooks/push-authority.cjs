#!/usr/bin/env node
/**
 * forge360 — Constituição Art. II: Autoridade de Push
 * Bloqueia `git push` e `gh pr create/merge` fora do agente shipper.
 * O shipper sinaliza autoridade prefixando o comando com FORGE_ACTIVE_AGENT=shipper.
 */
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch {
    process.exit(0); // sem payload legível, não bloqueia
  }

  const cmd = (data.tool_input && data.tool_input.command) || '';

  const isPush = /\bgit\s+([\w-]+\s+)*push\b/.test(cmd);
  const isPr = /\bgh\s+pr\s+(create|merge)\b/.test(cmd);
  if (!isPush && !isPr) process.exit(0);

  const authorized =
    /(^|\s|;|&&)FORGE_ACTIVE_AGENT=shipper(\s|;|&&)/.test(cmd) ||
    process.env.FORGE_ACTIVE_AGENT === 'shipper';

  if (authorized) process.exit(0);

  console.error(
    '[forge360] BLOQUEADO (Constituição Art. II): git push / gh pr é exclusivo do agente shipper.\n' +
      'Delegue ao shipper, que executa com o prefixo FORGE_ACTIVE_AGENT=shipper.'
  );
  process.exit(2); // exit 2 = bloqueia a ferramenta e devolve o stderr ao agente
});
