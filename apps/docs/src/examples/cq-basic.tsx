// .os-cq makes an element a size container. cq-sm:, cq-md:, cq-lg:, cq-xl: variants respond to
// its width instead of the viewport, so the same card adapts in a sidebar or a main column.
export default function Example() {
  const card = (
    <div className="os-cq">
      <div className="os-flex os-flex-col cq-sm:os-flex-row os-gap-4 os-p-4 os-rounded-lg os-bg-surface os-border">
        <div className="os-ratio-1x1 os-rounded-md os-bg-accent-soft" style={{ width: '5rem', flexShrink: 0 }} aria-hidden="true" />
        <div>
          <p className="os-font-semibold os-mb-1">Adaptive card</p>
          <p className="os-text-sm os-text-muted os-mb-0">Stacks when narrow, sits in a row from 24rem of container width.</p>
          <p className="os-hidden cq-md:os-block os-text-sm os-mt-2 os-mb-0">This line appears from 36rem.</p>
        </div>
      </div>
    </div>
  );
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <div>{card}</div>
      <div className="md:os-col-span-2">{card}</div>
    </div>
  );
}
