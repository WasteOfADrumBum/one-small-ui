#!/usr/bin/env bash
# Installs one Playwright browser for CI, then only the OS libraries a launch still needs.
#
# Root cause (main run 45668247573, WebKit): `timeout` signals as the runner user.
# `playwright install --with-deps` runs `sudo -- sh -c 'apt-get ...'`, and apt-get is
# root, so the signal never reaches it. The attempt ends, apt-get keeps
# /var/lib/dpkg/lock-frontend, and the next attempt fails with exit 100.
#
# Each attempt is its own session (`setsid`, `timeout --foreground` so children stay
# in that process group). After a timeout the group is killed as root (`sudo kill`
# of the negative PGID) and this script waits until the dpkg/apt locks are free.
#
# The browser binary is installed first, with no apt. If it already launches, apt is
# skipped. Otherwise the libraries are installed without Playwright's fallback fonts
# (the slow part of the WebKit set) and cached under ~/.cache/playwright-apt. Full
# `install-deps` still runs if the browser will not launch after that. Tests are unchanged.
# Same split as joshsmall-site scripts/install-browser-deps.mjs.
#
# Usage: scripts/playwright-install.sh <browser>   (chromium | firefox | webkit)
#        scripts/playwright-install.sh --self-test
set -euo pipefail

on_apt_runner=false

# timeout runs as the runner user, so its signal does not reach root's apt-get.
# The session id is the process group id (timeout --foreground does not move the
# children). Killing that group as root is what actually releases the dpkg lock.
stop_session() {
  local sid=$1
  case "$sid" in
    ''|*[!0-9]*) return 0 ;;
  esac
  if [ "$sid" = "$$" ]; then
    echo "refusing to kill the installer process" >&2
    return 0
  fi
  if command -v sudo >/dev/null 2>&1; then
    sudo kill -KILL -- "-$sid" 2>/dev/null || true
  else
    kill -KILL -- "-$sid" 2>/dev/null || true
  fi
}

# PIDs holding an fcntl/flock on the given files, from /proc/locks. One PID per line.
lock_holder_pids() {
  python3 - "$@" <<'PY'
import os
import sys

want = set()
for path in sys.argv[1:]:
    try:
        st = os.stat(path)
    except FileNotFoundError:
        continue
    want.add((f"{os.major(st.st_dev):x}", f"{os.minor(st.st_dev):x}", str(st.st_ino)))
try:
    lines = open("/proc/locks", encoding="utf-8").read().splitlines()
except FileNotFoundError:
    sys.exit(0)
seen = []
for line in lines:
    parts = line.split()
    if len(parts) < 6 or not parts[4].isdigit():
        continue
    devino = parts[5].split(":")
    if len(devino) != 3:
        continue
    key = (devino[0].lower(), devino[1].lower(), devino[2])
    if key in want and parts[4] not in seen:
        seen.append(parts[4])
print("\n".join(seen))
PY
}

# After a timed-out attempt, apt-get may still hold the locks (it outlived timeout).
# Poll, and kill whoever still holds them, until they are free or the wait is used up.
release_apt_locks() {
  [ "$on_apt_runner" = true ] || return 0
  command -v python3 >/dev/null 2>&1 || return 0
  local -a files=(
    /var/lib/dpkg/lock-frontend
    /var/lib/dpkg/lock
    /var/lib/apt/lists/lock
    /var/cache/apt/archives/lock
    "${HOME}/.cache/playwright-apt/lock"
  )
  local start=$SECONDS limit=45 pids pid
  while (( SECONDS - start < limit )); do
    pids=$(lock_holder_pids "${files[@]}")
    if [ -z "$pids" ]; then
      return 0
    fi
    echo "apt/dpkg lock held by: $(echo "$pids" | tr '\n' ' ')"
    while IFS= read -r pid; do
      [ -n "$pid" ] || continue
      sudo kill -KILL "$pid" 2>/dev/null || true
    done <<< "$pids"
    sleep 1
  done
  echo "::warning::dpkg/apt locks still held after ${limit}s"
  return 1
}

