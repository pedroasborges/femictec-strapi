import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function parseCliArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--') {
      continue;
    }

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
    if (!key) {
      continue;
    }

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
  const baseEnv = options.env ?? process.env;

  for (const step of plan) {
    const rendered = formatCommand(step.cmd, step.args);
    if (dryRun) {
      console.log(`[dry-run] ${rendered}`);
      continue;
    }

    await runCommand(step.cmd, step.args ?? [], {
      cwd,
      env: { ...baseEnv, ...(step.env ?? {}) },
      shell: options.shell ?? false,
      stdio: 'inherit',
    });
  }
}

export async function runCommandCapture(cmd, args = [], options = {}) {
  const result = await runCommand(cmd, args, {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    shell: options.shell ?? false,
    stdio: 'pipe',
  });

  return {
    code: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
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
      stdio: options.stdio,
      shell: options.shell,
    });

    let stdout = '';
    let stderr = '';

    if (options.stdio === 'pipe') {
      child.stdout?.on('data', (chunk) => {
        stdout += String(chunk);
      });
      child.stderr?.on('data', (chunk) => {
        stderr += String(chunk);
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
        return;
      }
      reject(new Error(`Command failed with code ${code}: ${formatCommand(cmd, args)}${stderr ? `\n${stderr}` : ''}`));
    });
  });
}

