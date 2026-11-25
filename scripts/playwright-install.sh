#!/usr/bin/env bash
# Installs one Playwright browser and its OS packages on a CI runner, with a time cap and retries.
#
# Why: the Ubuntu package mirror sometimes stalls mid-download. In Nov 2026 the WebKit job hit its
# 20-minute job limit four times inside `playwright install --with-deps` (apt-get waiting on the mirror),
# so main went red with no code at fault. Each attempt is now capped and retried; tests are untouched.
#
# Usage: scripts/playwright-install.sh <browser>   (chromium | firefox | webkit)
set -euo pipefail

browser="${1:?usage: playwright-install.sh <browser>}"
attempts=3
per_attempt="6m"

# Let apt give up on a stalled mirror connection and retry instead of waiting indefinitely.
if [ -d /etc/apt/apt.conf.d ] && command -v sudo >/dev/null 2>&1; then
  # DPkg lock wait covers an apt process from a killed attempt still releasing the lock.
  printf 'Acquire::Retries "5";\nAcquire::http::Timeout "30";\nAcquire::https::Timeout "30";\nDPkg::Lock::Timeout "120";\n' \
    | sudo tee /etc/apt/apt.conf.d/80-ci-retries >/dev/null
fi

for attempt in $(seq 1 "$attempts"); do
  if timeout --kill-after=30s "$per_attempt" npx playwright install --with-deps "$browser"; then
    exit 0
  fi
  echo "::warning::Playwright install for ${browser} failed or timed out (attempt ${attempt} of ${attempts})"
  [ "$attempt" -lt "$attempts" ] && sleep 15
done

echo "::error::Playwright install for ${browser} failed after ${attempts} attempts"
exit 1
