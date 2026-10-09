import { Alert, AlertHeading, AlertLink } from 'onesmallui';

const Rocket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2m6.5-3.5L9.5 9.5M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z" />
  </svg>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-3">
      <Alert color="success">
        <AlertHeading>Docking complete</AlertHeading>
        <p>
          The shuttle is secured to port 3. Crew may disembark once the pressure check passes.{' '}
          <AlertLink href="#components/alert">View the docking log</AlertLink>.
        </p>
        <hr />
        <p>Next departure is scheduled for 14:00 station time.</p>
      </Alert>
      <Alert color="accent" icon={<Rocket />} title="Custom icon">
        Pass any icon with <code>icon</code>.
      </Alert>
      <Alert color="secondary" icon={false}>
        No icon: pass <code>icon={'{false}'}</code>. Read the <AlertLink href="#components/alert">alert guidelines</AlertLink>.
      </Alert>
    </div>
  );
}
