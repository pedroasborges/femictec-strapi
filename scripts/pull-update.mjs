#!/usr/bin/env node
import { parseCliArgs, runPlan, fail, toBool, isMainModule } from './lib/common.mjs';

export function buildPlan(options = {}) {
  const branch = options.branch ?? 'main';
  const envFile = options.envFile ?? '.env.production';
  const skipBuild = Boolean(options.skipBuild);

  const plan = [
    { cmd: 'git', args: ['fetch', '--all', '--prune'] },
    { cmd: 'git', args: ['checkout', branch] },
    { cmd: 'git', args: ['pull', '--ff-only', 'origin', branch] },
  ];

  if (!skipBuild) {
    plan.push({ cmd: 'npm', args: ['run', 'build'] });
  }

  plan.push(
    { cmd: 'docker', args: ['compose', '--env-file', envFile, 'build'] },
    { cmd: 'docker', args: ['compose', '--env-file', envFile, 'up', '-d'] },
    { cmd: 'docker', args: ['compose', '--env-file', envFile, 'ps'] },
  );

  return plan;
}

async function main() {
  const { flags } = parseCliArgs(process.argv.slice(2));
  const branch = flags.branch ? String(flags.branch) : 'main';
  const envFile = flags['deploy-env-file'] ? String(flags['deploy-env-file']) : '.env.production';
  const skipBuild = toBool(flags['skip-build']);
  const dryRun = toBool(flags['dry-run']);

  if (!branch) {
    fail('Missing --branch value.');
  }

  const plan = buildPlan({ branch, envFile, skipBuild });
  await runPlan(plan, { dryRun });
}

if (isMainModule(import.meta.url, process.argv[1])) {
  main().catch((err) => {
    fail(err.message);
  });
}
