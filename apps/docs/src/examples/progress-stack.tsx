import { ProgressStack } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <ProgressStack
        label="Cargo hold capacity"
        legend
        segments={[
          { label: 'Food', value: 30, color: 'success' },
          { label: 'Fuel cells', value: 22, color: 'warning' },
          { label: 'Equipment', value: 18, color: 'info' },
        ]}
      />
      <ProgressStack
        label="Mission phases"
        size="lg"
        segments={[
          { label: 'Launch', value: 25, color: 'primary', showValue: true },
          { label: 'Transfer', value: 35, color: 'accent', showValue: true, striped: true },
          { label: 'Landing', value: 15, color: 'danger', showValue: true, animated: true },
        ]}
      />
    </div>
  );
}
