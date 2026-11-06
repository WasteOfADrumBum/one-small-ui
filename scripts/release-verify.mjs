// Release verification for @onesmall/ui. Publishes nothing and needs no registry credentials.
//
//   node scripts/release-verify.mjs inputs --sha <sha> --version <x.y.z>
//       Only the shape of the inputs (full SHA, semver), before anything uses them.
//   node scripts/release-verify.mjs candidate --dir <checkout> --sha <sha> --version <x.y.z>
//       The checkout is exactly the candidate, it is clean, the candidate is on main, and the package
//       metadata (name, version in library, root, docs and lockfile) is consistent and as expected.
//   node scripts/release-verify.mjs checks --sha <sha> [--evidence <file>]
//       GitHub API (GITHUB_TOKEN with actions:read and checks:read): the candidate's authoritative CI and
//       CodeQL runs are complete and green, every mandatory job passed, and the "CI gate" check run is the
//       trusted app's. Prints the CI run id for the artifact download.
//   node scripts/release-verify.mjs artifact --manifest <file> --tarball <file> --sha <sha> --version <x.y.z> [--rebuilt <tarball>]
//       The CI artifact's manifest names this commit, package and version, the tarball matches its digest,
//       and (with --rebuilt) an independent rebuild of the candidate produced the identical bytes.
//
// Inputs are read from arguments, never interpolated into a shell. Exit code 1 on any failure.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkGateCheckRuns, checkJobs, checkMetadata, selectRun, validateInputs } from './release-lib.mjs';

export const POLICY = {
  name: '@onesmall/ui',
  branch: 'main',
  workflows: [
    {
      path: '.github/workflows/ci.yml',
      events: ['push', 'workflow_dispatch'],
      gate: 'CI gate',
      // Defence in depth: the gate already fails on any of these, but a rename or a gate edited to ignore a
      // job must also fail the release until this list is reviewed.
      required: [
        'CI gate',
        'Build and package',
        'check (ubuntu-latest)',
        'check (windows-latest)',
        'Playwright (layout)',
        'Playwright (a11y)',
        'Browsers (firefox)',
        'Browsers (webkit)',
        'Consumer (Node 18)',
        'Consumer (Node 20)',
        'Consumer (Node 22)',
        'Consumer (Node 24)',
        'Security',
      ],
    },
    { path: '.github/workflows/codeql.yml', events: ['push', 'workflow_dispatch', 'schedule'], required: [], requireAll: true },
  ],
};

const [command, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const errors = [];
const warnings = [];
const out = (key, value) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
const summary = (md) => process.env.GITHUB_STEP_SUMMARY && appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));

function finish(title) {
  for (const w of warnings) console.log(`  warn ${w}`);
  for (const e of errors) console.log(`  FAIL ${e}`);
  summary(`### ${title}: ${errors.length ? 'FAILED' : 'passed'}\n${[...errors.map((e) => `- ❌ ${e}`), ...warnings.map((w) => `- ⚠️ ${w}`)].join('\n')}`);
  if (errors.length) process.exit(1);
  console.log(`${title}: passed`);
}

