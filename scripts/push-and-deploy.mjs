#!/usr/bin/env node
import { parseCliArgs, runPlan, fail, toBool, isMainModule } from './lib/common.mjs';
import { buildPlan as buildPushPlan } from './push-git.mjs';
import { buildPlan as buildDeployPlan } from './deploy-cloud.mjs';

export function buildPlan(options = {}) {
  const message = options.message;
  const host = options.host;
  const user = options.user;
  const repo = options.repo;
  const path = options.path ?? '/opt/femictec';
  const branch = options.branch ?? 'main';
  const envFile = options.envFile ?? '.env.production';

  const plan = [
    { cmd: 'npm', args: ['run', 'test:scripts'] },
    { cmd: 'npm', args: ['run', 'build'] },
    ...buildPushPlan({ message }),
    ...buildDeployPlan({ host, user, repo, projectPath: path, branch, envFile }),
  ];

  return plan;
}

async function main() {
  const { flags } = parseCliArgs(process.argv.slice(2));
  const dryRun = toBool(flags['dry-run']);

  const plan = buildPlan({
    message: flags.message ? String(flags.message) : '',
    host: flags.host ? String(flags.host) : '',
    user: flags.user ? String(flags.user) : '',
    repo: flags.repo ? String(flags.repo) : '',
    path: flags.path ? String(flags.path) : '/opt/femictec',
    branch: flags.branch ? String(flags.branch) : 'main',
    envFile: flags['deploy-env-file'] ? String(flags['deploy-env-file']) : '.env.production',
  });

  await runPlan(plan, { dryRun });
}

if (isMainModule(import.meta.url, process.argv[1])) {
  main().catch((err) => {
    fail(err.message);
  });
}
