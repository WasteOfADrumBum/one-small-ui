import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, Range, Switch } from '@onesmall/ui';
import { CockpitFrame } from './CockpitFrame';
import { Radar, type RadarContact } from './Radar';
import { SCENE, SpaceScene } from './SpaceScene';
import { ViewportWindow } from './ViewportWindow';
import './cockpit.scss';

const CONTACTS: RadarContact[] = [
  { id: 'moon', name: 'Moon', bearing: 302, distance: 0.82, range: '384,400 km' },
  { id: 'satellite', name: 'Relay satellite', bearing: 38, distance: 0.42, range: '1,240 km' },
  { id: 'unknown-1', name: 'Unknown contact 1', bearing: 128, distance: 0.66, range: '8,900 km', unknown: true },
  { id: 'unknown-2', name: 'Unknown contact 2', bearing: 214, distance: 0.3, range: '2,300 km', unknown: true },
];

const COOLANT_LOW = 40;

const WOBBLE: Keyframe[] = [
  { transform: 'none' },
  { transform: 'translate(-3px, 1px) rotate(-0.35deg)' },
  { transform: 'translate(2px, -1px) rotate(0.25deg)' },
  { transform: 'translate(-1px, 0) rotate(-0.1deg)' },
  { transform: 'none' },
];

const reducedQuery = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null);

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
type Tilt = 'off' | 'ask' | 'on';

interface MeterProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: 'primary' | 'success' | 'warning';
  low?: boolean;
}

