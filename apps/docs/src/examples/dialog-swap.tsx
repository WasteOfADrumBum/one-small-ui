import { useRef, useState } from 'react';
import { Button, Dialog } from 'onesmallui';

// Open a second dialog from the first. Focus returns to the original trigger.
export default function Example() {
  const [step, setStep] = useState<'one' | 'two' | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={trigger} onClick={() => setStep('one')}>
        Start check-in
      </Button>
      <Dialog
        open={step === 'one'}
        onClose={() => setStep(null)}
        returnFocus={trigger}
        title="Step 1: Identity"
        footer={<Button onClick={() => setStep('two')}>Continue</Button>}
      >
        <p>Confirm your crew ID before boarding.</p>
      </Dialog>
      <Dialog
        open={step === 'two'}
        onClose={() => setStep(null)}
        returnFocus={trigger}
        title="Step 2: Quarters"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStep('one')}>
              Back
            </Button>
            <Button onClick={() => setStep(null)}>Finish</Button>
          </>
        }
      >
        <p>You are assigned to deck 3, cabin 12.</p>
      </Dialog>
    </>
  );
}
