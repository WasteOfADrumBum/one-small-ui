// Orbital math for the landing-page solar system (SolarSystem.tsx).
// Simulation time is in years; distances on screen are in view units of a 400 x 400 box.

export interface Planet {
  name: string;
  /** Semi-major axis in AU. */
  au: number;
  /** Orbital eccentricity, used only to flatten the drawn ellipse slightly. */
  e: number;
  /** Drawn radius in view units (size tier, with a floor so small planets stay visible). */
  size: number;
  /** Parametric angle at t = 0, in radians. */
  phase: number;
  ring?: boolean;
}

export const PLANETS: Planet[] = [
  { name: 'Mercury', au: 0.387, e: 0.206, size: 3, phase: 0.6 },
  { name: 'Venus', au: 0.723, e: 0.007, size: 4, phase: 2.4 },
  { name: 'Earth', au: 1, e: 0.017, size: 5, phase: 3.5 },
  { name: 'Mars', au: 1.524, e: 0.093, size: 3.4, phase: 0 }, // set below so the first launch comes early
  { name: 'Jupiter', au: 5.203, e: 0.049, size: 8, phase: 5.2 },
  { name: 'Saturn', au: 9.537, e: 0.057, size: 6.6, phase: 1.3, ring: true },
  { name: 'Uranus', au: 19.19, e: 0.046, size: 5.2, phase: 4.3 },
  { name: 'Neptune', au: 30.07, e: 0.01, size: 5, phase: 0.2 },
];

export const EARTH = 2;
export const MARS = 3;

export const VIEW = 400;
export const CENTER = VIEW / 2;
export const SUN_RADIUS = 48;
const R_MIN = 60;
const R_MAX = 184;

/** Orbital plane tilt: 60° from face-on. */
export const TILT = (60 * Math.PI) / 180;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);

/** Kepler's third law: P² = a³ (years, AU). */
export const period = (au: number) => au ** 1.5;

/** Time scale: Mercury completes one orbit in about 4 seconds. */
export const YEARS_PER_SECOND = period(PLANETS[0].au) / 4;

/** Log-scaled orbit radius, so all eight fit and the inner four stay apart. */
export function orbitRadius(au: number) {
  const lo = Math.log(PLANETS[0].au);
  const hi = Math.log(PLANETS[PLANETS.length - 1].au);
  return R_MIN + ((Math.log(au) - lo) / (hi - lo)) * (R_MAX - R_MIN);
}

/** Drawn orbit ellipse in the orbital plane: semi-axes in view units. */
export function orbitAxes(p: Planet) {
  const a = orbitRadius(p.au);
  return { a, b: a * Math.sqrt(1 - p.e * p.e) };
}

export interface Vec {
  x: number;
  y: number;
}

/** Position in the orbital plane (x right, y away from the viewer), centered on the Sun. */
export function planetPosition(p: Planet, years: number): Vec {
  const { a, b } = orbitAxes(p);
  const theta = p.phase + (2 * Math.PI * years) / period(p.au);
  return { x: a * Math.cos(theta), y: b * Math.sin(theta) };
}

export interface Projected {
  x: number;
  y: number;
  /** Depth: positive is nearer the viewer (in front of the Sun). */
  z: number;
}

/** Rotate the orbital plane by TILT and project orthographically onto the screen. */
export function project(v: Vec): Projected {
  return { x: CENTER + v.x, y: CENTER - v.y * COS_T, z: -v.y * SIN_T };
}

/** Orbital speed on screen in view units per real second (used to keep trails planet-led). */
export function screenSpeed(p: Planet) {
  return (2 * Math.PI * orbitRadius(p.au)) / (period(p.au) / YEARS_PER_SECOND);
}

// ---------- Hohmann transfer, Earth to Mars ----------

/** Half the period of the transfer ellipse whose perihelion is Earth's orbit and aphelion is Mars's. */
export const TRANSFER_YEARS = 0.5 * period((PLANETS[EARTH].au + PLANETS[MARS].au) / 2);

const nEarth = (2 * Math.PI) / period(PLANETS[EARTH].au);
const nMars = (2 * Math.PI) / period(PLANETS[MARS].au);
/** Launch windows repeat once per Earth–Mars synodic period. */
export const SYNODIC_YEARS = (2 * Math.PI) / (nEarth - nMars);

// Place Mars so the first window opens shortly after the page loads.
const FIRST_LAUNCH = 1.5 * YEARS_PER_SECOND;
PLANETS[MARS].phase = PLANETS[EARTH].phase + Math.PI + nEarth * FIRST_LAUNCH - nMars * (FIRST_LAUNCH + TRANSFER_YEARS);

// ---------- The Moon ----------

/** Sidereal month: about 13.4 lunar orbits per Earth year. */
export const MOON = { orbit: 12, size: 1.9, perYear: 13.37, phase: 0.8 };