/** A labelled `role="meter"` styled like the library's Progress, plus a Range to set it for the demo. */
function HudMeter({ id, label, value, onChange, color, low }: MeterProps) {
  return (
    <div className="docs-mission__meter">
      <div className="os-progress" data-color={low ? 'warning' : color} data-size="md">
        <div className="os-progress__meta">
          <span id={id}>{label}</span>
          <span aria-hidden="true">
            {value}%{low && ' · Low'}
          </span>
        </div>
        <div
          role="meter"
          aria-labelledby={id}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={low ? `${value}%, low` : `${value}%`}
          className="os-progress__track"
        >
          <span className="os-progress__bar" data-striped={low || undefined} style={{ width: `${value}%` }} />
        </div>
      </div>
      <Range
        size="sm"
        value={value}
        onValueChange={onChange}
        aria-label={`Set ${label.toLowerCase()}`}
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
}

/** The landing page's "Mission control" demo: a cockpit HUD whose panels drive the view outside. */
export function MissionControl() {
  const [reduced, setReduced] = useState(() => !!reducedQuery()?.matches);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [core, setCore] = useState(72);
  const [shield, setShield] = useState(91);
  const [coolant, setCoolant] = useState(38);
  const [autopilot, setAutopilot] = useState(true);
  const [dampers, setDampers] = useState(true);
  const [cloak, setCloak] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tilt, setTilt] = useState<Tilt>('off');
  const frameRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  const running = !reduced && !paused && visible;
  const caution = coolant < COOLANT_LOW;

  // Offscreen or hidden tab: pause. Reduced motion: stop for good.
  useEffect(() => {
    const frame = frameRef.current!;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(frame);
    document.addEventListener('visibilitychange', update);
    const motion = reducedQuery();
    const onMotion = () => setReduced(!!motion?.matches);
    motion?.addEventListener('change', onMotion);
    const Orientation = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null) as OrientationCtor | null;
    if (Orientation && matchMedia('(pointer: coarse)').matches) setTilt(Orientation.requestPermission ? 'ask' : 'on');
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
      motion?.removeEventListener('change', onMotion);
    };
  }, []);

  // Parallax: the starfield leans toward the pointer (fine pointers) or the device tilt.
  useEffect(() => {
    const view = viewRef.current!;
    const frame = frameRef.current!;
    let raf = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        view.style.setProperty('--px', Math.max(-1, Math.min(1, x)).toFixed(3));
        view.style.setProperty('--py', Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    if (!running) {
      set(0, 0);
      return () => cancelAnimationFrame(raf);
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = view.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => set(0, 0);
    const onTilt = (e: DeviceOrientationEvent) => set((e.gamma ?? 0) / 30, ((e.beta ?? 45) - 45) / 30);
    frame.addEventListener('pointermove', onPointer);
    frame.addEventListener('pointerleave', onLeave);
    if (tilt === 'on') window.addEventListener('deviceorientation', onTilt);
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener('pointermove', onPointer);
      frame.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [running, tilt]);

  const askTilt = async () => {
    const Orientation = DeviceOrientationEvent as OrientationCtor;
    try {
      setTilt((await Orientation.requestPermission?.()) === 'granted' ? 'on' : 'off');
    } catch {
      setTilt('off');
    }
  };

  const toggleDampers = (on: boolean) => {
    setDampers(on);
    if (!on && running) viewRef.current?.animate(WOBBLE, { duration: 900, easing: 'ease-out' });
  };

  const target = CONTACTS.find((c) => c.id === selected);
  const sceneLabel =
    "View from the cockpit: Earth's curved horizon glows along the bottom of both windows, the Moon sits small in the upper left, " +
    'a relay satellite drifts across the panes and sunlight glares in from the upper left.' +
    (target ? ` Highlighted: ${target.name}.` : '');
  const sceneProps = { selected, shield: (shield / 100) * 0.3, autopilot };

  return (
    <CockpitFrame ref={frameRef} glow={core / 100} cloaked={cloak} data-motion={running ? 'on' : 'paused'} className="docs-mission">
      <div ref={viewRef} className="docs-mission__view" role="img" aria-label={sceneLabel}>
        <ViewportWindow side="left" viewBox={`0 0 ${SCENE.width / 2} ${SCENE.height}`}>
          <SpaceScene idPrefix="cockpit-l" {...sceneProps} />
        </ViewportWindow>
        <ViewportWindow side="right" viewBox={`${SCENE.width / 2} 0 ${SCENE.width / 2} ${SCENE.height}`}>
          <SpaceScene idPrefix="cockpit-r" {...sceneProps} />
        </ViewportWindow>
      </div>

      <div className="docs-mission__console">
        {reduced ? (
          <p className="docs-mission__note">Ambient motion is off because your system asks for reduced motion.</p>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            color="neutral"
            leftIcon={
              paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l10.5-6.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6.5" y="5" width="4" height="14" rx="1" />
                  <rect x="13.5" y="5" width="4" height="14" rx="1" />
                </svg>
              )
            }
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? 'Play motion' : 'Pause motion'}
          </Button>
        )}
        {tilt === 'ask' && !reduced && (
          <Button size="sm" variant="ghost" color="neutral" onClick={askTilt}>
            Tilt to look around
          </Button>
        )}
      </div>

      <Card variant="glass" as="article" className="docs-mission__radar">
        <CardHeader>
          <h3>Radar</h3>
        </CardHeader>
        <CardBody>
          <Radar contacts={CONTACTS} selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} />
        </CardBody>
      </Card>

      <Card variant="glass" glow as="article" className="docs-mission__reactor">
        <CardHeader>
          <h3>Reactor status</h3>
          <span role="status">
            {caution ? (
              <Badge color="warning" dot>
                Caution
              </Badge>
            ) : (
              <Badge color="success" dot pulse={running}>
                Stable
              </Badge>
            )}
          </span>
        </CardHeader>
        <CardBody className="os-grid os-gap-4">
          <HudMeter id="meter-core" label="Core output" value={core} onChange={setCore} color="primary" />
          <HudMeter id="meter-shield" label="Shield integrity" value={shield} onChange={setShield} color="success" />
          <HudMeter id="meter-coolant" label="Coolant" value={coolant} onChange={setCoolant} color="primary" low={caution} />
        </CardBody>
      </Card>

      <Card variant="glass" as="article" className="docs-mission__flight">
        <CardHeader>
          <h3>Flight systems</h3>
        </CardHeader>
        <CardBody>
          <Switch
            label="Autopilot"
            description={autopilot ? 'Satellite tracked' : 'Satellite drifting'}
            checked={autopilot}
            aria-checked={autopilot}
            onChange={(e) => setAutopilot(e.target.checked)}
          />
          <Switch
            label="Inertial dampers"
            description="Keeps the crew upright"
            checked={dampers}
            aria-checked={dampers}
            onChange={(e) => toggleDampers(e.target.checked)}
          />
          <Switch label="Cloaking field" checked={cloak} aria-checked={cloak} onChange={(e) => setCloak(e.target.checked)} />
        </CardBody>
      </Card>
    </CockpitFrame>
  );
}
