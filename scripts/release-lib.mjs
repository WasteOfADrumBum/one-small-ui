// Pure release-gate logic, kept free of I/O so scripts/test/release-lib.test.mjs can exercise every
// failure mode (pending reruns, duplicate names, skipped jobs, forks, other apps) without GitHub.

export const SHA_RE = /^[0-9a-f]{40}$/;
export const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/** Inputs arrive as untrusted strings from workflow_dispatch; reject anything that isn't exactly the shape we expect. */
export function validateInputs({ sha, version }) {
  const errors = [];
  if (typeof sha !== 'string' || !SHA_RE.test(sha)) errors.push(`candidate must be a full 40-character lowercase commit SHA (got ${JSON.stringify(sha)})`);
  if (typeof version !== 'string' || !SEMVER_RE.test(version)) errors.push(`expected version must be semver like 1.2.3 (got ${JSON.stringify(version)})`);
  return errors;
}

/**
 * Package metadata must agree everywhere the version is written down, and match what the operator expects.
 * `files` maps a label to parsed JSON: { lib, root, docs, lock }.
 */
export function checkMetadata({ lib, root, docs, lock }, { name, version }) {
  const errors = [];
  if (lib.name !== name) errors.push(`package name is ${lib.name}, expected ${name}`);
  if (lib.version !== version) errors.push(`package version is ${lib.version}, expected ${version}`);
  if (root.version !== lib.version) errors.push(`root package.json version ${root.version} differs from the library ${lib.version}`);
  if (docs.version !== lib.version) errors.push(`docs package.json version ${docs.version} differs from the library ${lib.version}`);
  const lockLib = lock?.packages?.['packages/onesmallui'];
  if (!lockLib || lockLib.name !== lib.name || lockLib.version !== lib.version) errors.push('package-lock.json entry for packages/onesmallui does not match the library name/version (run npm install)');
  if (lock?.packages?.['']?.version !== root.version) errors.push('package-lock.json root version does not match package.json (run npm install)');
  if (lib.private) errors.push('library package.json is marked private');
  if (lib.publishConfig?.registry && lib.publishConfig.registry !== 'https://registry.npmjs.org/') errors.push(`unexpected publishConfig.registry ${lib.publishConfig.registry}`);
  return errors;
}

const time = (s) => (s ? Date.parse(s) : 0);

/**
 * Picks the authoritative run of one workflow for a commit.
 *
 * Trust: only runs of this repository (not forks), of the exact workflow file, on the release branch, from an
 * allowed event. Reruns: a rerun keeps the run id but gets a new attempt and a new run_started_at, so the run
 * whose latest attempt started last is authoritative, and any matching run still queued or in progress fails the
 * gate (a successful older attempt never hides a pending newer one).
 */
export function selectRun(runs, { sha, workflowPath, repositoryId, branch, events }) {
  const ignored = [];
  const matching = [];
  for (const r of runs) {
    const why =
      r.head_sha !== sha ? 'other commit'
      : r.path !== workflowPath ? `other workflow ${r.path}`
      : r.repository?.id !== repositoryId ? 'other repository'
      : r.head_repository?.id !== repositoryId ? 'run from a fork'
      : r.head_branch !== branch ? `branch ${r.head_branch}`
      : !events.includes(r.event) ? `event ${r.event}`
      : null;
    if (why) ignored.push({ id: r.id, why });
    else matching.push(r);
  }
  if (matching.length === 0) return { ok: false, reason: `no ${workflowPath} run on ${branch} for ${sha} (events ${events.join(', ')})`, ignored };
  const pending = matching.filter((r) => r.status !== 'completed');
  if (pending.length) return { ok: false, reason: `${workflowPath}: run(s) ${pending.map((r) => `${r.id} attempt ${r.run_attempt} ${r.status}`).join(', ')} not finished`, ignored };
  const latest = [...matching].sort((a, b) => time(b.run_started_at) - time(a.run_started_at) || b.run_attempt - a.run_attempt || b.id - a.id)[0];
  if (latest.conclusion !== 'success') return { ok: false, reason: `${workflowPath}: latest run ${latest.id} attempt ${latest.run_attempt} concluded ${latest.conclusion}`, run: latest, ignored };
  return { ok: true, run: latest, ignored };
}

/**
 * Jobs of the authoritative run (latest execution of each job). Every required name must be present, and every job with that name must have
 * succeeded (duplicates included). Skipped, neutral, cancelled or missing all fail. With `requireAll`, every job
 * in the attempt must have succeeded too.
 */
export function checkJobs(jobs, { runId, attempt, required, requireAll = false }) {
  const errors = [];
  // `filter=latest` returns each job's most recent execution: after "re-run failed jobs" the jobs that passed
  // earlier keep their older attempt number, so attempts up to the run's latest attempt are expected.
  const ofAttempt = jobs.filter((j) => j.run_id === runId && j.run_attempt <= attempt);
  if (ofAttempt.length !== jobs.length) errors.push(`${jobs.length - ofAttempt.length} job(s) belong to another run or a newer attempt`);
  if (ofAttempt.length === 0) errors.push(`run ${runId} attempt ${attempt} has no jobs`);
  for (const name of required) {
    const named = ofAttempt.filter((j) => j.name === name);
    if (named.length === 0) errors.push(`required job "${name}" is missing`);
    for (const j of named) if (j.status !== 'completed' || j.conclusion !== 'success') errors.push(`required job "${name}" is ${j.status}/${j.conclusion}`);
  }
  if (requireAll) for (const j of ofAttempt) if (j.conclusion !== 'success') errors.push(`job "${j.name}" is ${j.status}/${j.conclusion}`);
  return errors;
}

/**
 * Check runs with the gate's name for the commit. Only GitHub Actions' app is trusted; a same-named check from any
 * other app is reported and ignored. The most recent trusted one must be the authoritative run's gate and green.
 */
export function checkGateCheckRuns(checkRuns, { name, runId, appSlug = 'github-actions' }) {
  const errors = [];
  const warnings = [];
  const named = checkRuns.filter((c) => c.name === name);
  for (const c of named) if (c.app?.slug !== appSlug) warnings.push(`ignored "${name}" check run ${c.id} from app ${c.app?.slug ?? 'unknown'}`);
  const trusted = named.filter((c) => c.app?.slug === appSlug).sort((a, b) => time(b.started_at) - time(a.started_at) || b.id - a.id);
  if (trusted.length === 0) return { errors: [`no "${name}" check run from ${appSlug}`], warnings };
  const latest = trusted[0];
  if (!String(latest.details_url ?? latest.html_url ?? '').includes(`/actions/runs/${runId}/`)) errors.push(`latest "${name}" check run ${latest.id} is not from run ${runId}`);
  if (latest.status !== 'completed' || latest.conclusion !== 'success') errors.push(`latest "${name}" check run ${latest.id} is ${latest.status}/${latest.conclusion}`);
  return { errors, warnings };
}
