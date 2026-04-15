#!/usr/bin/env node
import { parseCliArgs, runPlan, fail, toBool, isMainModule } from './lib/common.mjs';
import { buildRemoteDeployScript } from './lib/ssh.mjs';

export function buildPlan(options = {}) {
  const host = options.host;
  const user = options.user ?? '';
  const projectPath = options.projectPath ?? '/opt/femictec';
  const repo = options.repo;
  const branch = options.branch ?? 'main';
  const envFile = options.envFile ?? '.env.production';

  if (!host) {
    throw new Error('Missing --host.');
  }
  if (!repo) {
    throw new Error('Missing --repo.');
  }

  const remoteScript = buildRemoteDeployScript({ projectPath, repo, branch, envFile });
  const target = user ? `${user}@${host}` : host;

  return [
    {
      cmd: 'ssh',
      args: [target, remoteScript],
    },
  ];
}

async function main() {
  const { flags } = parseCliArgs(process.argv.slice(2));
  const dryRun = toBool(flags['dry-run']);

  const plan = buildPlan({
    host: flags.host ? String(flags.host) : '',
    user: flags.user ? String(flags.user) : '',
    projectPath: flags.path ? String(flags.path) : '/opt/femictec',
    repo: flags.repo ? String(flags.repo) : '',
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
