import { Field, Input } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8 md:os-grid-cols-2">
      <div className="os-grid os-gap-4">
        <Field label="Username" error="That name is taken.">
          <Input defaultValue="nova" autoComplete="username" />
        </Field>
        <Field label="Display name" success="Looks great.">
          <Input defaultValue="Nova Seven" />
        </Field>
      </div>
      <div className="os-grid os-gap-12">
        <Field label="Promo code" feedback="tooltip" error="Code expired.">
          <Input defaultValue="WARP2025" />
        </Field>
        <Field label="Referral" feedback="tooltip" success="Applied.">
          <Input defaultValue="ADA-1815" />
        </Field>
      </div>
    </div>
  );
}
