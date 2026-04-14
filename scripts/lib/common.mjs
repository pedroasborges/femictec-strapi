import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function parseCliArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const eqIdx = token.indexOf('=');
    if (eqIdx > -1) {
      const key = token.slice(2, eqIdx);
      const value = token.slice(eqIdx + 1);
      flags[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }

  return { flags, positionals };
}

export function formatCommand(cmd, args = []) {
  return [cmd, ...args].join(' ');
}

export function isMainModule(metaUrl, argv1) {
  if (!argv1) return false;
  const current = fileURLToPath(metaUrl);
  return path.resolve(current) === path.resolve(argv1);
}

export async function runPlan(plan, options = {}) {
  const dryRun = Boolean(options.dryRun);
  const cwd = options.cwd ?? process.cwd();

  for (const step of plan) {
    const rendered = formatCommand(step.cmd, step.args);
    if (dryRun) {
      console.log(`[dry-run] ${rendered}`);
      continue;
    }

    await runCommand(step.cmd, step.args ?? [], {
      cwd,
      env: options.env ?? process.env,
      shell: options.shell ?? false,
    });
  }
}

export function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

export function toBool(value) {
  return value === true || value === 'true' || value === '1';
}

function runCommand(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: 'inherit',
      shell: options.shell,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed with code ${code}: ${formatCommand(cmd, args)}`));
    });
  });
}
