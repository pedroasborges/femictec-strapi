import assert from 'node:assert/strict';

import { buildPlan as buildPullPlan } from '../pull-update.mjs';
import { buildPlan as buildPushPlan, resolveMessage } from '../push-git.mjs';
import { buildPlan as buildDeployPlan } from '../deploy-cloud.mjs';
import { buildPlan as buildPushDeployPlan } from '../push-and-deploy.mjs';
import { buildRemoteDeployScript } from '../lib/ssh.mjs';
import { parseCliArgs } from '../lib/common.mjs';

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('parseCliArgs ignores standalone separator and keeps flags after it', () => {
  const { flags, positionals } = parseCliArgs(['--', 'message', 'chore: ok', '--dry-run']);
  assert.equal(flags['dry-run'], true);
  assert.deepEqual(positionals, ['message', 'chore: ok']);
});

test('pull-update builds expected command flow', () => {
  const plan = buildPullPlan({ branch: 'main', envFile: '.env.production', skipBuild: false });
  assert.equal(plan[0].cmd, 'git');
  assert.deepEqual(plan[2].args, ['pull', '--ff-only', 'origin', 'main']);
  assert.deepEqual(plan.at(-1).args, ['compose', '--env-file', '.env.production', 'ps']);
  assert.deepEqual(plan.at(-1).env, { ENV_FILE: '.env.production' });
});

test('resolveMessage supports mistaken positional syntax', () => {
  const message = resolveMessage({}, ['message', 'chore: deploy', '--dry-run']);
  assert.equal(message, 'chore: deploy');
});

test('push-git requires message unless allow-empty', () => {
  assert.throws(() => buildPushPlan({ message: '', allowEmpty: false }), /Missing commit message/);
  const plan = buildPushPlan({ message: 'chore: update', allowEmpty: false });
  assert.deepEqual(plan[1].args, ['commit', '-m', 'chore: update']);
});

test('deploy-cloud validates required fields', () => {
  assert.throws(() => buildDeployPlan({ host: '', user: 'root', repo: 'git@repo' }), /Missing --host/);
  assert.throws(() => buildDeployPlan({ host: '10.0.0.1', user: 'root', repo: '' }), /Missing --repo/);
  assert.throws(() => buildDeployPlan({ host: '10.0.0.1', user: 'root', repo: 'git@repo', sshPort: 'abc' }), /Invalid --ssh-port/);
});

test('deploy-cloud builds ssh command with remote script (with user)', () => {
  const plan = buildDeployPlan({
    host: '10.13.33.13',
    user: 'deploy',
    repo: 'git@github.com:org/repo.git',
    projectPath: '/opt/femictec',
    branch: 'main',
    envFile: '.env.production',
    identityFile: '/home/deploy/.ssh/id_ed25519',
    sshPort: '2222',
  });

  assert.equal(plan.length, 1);
  assert.equal(plan[0].cmd, 'ssh');
  assert.deepEqual(plan[0].args.slice(0, 4), ['-i', '/home/deploy/.ssh/id_ed25519', '-p', '2222']);
  assert.equal(plan[0].args[4], 'deploy@10.13.33.13');
  assert.match(plan[0].args[5], /docker compose --env-file/);
});

test('deploy-cloud supports host alias without user', () => {
  const plan = buildDeployPlan({
    host: 'osi-femictec',
    repo: 'https://gitlab.example/repo.git',
    projectPath: '/opt/femictec',
    branch: 'main',
    envFile: '.env.production',
  });

  assert.equal(plan.length, 1);
  assert.equal(plan[0].cmd, 'ssh');
  assert.equal(plan[0].args[0], 'osi-femictec');
});

test('push-and-deploy prepends tests and build', () => {
  const plan = buildPushDeployPlan({
    message: 'chore: release',
    host: '10.13.33.13',
    user: 'deploy',
    repo: 'git@github.com:org/repo.git',
    path: '/opt/femictec',
    branch: 'main',
    envFile: '.env.production',
  });

  assert.deepEqual(plan[0], { cmd: 'npm', args: ['run', 'test:scripts'] });
  assert.deepEqual(plan[1], { cmd: 'npm', args: ['run', 'build'] });
  assert.equal(plan.at(-1).cmd, 'ssh');
});

test('remote script includes hardening checks', () => {
  const script = buildRemoteDeployScript({
    projectPath: '/opt/femictec',
    repo: 'git@github.com:org/repo.git',
    branch: 'main',
    envFile: '.env.production',
  });

  assert.match(script, /command -v git/);
  assert.match(script, /docker compose version/);
  assert.match(script, /git clone --branch/);
  assert.match(script, /git remote set-url origin/);
  assert.match(script, /Arquivo de ambiente nao encontrado/);
});

let failed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log(`PASS ${t.name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${t.name}`);
    console.error(err);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${tests.length} tests passed.`);
