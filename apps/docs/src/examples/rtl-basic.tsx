import { Alert, Button, ButtonGroup, Field, Input, Switch } from 'onesmallui';

// Set dir="rtl" on <html> (or any element). Components use logical
// properties, so spacing, borders, icons and toolbars mirror automatically.
export default function Example() {
  return (
    <div dir="rtl" lang="ar" className="os-grid os-gap-4">
      <Alert color="info" title="مرحبا">هذا تنبيه من اليمين إلى اليسار.</Alert>
      <ButtonGroup aria-label="التنقل" variant="outline">
        <Button>السابق</Button>
        <Button active>اليوم</Button>
        <Button>التالي</Button>
      </ButtonGroup>
      <Field label="البريد الإلكتروني">
        <Input type="email" startAdornment="@" dir="ltr" />
      </Field>
      <Switch label="الإشعارات" defaultChecked />
    </div>
  );
}