# A kill mid-unpack leaves dpkg half-configured. Finish that as root so the next
# attempt is not stuck behind "dpkg was interrupted". timeout runs as root here:
# a user-level timeout cannot stop dpkg.
recover_dpkg() {
  [ "$on_apt_runner" = true ] || return 0
  if ! sudo DEBIAN_FRONTEND=noninteractive timeout --kill-after=10s 90s dpkg --configure -a; then
    release_apt_locks || true
  fi
}

# Run one attempt in a new session, capped by timeout. On failure, reap the whole
# process group as root and wait until the package locks are free.
run_bounded() {
  local duration=$1
  shift
  if ! command -v setsid >/dev/null 2>&1 || ! command -v timeout >/dev/null 2>&1; then
    "$@"
    return
  fi
  local sid_file waiter sid="" status=0
  sid_file=$(mktemp)
  # bash records its pid, then execs timeout in that same process, so the session
  # id stays the process group of sudo and apt-get. --foreground stops timeout
  # from moving the command into a different group.
  # $1 and $@ belong to the inner bash; they must not expand in this script.
  # shellcheck disable=SC2016
  setsid --wait bash -c 'echo $$ >"$1"; shift; exec timeout --foreground --kill-after=10s "$@"' \
    bash "$sid_file" "$duration" "$@" &
  waiter=$!
  local _i
  for _i in $(seq 1 100); do
    if [ -s "$sid_file" ]; then
      sid=$(tr -cd '0-9' <"$sid_file")
      break
    fi
    if ! kill -0 "$waiter" 2>/dev/null; then
      break
    fi
    sleep 0.05
  done
  wait "$waiter" || status=$?
  if [ "$status" -ne 0 ]; then
    stop_session "$sid"
    # Only apt leaves a root process on the dpkg locks. A failed browser download
    # or launch probe has nothing to configure.
    case "$*" in
      *apt-get*|*install-deps*)
        release_apt_locks || true
        recover_dpkg
        ;;
    esac
  fi
  rm -f "$sid_file"
  return "$status"
}

retry() {
  local label=$1 tries=$2 limit=$3
  shift 3
  local attempt
  for attempt in $(seq 1 "$tries"); do
    if run_bounded "$limit" "$@"; then
      return 0
    fi
    echo "::warning::${label} failed or timed out (attempt ${attempt} of ${tries})"
    [ "$attempt" -lt "$tries" ] && sleep 3
  done
  return 1
}

# Playwright's dry-run prints missing packages indented by two spaces, fonts included.
filter_dep_lines() {
  local line
  while IFS= read -r line; do
    case "$line" in
      "  fonts-"*|"  xfonts-"*) ;;
      "  "[a-z0-9]*) printf '%s\n' "${line#  }" ;;
    esac
  done
}

browser_launches() {
  # Missing libraries fail this quickly. A browser that launches needs no apt.
  BROWSER_NAME="$browser" run_bounded 45s node --input-type=module -e '
    import { chromium, firefox, webkit } from "playwright";
    const name = process.env.BROWSER_NAME;
    const browser = await ({ chromium, firefox, webkit })[name].launch({ timeout: 20000 });
    await browser.close();
  '
}

# Called from the EXIT trap (shellcheck does not treat trap as a reference).
# shellcheck disable=SC2317
hand_cache_back() {
  # actions/cache runs as the runner user; apt wrote these files as root.
  [ "$on_apt_runner" = true ] || return 0
  local archives="${HOME}/.cache/playwright-apt"
  sudo rm -f "${archives}/lock"
  sudo chown -R "$(id -u):$(id -g)" "${archives}" 2>/dev/null || true
}

