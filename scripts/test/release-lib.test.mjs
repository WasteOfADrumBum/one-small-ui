// node --test scripts/test   (npm run test:scripts)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkGateCheckRuns, checkJobs, checkMetadata, selectRun, validateInputs } from '../release-lib.mjs';

const SHA = 'a'.repeat(40);
const REPO = 42;
const policy = { sha: SHA, workflowPath: '.github/workflows/ci.yml', repositoryId: REPO, branch: 'main', events: ['push', 'workflow_dispatch'] };
const run = (o = {}) => ({
  id: 1,
  head_sha: SHA,
  path: '.github/workflows/ci.yml',
  repository: { id: REPO },
  head_repository: { id: REPO },
  head_branch: 'main',
  event: 'push',
  status: 'completed',
  conclusion: 'success',
  run_attempt: 1,
  run_started_at: '2026-11-05T10:00:00Z',
  ...o,
});

test('inputs: only full lowercase SHAs and semver versions', () => {
  assert.deepEqual(validateInputs({ sha: SHA, version: '0.6.1' }), []);
  assert.equal(validateInputs({ sha: SHA.slice(0, 7), version: '0.6.1' }).length, 1);
  assert.equal(validateInputs({ sha: 'A'.repeat(40), version: '0.6.1' }).length, 1);
  assert.equal(validateInputs({ sha: `${SHA}; rm -rf /`, version: '0.6.1' }).length, 1);
  assert.equal(validateInputs({ sha: SHA, version: 'v0.6.1' }).length, 1);
  assert.equal(validateInputs({ sha: SHA, version: '0.6.1$(id)' }).length, 1);
  assert.deepEqual(validateInputs({ sha: SHA, version: '1.0.0-rc.1' }), []);
});

test('metadata: name, version, root/docs/lockfile agreement', () => {
  const lib = { name: '@onesmall/ui', version: '0.6.1' };
  const ok = { lib, root: { version: '0.6.1' }, docs: { version: '0.6.1' }, lock: { packages: { '': { version: '0.6.1' }, 'packages/onesmallui': { name: '@onesmall/ui', version: '0.6.1' } } } };
  const want = { name: '@onesmall/ui', version: '0.6.1' };
  assert.deepEqual(checkMetadata(ok, want), []);
  assert.match(checkMetadata(ok, { ...want, version: '0.6.2' }).join(), /expected 0.6.2/);
  assert.match(checkMetadata({ ...ok, docs: { version: '0.6.0' } }, want).join(), /docs/);
  assert.match(checkMetadata({ ...ok, lock: { packages: { '': { version: '0.6.1' } } } }, want).join(), /package-lock/);
  assert.match(checkMetadata({ ...ok, lib: { ...lib, name: 'onesmallui' } }, want).join(), /name/);
});

test('runs: a green run on main is authoritative', () => {
  const r = selectRun([run()], policy);
  assert.equal(r.ok, true);
  assert.equal(r.run.id, 1);
});

test('runs: missing, forks, other workflows, branches and events are not trusted', () => {
  assert.equal(selectRun([], policy).ok, false);
  for (const bad of [
    run({ head_repository: { id: 7 } }),
    run({ repository: { id: 7 } }),
    run({ path: '.github/workflows/evil.yml' }),
    run({ head_branch: 'feature' }),
    run({ event: 'pull_request' }),
    run({ event: 'pull_request_target' }),
    run({ head_sha: 'b'.repeat(40) }),
  ]) {
    const r = selectRun([bad], policy);
    assert.equal(r.ok, false, JSON.stringify(bad));
    assert.equal(r.ignored.length, 1);
  }
});

test('runs: a pending newer attempt or run fails even when an older one passed', () => {
  assert.equal(selectRun([run(), run({ id: 2, status: 'in_progress', conclusion: null, run_started_at: '2026-11-05T11:00:00Z' })], policy).ok, false);
  assert.equal(selectRun([run({ status: 'queued', conclusion: null, run_attempt: 2 })], policy).ok, false);
});

