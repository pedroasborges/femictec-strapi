#!/usr/bin/env node
import { parseCliArgs, runPlan, fail, toBool, isMainModule } from './lib/common.mjs';

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

async function main() {
  const { flags } = parseCliArgs(process.argv.slice(2));
  const message = flags.message ? String(flags.message) : '';
  const allowEmpty = toBool(flags['allow-empty']);
  const dryRun = toBool(flags['dry-run']);

  const plan = buildPlan({ message, allowEmpty });
  await runPlan(plan, { dryRun });
}

if (isMainModule(import.meta.url, process.argv[1])) {
  main().catch((err) => {
    fail(err.message);
  });
}