/** The Moon in the orbital plane: Earth's position plus a tight circular orbit, same tilt. */
export function moonPosition(years: number): Vec {
  const earth = planetPosition(PLANETS[EARTH], years);
  const psi = MOON.phase + 2 * Math.PI * MOON.perYear * years;
  return { x: earth.x + MOON.orbit * Math.cos(psi), y: earth.y + MOON.orbit * Math.sin(psi) };
}

// ---------- Launch schedule ----------

export interface Flight {
  launch: number;
  duration: number;
}

const flights = new Map<number, Flight>();
const MONTH = 1 / MOON.perYear;

/**
 * Launch k. The ideal launch is the k-th Hohmann window (Mars about 44° ahead of Earth).
 * It may move by up to half a lunar month so the Moon is out of the rocket's way as it
 * leaves Earth; the flight time then changes by the same phase drift (under 4%) so the
 * rocket still arrives exactly on Mars.
 */
export function flight(k: number): Flight {
  const cached = flights.get(k);
  if (cached) return cached;
  const ideal = FIRST_LAUNCH + k * SYNODIC_YEARS;
  let best: Flight = { launch: ideal, duration: TRANSFER_YEARS };
  let bestGap = -1;
  for (let i = 0; i <= 48; i++) {
    const shift = (i / 48 - 0.5) * MONTH;
    const f = { launch: ideal + shift, duration: TRANSFER_YEARS + (shift * (nEarth - nMars)) / nMars };
    let gap = Infinity;
    for (let j = 0; j <= 8; j++) {
      const t = j * 0.05 * YEARS_PER_SECOND; // liftoff: the first 0.4 seconds
      gap = Math.min(gap, rocketMoonGap(f, t));
    }
    if (gap > bestGap) {
      bestGap = gap;
      best = f;
    }
  }
  flights.set(k, best);
  return best;
}

/** The rocket grows from 20% to full size over its first 0.6 seconds, as it lifts off Earth. */
export const LIFTOFF_SECONDS = 0.6;
export const liftoffScale = (t: number) => 0.2 + 0.8 * Math.min(1, t / (LIFTOFF_SECONDS * YEARS_PER_SECOND));
/** Rocket extent along its heading, in view units at full size: tail of the flame to the nose. */
export const ROCKET_EXTENT = { tail: -13, nose: 9.5 };

/** Screen distance from the Moon to the rocket's tail-to-nose line, `t` years after launch. */
function rocketMoonGap(f: Flight, t: number) {
  const s = t / f.duration;
  const at = project(transferPosition(f, s));
  const ahead = project(transferPosition(f, s + 0.005));
  const len = Math.hypot(ahead.x - at.x, ahead.y - at.y) || 1;
  const ux = (ahead.x - at.x) / len;
  const uy = (ahead.y - at.y) / len;
  const k = liftoffScale(t);
  const moon = project(moonPosition(f.launch + t));
  const along = Math.min(Math.max((moon.x - at.x) * ux + (moon.y - at.y) * uy, ROCKET_EXTENT.tail * k), ROCKET_EXTENT.nose * k);
  return Math.hypot(moon.x - (at.x + ux * along), moon.y - (at.y + uy * along));
}

/** The flight in progress at `years` (until `tail` years after arrival), or else the next one. */
export function flightAt(years: number, tail = 0): Flight {
  let k = Math.max(0, Math.floor((years - FIRST_LAUNCH) / SYNODIC_YEARS) - 1);
  while (years >= flight(k).launch + flight(k).duration + tail) k++;
  return flight(k);
}

/** Solve Kepler's equation M = E − e·sin E for the eccentric anomaly. */
export function eccentricAnomaly(M: number, e: number) {
  let E = M;
  for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/**
 * Rocket position on the transfer arc, `s` from 0 (launch) to 1 (arrival), in the orbital plane.
 * The arc is half a conic with the Sun at its focus, from Earth at launch to Mars at arrival,
 * and the rocket moves along it with Kepler timing (fast near Earth, slow near Mars).
 */
export function transferPosition({ launch, duration }: Flight, s: number): Vec {
  const from = planetPosition(PLANETS[EARTH], launch);
  const to = planetPosition(PLANETS[MARS], launch + duration);
  const r1 = Math.hypot(from.x, from.y);
  const r2 = Math.hypot(to.x, to.y);
  const a0 = Math.atan2(from.y, from.x);
  let sweep = Math.atan2(to.y, to.x) - a0;
  sweep = ((sweep % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); // ≈ π, counterclockwise

  const e = (r2 - r1) / (r2 + r1);
  const p = (2 * r1 * r2) / (r1 + r2);
  const E = eccentricAnomaly(Math.PI * Math.min(Math.max(s, 0), 1), e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = p / (1 + e * Math.cos(nu));
  const angle = a0 + (nu / Math.PI) * sweep;
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
}
