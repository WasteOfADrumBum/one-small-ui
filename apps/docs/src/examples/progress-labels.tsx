import { Progress } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <Progress label="Upload" value={64} showValue="inside" />
      <Progress label="Files copied" value={18} max={24} showValue="inside" size="lg" color="success" formatValue={(v, max) => `${v} of ${max} files`} />
      <Progress label="Diagnostics" value={40} striped color="info" showValue />
      <Progress label="Downloading star charts" value={75} animated color="accent" showValue="inside" />
      <Progress label="Hidden label, still announced" hideLabel value={30} striped animated color="warning" size="lg" />
    </div>
  );
}
