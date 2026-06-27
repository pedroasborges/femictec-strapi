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
  const identityFile = options.identityFile ?? '';
  const sshPort = options.sshPort ?? '';

  if (!host) {
    throw new Error('Missing --host.');
  }
  if (!repo) {
    throw new Error('Missing --repo.');
  }
  if (sshPort && !/^\d+$/.test(String(sshPort))) {
    throw new Error('Invalid --ssh-port. Use numeric port value.');
  }

  const remoteScript = buildRemoteDeployScript({ projectPath, repo, branch, envFile });
  const target = user ? `${user}@${host}` : host;

  const args = [];
  if (identityFile) {
    args.push('-i', identityFile);
  }
  if (sshPort) {
    args.push('-p', String(sshPort));
  }
  args.push(target, remoteScript);

  return [
    {
      cmd: 'ssh',
      args,
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
    identityFile: flags['identity-file'] ? String(flags['identity-file']) : '',
    sshPort: flags['ssh-port'] ? String(flags['ssh-port']) : '',
  });

  await runPlan(plan, { dryRun });
}

if (isMainModule(import.meta.url, process.argv[1])) {
  main().catch((err) => {
    fail(err.message);
  });
}
