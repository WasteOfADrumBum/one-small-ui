import { Placeholder, Skeleton } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-2">
        <p className="os-text-sm os-font-semibold">Animation: wave, pulse, none</p>
        <Skeleton animation="wave" />
        <Skeleton animation="pulse" />
        <Skeleton animation="none" />
      </div>
      <div className="os-grid os-gap-2">
        <p className="os-text-sm os-font-semibold">Width (number = %, or any CSS width)</p>
        <Placeholder width={100} />
        <Placeholder width={75} />
        <Placeholder width={50} />
        <Placeholder width="8rem" />
      </div>
      <div className="os-grid os-gap-2">
        <p className="os-text-sm os-font-semibold">Size: lg, md, sm, xs</p>
        <Placeholder size="lg" />
        <Placeholder size="md" />
        <Placeholder size="sm" />
        <Placeholder size="xs" />
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-4">
        {colors.map((c) => (
          <Placeholder key={c} color={c} animation="pulse" />
        ))}
      </div>
    </div>
  );
}
