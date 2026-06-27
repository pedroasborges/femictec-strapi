#!/usr/bin/env node
import { parseCliArgs, runPlan, fail, toBool, isMainModule, runCommandCapture } from './lib/common.mjs';

export function buildPlan(options = {}) {
  const message = options.message;
  const allowEmpty = Boolean(options.allowEmpty);

  if (!message && !allowEmpty) {
    throw new Error('Missing commit message. Use --message "..." or --allow-empty.');
  }

  const plan = [{ cmd: 'git', args: ['add', '-A'] }];

  if (message) {
    plan.push({ cmd: 'git', args: ['commit', '-m', message] });
  } else {
    plan.push({ cmd: 'git', args: ['commit', '--allow-empty', '-m', 'chore: empty commit'] });
  }

  plan.push({ cmd: 'git', args: ['push'] });
  return plan;
}

export function resolveMessage(flags, positionals) {
  if (flags.message) {
    return String(flags.message).trim();
  }

  const cleaned = (positionals ?? []).filter((item) => !String(item).startsWith('--'));
  if (!cleaned.length) {
    return '';
  }

  if (cleaned[0].toLowerCase() === 'message') {
    return cleaned.slice(1).join(' ').trim();
  }

  return cleaned.join(' ').trim();
}

async function assertHasChangesUnlessAllowEmpty(allowEmpty) {
  if (allowEmpty) {
    return;
  }

  const { stdout } = await runCommandCapture('git', ['status', '--porcelain']);
  if (!stdout) {
    throw new Error('No changes detected to commit.');
  }
}

async function main() {
  const { flags, positionals } = parseCliArgs(process.argv.slice(2));
  const message = resolveMessage(flags, positionals);
  const allowEmpty = toBool(flags['allow-empty']);
  const dryRun = toBool(flags['dry-run']) || positionals.includes('--dry-run');

  if (!dryRun) {
    await assertHasChangesUnlessAllowEmpty(allowEmpty);
  }

  const plan = buildPlan({ message, allowEmpty });
  await runPlan(plan, { dryRun });
}

if (isMainModule(import.meta.url, process.argv[1])) {
  main().catch((err) => {
    fail(err.message);
  });
}
