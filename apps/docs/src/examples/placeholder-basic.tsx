import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardText, CardTitle, Placeholder, Skeleton } from 'onesmallui';

export default function Example() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      {/* Mark the region busy while it loads; placeholders themselves are hidden from assistive tech. */}
      <Card as="article" aria-busy={loading} aria-label={loading ? 'Loading crew profile' : undefined}>
        <CardBody>
          {loading ? (
            <>
              {/* Not a heading while loading: an empty heading would be announced. */}
              <CardTitle as="div">
                <Placeholder width={55} />
              </CardTitle>
              <CardText as="div">
                <Placeholder width={90} /> <Placeholder width={70} /> <Placeholder width={40} />
              </CardText>
              <Placeholder width="6rem" size="lg" className="os-rounded-md" />
            </>
          ) : (
            <>
              <CardTitle>Commander Vega</CardTitle>
              <CardText>Twelve missions, three spacewalks and a perfect docking record.</CardText>
              <Button size="sm" onClick={() => setLoading(true)}>
                Reload
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <div className="os-flex os-gap-4" role="group" aria-busy="true" aria-label="Loading profile">
        <Skeleton shape="circle" />
        <div className="os-flex-1 os-grid os-gap-3">
          <Skeleton width="40%" />
          <Skeleton lines={3} />
          <Skeleton shape="rect" height="5rem" />
        </div>
      </div>
    </div>
  );
}
