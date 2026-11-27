// node --test scripts/test/playwright-install.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../playwright-install.sh', import.meta.url));

test('playwright-install reaps a root child and reads apt locks', { skip: process.platform !== 'linux' }, () => {
  const result = spawnSync('bash', [script, '--self-test'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