test('runs: the most recently started attempt decides, including reruns of older runs', () => {
  // Run 2 passed, then run 1 was re-run (attempt 2, started later) and failed.
  const r = selectRun([run({ id: 2, run_started_at: '2026-11-05T11:00:00Z' }), run({ id: 1, run_attempt: 2, conclusion: 'failure', run_started_at: '2026-11-05T12:00:00Z' })], policy);
  assert.equal(r.ok, false);
  assert.match(r.reason, /concluded failure/);
  // A flaky failure followed by a later green run passes.
  assert.equal(selectRun([run({ id: 1, conclusion: 'failure' }), run({ id: 2, run_started_at: '2026-11-05T11:00:00Z' })], policy).ok, true);
  for (const c of ['cancelled', 'skipped', 'neutral', 'timed_out', 'action_required', 'stale', null]) {
    assert.equal(selectRun([run({ conclusion: c })], policy).ok, false, String(c));
  }
});

test('jobs: required jobs must exist and pass, duplicates included', () => {
  const job = (name, o = {}) => ({ name, run_id: 1, run_attempt: 1, status: 'completed', conclusion: 'success', ...o });
  const ctx = { runId: 1, attempt: 1, required: ['CI gate', 'Security'] };
  assert.deepEqual(checkJobs([job('CI gate'), job('Security')], ctx), []);
  assert.match(checkJobs([job('CI gate')], ctx).join(), /"Security" is missing/);
  assert.match(checkJobs([job('CI gate'), job('Security', { conclusion: 'skipped' })], ctx).join(), /skipped/);
  assert.match(checkJobs([job('CI gate'), job('Security'), job('Security', { conclusion: 'failure' })], ctx).join(), /failure/);
  assert.match(checkJobs([job('CI gate'), job('Security', { status: 'in_progress', conclusion: null })], ctx).join(), /in_progress/);
  assert.match(checkJobs([job('CI gate'), job('Security', { run_id: 9 })], ctx).join(), /another run/);
  assert.match(checkJobs([job('CI gate'), job('Security', { run_attempt: 2 })], ctx).join(), /newer attempt/);
  // Jobs kept from an earlier attempt after "re-run failed jobs" are fine.
  assert.deepEqual(checkJobs([job('CI gate', { run_attempt: 2 }), job('Security')], { ...ctx, attempt: 2 }), []);
  assert.match(checkJobs([], ctx).join(), /no jobs/);
  assert.match(checkJobs([job('Analyze'), job('Other', { conclusion: 'neutral' })], { runId: 1, attempt: 1, required: [], requireAll: true }).join(), /neutral/);
});

test('gate check runs: only GitHub Actions counts, and the latest must be this run and green', () => {
  const cr = (o = {}) => ({ id: 1, name: 'CI gate', app: { slug: 'github-actions' }, status: 'completed', conclusion: 'success', started_at: '2026-11-05T10:00:00Z', details_url: 'https://github.com/o/r/actions/runs/5/job/9', ...o });
  const ctx = { name: 'CI gate', runId: 5 };
  assert.deepEqual(checkGateCheckRuns([cr()], ctx).errors, []);
  const spoof = checkGateCheckRuns([cr(), cr({ id: 2, app: { slug: 'evil-app' }, conclusion: 'success', started_at: '2026-11-05T12:00:00Z' })], ctx);
  assert.deepEqual(spoof.errors, []);
  assert.equal(spoof.warnings.length, 1);
  assert.match(checkGateCheckRuns([cr({ app: { slug: 'evil-app' } })], ctx).errors.join(), /no "CI gate" check run/);
  assert.match(checkGateCheckRuns([cr(), cr({ id: 2, conclusion: 'failure', started_at: '2026-11-05T11:00:00Z', details_url: 'https://github.com/o/r/actions/runs/6/job/1' })], ctx).errors.join(), /not from run 5/);
  assert.match(checkGateCheckRuns([cr({ status: 'in_progress', conclusion: null })], ctx).errors.join(), /in_progress/);
});
