#!/usr/bin/env bash
# Installs one Playwright browser and its OS packages on a CI runner, with a time cap, retries and a
# reusable package cache.
#
# Why: the Ubuntu package mirror sometimes trickles. In Nov 2026 the WebKit job hit its job limit
# several times inside `playwright install --with-deps` while apt-get slowly fetched ~126 MB of packages.
# - Each attempt is capped and retried. A capped attempt's apt-get can outlive `timeout` (sudo runs it in
#   its own session), so leftover apt/dpkg processes are stopped before the next attempt; otherwise the
#   next attempt only waits on the dpkg lock and fails.
# - Packages are kept in $HOME/.cache/playwright-apt, which the workflow caches with actions/cache, so a
#   retry resumes instead of starting over and later runs skip the mirror for packages already fetched.
# Tests are untouched.
#
# Usage: scripts/playwright-install.sh <browser>   (chromium | firefox | webkit)
set -euo pipefail

browser="${1:?usage: playwright-install.sh <browser>}"
attempts=3
per_attempt="7m"
archives="${HOME}/.cache/playwright-apt"

on_apt_runner=false
if [ -d /etc/apt/apt.conf.d ] && command -v sudo >/dev/null 2>&1; then
  on_apt_runner=true
fi

stop_leftover_apt() {
  $on_apt_runner || return 0
  sudo pkill -KILL -x apt-get 2>/dev/null || true
  sudo pkill -KILL -x dpkg 2>/dev/null || true
  sleep 2
  sudo dpkg --configure -a 2>/dev/null || true
}

hand_cache_back() {
  # actions/cache runs as the runner user; apt wrote these files as root.
  $on_apt_runner || return 0
  sudo rm -f "${archives}/lock"
  sudo chown -R "$(id -u):$(id -g)" "${archives}" 2>/dev/null || true
}
trap hand_cache_back EXIT

if $on_apt_runner; then
  sudo mkdir -p "${archives}/partial"
  # Give up on a stalled connection and retry; keep downloaded packages in the cached folder; wait for a
  # dpkg lock still being released by a stopped attempt.
  printf '%s\n' \
    'Acquire::Retries "5";' \
    'Acquire::http::Timeout "30";' \
    'Acquire::https::Timeout "30";' \
    "Dir::Cache::Archives \"${archives}/\";" \
    'APT::Keep-Downloaded-Packages "true";' \
    'Binary::apt::APT::Keep-Downloaded-Packages "true";' \
    'DPkg::Lock::Timeout "120";' \
    | sudo tee /etc/apt/apt.conf.d/80-ci-playwright >/dev/null
  echo "Cached packages before install: $(find "${archives}" -maxdepth 1 -name '*.deb' 2>/dev/null | wc -l)"
fi

for attempt in $(seq 1 "$attempts"); do
  if timeout --kill-after=30s "$per_attempt" npx playwright install --with-deps "$browser"; then
    exit 0
  fi
  echo "::warning::Playwright install for ${browser} failed or timed out (attempt ${attempt} of ${attempts})"
  stop_leftover_apt
  [ "$attempt" -lt "$attempts" ] && sleep 10
done

echo "::error::Playwright install for ${browser} failed after ${attempts} attempts"
exit 1
