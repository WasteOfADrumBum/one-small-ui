import { Container } from 'onesmallui';

// .os-container steps its max width at each breakpoint; .os-container-md stays fluid until md;
// .os-container-fluid never caps. The Container component does the same with size="responsive".
export default function Example() {
  const box = 'os-p-3 os-rounded-md os-bg-primary-soft os-border os-border-primary-subtle';
  return (
    <div className="os-grid os-gap-3">
      <div className="os-container">
        <div className={box}>.os-container</div>
      </div>
      <div className="os-container-md">
        <div className={box}>.os-container-md (100% wide below 768px)</div>
      </div>
      <div className="os-container-fluid">
        <div className={box}>.os-container-fluid</div>
      </div>
      <Container size="responsive">
        <div className={box}>{'<Container size="responsive">'}</div>
      </Container>
    </div>
  );
}
