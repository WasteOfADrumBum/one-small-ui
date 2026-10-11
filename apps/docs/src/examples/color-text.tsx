const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

// Text colors use each role's -text shade: 7:1 on every surface in both themes.
export default function Example() {
  return (
    <div className="os-grid os-gap-1 sm:os-grid-cols-2">
      {colors.map((c) => (
        <p key={c} className={`os-text-${c} os-font-semibold os-mb-0`}>
          .os-text-{c}
        </p>
      ))}
      <p className="os-text-default os-mb-0">.os-text-default</p>
      <p className="os-text-emphasis os-font-bold os-mb-0">.os-text-emphasis</p>
      <p className="os-text-muted os-mb-0">.os-text-muted</p>
      <p className="os-text-primary os-mb-0">
        Parent primary, <span className="os-text-inherit os-underline">child .os-text-inherit</span>
      </p>
    </div>
  );
}
