import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPlan as buildPullPlan } from '../pull-update.mjs';
import { buildPlan as buildPushPlan } from '../push-git.mjs';
import { buildPlan as buildDeployPlan } from '../deploy-cloud.mjs';
import { buildPlan as buildPushDeployPlan } from '../push-and-deploy.mjs';
import { buildRemoteDeployScript } from '../lib/ssh.mjs';

test('pull-update builds expected command flow', () => {
  const plan = buildPullPlan({ branch: 'main', envFile: '.env.production', skipBuild: false });
  assert.equal(plan[0].cmd, 'git');
  assert.deepEqual(plan[2].args, ['pull', '--ff-only', 'origin', 'main']);
  assert.deepEqual(plan.at(-1).args, ['compose', '--env-file', '.env.production', 'ps']);
});

test('push-git requires message unless allow-empty', () => {
  assert.throws(() => buildPushPlan({ message: '', allowEmpty: false }), /Missing commit message/);
  const plan = buildPushPlan({ message: 'chore: update', allowEmpty: false });
  assert.deepEqual(plan[1].args, ['commit', '-m', 'chore: update']);
});

test('deploy-cloud validates required fields', () => {
  assert.throws(() => buildDeployPlan({ host: '', user: 'root', repo: 'git@repo' }), /Missing --host/);
  assert.throws(() => buildDeployPlan({ host: '10.0.0.1', user: '', repo: 'git@repo' }), /Missing --user/);
  assert.throws(() => buildDeployPlan({ host: '10.0.0.1', user: 'root', repo: '' }), /Missing --repo/);
});

test('deploy-cloud builds ssh command with remote script', () => {
  const plan = buildDeployPlan({
    host: '10.13.33.13',
    user: 'deploy',
    repo: 'git@github.com:org/repo.git',
    projectPath: '/opt/femictec',
    branch: 'main',
    envFile: '.env.production',
  });

  assert.equal(plan.length, 1);
  assert.equal(plan[0].cmd, 'ssh');
  assert.equal(plan[0].args[0], 'deploy@10.13.33.13');
  assert.match(plan[0].args[1], /docker compose up -d/);
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

test('remote script includes expected guarded clone flow', () => {
  const script = buildRemoteDeployScript({
    projectPath: '/opt/femictec',
    repo: 'git@github.com:org/repo.git',
    branch: 'main',
    envFile: '.env.production',
  });

  assert.match(script, /if \[ ! -d/);
  assert.match(script, /git clone/);
  assert.match(script, /git pull --ff-only origin/);
});