if (command === 'inputs') {
  errors.push(...validateInputs({ sha: opt('sha'), version: opt('version') }));
  finish('Inputs');
} else if (command === 'candidate') {
  const sha = opt('sha');
  const version = opt('version');
  const dir = resolve(opt('dir') ?? '.');
  errors.push(...validateInputs({ sha, version }));
  if (errors.length) finish('Candidate');
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' }).trim();
  const head = git('rev-parse', 'HEAD');
  if (head !== sha) errors.push(`checkout resolved to ${head}, not the candidate ${sha}`);
  if (git('status', '--porcelain')) errors.push('candidate checkout has local changes');
  try {
    execFileSync('git', ['-C', dir, 'merge-base', '--is-ancestor', sha, `origin/${POLICY.branch}`]);
  } catch {
    errors.push(`candidate ${sha} is not on origin/${POLICY.branch}`);
  }
  errors.push(
    ...checkMetadata(
      {
        lib: json(join(dir, 'packages/onesmallui/package.json')),
        root: json(join(dir, 'package.json')),
        docs: json(join(dir, 'apps/docs/package.json')),
        lock: json(join(dir, 'package-lock.json')),
      },
      { name: POLICY.name, version },
    ),
  );
  console.log(`Candidate ${sha} · ${POLICY.name}@${version}`);
  finish('Candidate');
} else if (command === 'checks') {
  const sha = opt('sha');
  errors.push(...validateInputs({ sha, version: '0.0.0' }));
  if (errors.length) finish('Required checks');
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo, GITHUB_REPOSITORY_ID: repoId } = process.env;
  const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';
  if (!token || !repo || !repoId) {
    console.error('GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_REPOSITORY_ID are required');
    process.exit(1);
  }
  const get = async (path, attempt = 1) => {
    const res = await fetch(`${api}/repos/${repo}${path}`, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
      signal: AbortSignal.timeout(30_000),
    });
    // Bounded retry on transient server or rate errors only.
    if ((res.status >= 500 || res.status === 429) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
      return get(path, attempt + 1);
    }
    if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  };
  // Every page, and a refusal when what we collected doesn't add up to total_count.
  const all = async (path, key) => {
    const items = [];
    let total = Infinity;
    for (let page = 1; items.length < total; page++) {
      if (page > 20) throw new Error(`${path}: more than 20 pages`);
      const body = await get(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      total = body.total_count;
      items.push(...body[key]);
      if (body[key].length === 0) break;
    }
    if (items.length !== total) throw new Error(`${path}: collected ${items.length} of ${total} (incomplete pagination)`);
    return items;
  };

  const evidence = { candidate: sha, repository: repo, checkedAt: new Date().toISOString(), workflows: [] };
  let ciRunId = null;
  for (const wf of POLICY.workflows) {
    const file = wf.path.split('/').pop();
    const runs = await all(`/actions/workflows/${file}/runs?head_sha=${sha}`, 'workflow_runs');
    const pick = selectRun(runs, { sha, workflowPath: wf.path, repositoryId: Number(repoId), branch: POLICY.branch, events: wf.events });
    for (const i of pick.ignored) warnings.push(`${file}: ignored run ${i.id} (${i.why})`);
    if (!pick.ok) {
      errors.push(pick.reason);
      continue;
    }
    // Re-read the run itself so a rerun that started after the listing is seen.
    const run = await get(`/actions/runs/${pick.run.id}`);
    if (run.run_attempt !== pick.run.run_attempt || run.status !== 'completed' || run.conclusion !== 'success') {
      errors.push(`${file}: run ${run.id} changed while verifying (attempt ${run.run_attempt}, ${run.status}/${run.conclusion})`);
      continue;
    }
    const jobs = await all(`/actions/runs/${run.id}/jobs?filter=latest`, 'jobs');
    errors.push(...checkJobs(jobs, { runId: run.id, attempt: run.run_attempt, required: wf.required, requireAll: wf.requireAll }).map((e) => `${file}: ${e}`));
    if (wf.gate) {
      const checkRuns = await all(`/commits/${sha}/check-runs?check_name=${encodeURIComponent(wf.gate)}&filter=all`, 'check_runs');
      const gate = checkGateCheckRuns(checkRuns, { name: wf.gate, runId: run.id });
      errors.push(...gate.errors);
      warnings.push(...gate.warnings);
      ciRunId = run.id;
    }
    evidence.workflows.push({ path: wf.path, runId: run.id, attempt: run.run_attempt, event: run.event, url: run.html_url, jobs: jobs.map((j) => ({ name: j.name, conclusion: j.conclusion, attempt: j.run_attempt })) });
    console.log(`  ok   ${file}: run ${run.id} attempt ${run.run_attempt} (${run.event}) ${run.html_url}`);
  }

  // Detection only: the release does not depend on branch protection, but its absence is reported.
  try {
    const rules = await get(`/rules/branches/${POLICY.branch}`);
    const types = new Set(rules.map((r) => r.type));
    const branch = await get(`/branches/${POLICY.branch}`);
    evidence.branchProtection = { protected: branch.protected, rules: [...types] };
    if (!branch.protected && !types.has('required_status_checks')) warnings.push(`${POLICY.branch} has no branch protection or ruleset requiring status checks (detection only; see docs/ci-cd.md)`);
  } catch (e) {
    warnings.push(`could not read branch rules: ${e.message.slice(0, 120)}`);
  }
  evidence.warnings = warnings;
  evidence.errors = errors;
  if (opt('evidence')) writeFileSync(opt('evidence'), `${JSON.stringify(evidence, null, 2)}\n`);
  if (ciRunId) out('ci_run_id', ciRunId);
  finish('Required checks');
} else if (command === 'artifact') {
  const sha = opt('sha');
  const version = opt('version');
  errors.push(...validateInputs({ sha, version }));
  const manifest = json(opt('manifest'));
  const tarball = opt('tarball');
  const digest = sha256(tarball);
  if (manifest.commit !== sha) errors.push(`artifact manifest is for commit ${manifest.commit}, not ${sha}`);
  if (manifest.package !== POLICY.name || manifest.version !== version) errors.push(`artifact is ${manifest.package}@${manifest.version}, expected ${POLICY.name}@${version}`);
  if (manifest.checks !== 'passed') errors.push('artifact manifest records failed package checks');
  if (tarball.split(/[\\/]/).pop() !== manifest.filename) errors.push(`tarball name differs from the manifest (${manifest.filename})`);
  if (digest !== manifest.sha256) errors.push(`tarball sha256 ${digest} differs from the manifest ${manifest.sha256}`);
  if (opt('rebuilt')) {
    // Digest computed here, by the release tooling, not taken from anything the candidate's scripts wrote.
    const rebuilt = sha256(opt('rebuilt'));
    if (rebuilt !== manifest.sha256) errors.push(`independent rebuild produced ${rebuilt}, CI artifact is ${manifest.sha256} (not reproducible; investigate before releasing)`);
    else console.log(`  ok   independent rebuild reproduces the artifact byte for byte (${rebuilt})`);
  }
  out('sha256', digest);
  out('integrity', manifest.integrity);
  out('filename', manifest.filename);
  out('node', manifest.build?.node ?? '');
  console.log(`Artifact ${manifest.filename} sha256 ${digest} from run ${manifest.run?.id} attempt ${manifest.run?.attempt}`);
  finish('Artifact identity');
} else {
  console.error('usage: release-verify.mjs candidate|checks|artifact [options]');
  process.exit(2);
}