configure_apt() {
  local archives="${HOME}/.cache/playwright-apt"
  sudo mkdir -p "${archives}/partial"
  # The image points apt at a regional mirror that has trickled these installs.
  # archive.ubuntu.com is the mirror that stayed usable for the same packages.
  if [ -f /etc/apt/apt-mirrors.txt ]; then
    printf '%s\n' 'http://archive.ubuntu.com/ubuntu/' | sudo tee /etc/apt/apt-mirrors.txt >/dev/null
  fi
  printf '%s\n' \
    'Acquire::Retries "5";' \
    'Acquire::http::Timeout "30";' \
    'Acquire::https::Timeout "30";' \
    "Dir::Cache::Archives \"${archives}/\";" \
    'APT::Keep-Downloaded-Packages "true";' \
    'Binary::apt::APT::Keep-Downloaded-Packages "true";' \
    'DPkg::Lock::Timeout "60";' \
    | sudo tee /etc/apt/apt.conf.d/80-ci-playwright >/dev/null
  echo "Cached packages before install: $(find "${archives}" -maxdepth 1 -name '*.deb' 2>/dev/null | wc -l)"
}

self_test() {
  local failed=0 filtered want
  filtered=$(printf '%s\n' \
    'Missing system dependencies (5):' \
    '  fonts-noto-color-emoji' \
    '  fonts-unifont' \
    '  libgtk-4-1' \
    '  xfonts-utils' \
    '  libnss3' | filter_dep_lines)
  want=$'libgtk-4-1\nlibnss3'
  if [ "$filtered" != "$want" ]; then
    echo "filter mismatch: [${filtered}]" >&2
    failed=1
  else
    echo "ok  font packages dropped"
  fi

  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to read /proc/locks" >&2
    failed=1
  else
    local lock_file lock_pid holders
    lock_file=$(mktemp)
    python3 -c 'import fcntl, os, sys, time; fd = os.open(sys.argv[1], os.O_RDWR); fcntl.lockf(fd, fcntl.LOCK_EX); time.sleep(30)' "$lock_file" &
    lock_pid=$!
    sleep 0.3
    holders=$(lock_holder_pids "$lock_file")
    if [ "$holders" != "$lock_pid" ]; then
      echo "lock scan expected ${lock_pid}, got [${holders}]" >&2
      failed=1
    else
      echo "ok  lock holder found"
    fi
    kill "$lock_pid" 2>/dev/null || true
    wait "$lock_pid" 2>/dev/null || true
    sleep 0.2
    holders=$(lock_holder_pids "$lock_file")
    if [ -n "$holders" ]; then
      echo "lock still held by [${holders}]" >&2
      failed=1
    else
      echo "ok  lock released"
    fi
    rm -f "$lock_file"
  fi

  if ! command -v sudo >/dev/null 2>&1 || ! sudo -n true 2>/dev/null; then
    echo "passwordless sudo is required for the process-group check" >&2
    failed=1
  elif ! command -v setsid >/dev/null 2>&1; then
    echo "setsid is required for the process-group check" >&2
    failed=1
  else
    local sid_file waiter sid="" sleep_left
    sid_file=$(mktemp)
    # shellcheck disable=SC2016 # $$ and $1 expand in the inner bash.
    setsid --wait bash -c 'echo $$ >"$1"; exec sudo -n sleep 120' bash "$sid_file" &
    waiter=$!
    local _i
    for _i in $(seq 1 50); do
      if [ -s "$sid_file" ]; then
        sid=$(tr -cd '0-9' <"$sid_file")
        break
      fi
      sleep 0.05
    done
    sleep 0.3
    # Snapshot args to a file so a SIGPIPE from grep cannot flip the result under pipefail.
    local snap
    snap=$(mktemp)
    ps -eo args >"$snap" || true
    if ! grep -q '[s]leep 120' "$snap"; then
      echo "root sleep did not start (sid ${sid})" >&2
      failed=1
    else
      # A user signal kills sudo and leaves the root child, which is the CI bug.
      kill -KILL -- "-$sid" 2>/dev/null || true
      sleep 0.2
      ps -eo args >"$snap" || true
      if ! grep -q '[s]leep 120' "$snap"; then
        echo "user signal reaped the root child; the regression would not be visible" >&2
        failed=1
      else
        stop_session "$sid"
        sleep 0.3
        ps -eo args >"$snap" || true
        sleep_left=$(grep '[s]leep 120' "$snap" || true)
        if [ -n "$sleep_left" ]; then
          echo "root sleep survived process-group kill: ${sleep_left}" >&2
          sudo kill -KILL -- "-$sid" 2>/dev/null || true
          failed=1
        else
          echo "ok  root child reaped with the process group"
        fi
      fi
    fi
    rm -f "$snap"
    wait "$waiter" 2>/dev/null || true
    rm -f "$sid_file"

    # The production path: timeout itself cannot signal the root child. run_bounded
    # has to, or the next attempt inherits a live process.
    snap=$(mktemp)
    if run_bounded 1s sudo -n sleep 47; then
      echo "bounded sleep should have timed out" >&2
      failed=1
    fi
    ps -eo pid,args >"$snap" || true
    if grep -q '[s]leep 47' "$snap"; then
      echo "run_bounded left a root sleep behind" >&2
      awk '/[s]leep 47/ { print $1 }' "$snap" | while read -r pid; do
        sudo kill -KILL "$pid" 2>/dev/null || true
      done
      failed=1
    else
      echo "ok  timed-out attempt reaped its root child"
    fi
    rm -f "$snap"
  fi

  return "$failed"
}

if [ "${1:-}" = "--self-test" ]; then
  self_test
  exit
fi

browser="${1:?usage: playwright-install.sh <browser>}"
case "$browser" in
  chromium|firefox|webkit) ;;
  *)
    echo "::error::unknown browser ${browser}" >&2
    exit 2
    ;;
esac

if [ -d /etc/apt/apt.conf.d ] && command -v sudo >/dev/null 2>&1 && command -v apt-get >/dev/null 2>&1; then
  on_apt_runner=true
fi

trap hand_cache_back EXIT

if [ "$on_apt_runner" = true ]; then
  configure_apt
fi

export DEBIAN_FRONTEND=noninteractive

if ! retry "Playwright browser download (${browser})" 2 2m npx playwright install "$browser"; then
  echo "::error::Playwright browser download for ${browser} failed"
  exit 1
fi

if [ "$on_apt_runner" != true ]; then
  exit 0
fi

if browser_launches; then
  echo "${browser} launches with the libraries already installed."
  exit 0
fi

echo "${browser} did not launch; installing system libraries without fallback fonts."
retry "apt-get update" 1 3m sudo DEBIAN_FRONTEND=noninteractive apt-get update -o Acquire::Retries=5 || true

# install -s does not need root. Cap it so a stuck apt cannot hold the job.
dry_run_out=$(mktemp)
timeout --kill-after=10s 2m npx playwright install-deps --dry-run "$browser" >"$dry_run_out" 2>&1 || true
mapfile -t packages < <(filter_dep_lines <"$dry_run_out" || true)
rm -f "$dry_run_out"
clean=()
for pkg in "${packages[@]}"; do
  case "$pkg" in
    [a-z0-9]*) clean+=("$pkg") ;;
  esac
done

if ((${#clean[@]} > 0)); then
  echo "Installing ${#clean[@]} libraries."
  retry "library install (${browser})" 2 7m sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "${clean[@]}" || true
fi

if browser_launches; then
  echo "${browser} launches after the library install."
  exit 0
fi

echo "${browser} still does not launch; running Playwright's full install-deps."
if retry "playwright install-deps (${browser})" 1 7m npx playwright install-deps "$browser" && browser_launches; then
  echo "${browser} launches after install-deps."
  exit 0
fi

echo "::error::${browser} does not launch after installing its system libraries"
exit 1
