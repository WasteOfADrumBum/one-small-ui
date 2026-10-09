import { Card, CardBody, Container, Grid, Stack } from 'onesmallui';

export default function Example() {
  return (
    <Container size="full" className="os-px-0">
      <Stack gap={6}>
        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 3, md: 4 }}>
          {['Alpha', 'Beta', 'Gamma', 'Delta'].map((n) => (
            <Card key={n} variant="outline">
              <CardBody>{n}</CardBody>
            </Card>
          ))}
        </Grid>
        <Grid minItemWidth="12rem" gap={3}>
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardBody>Auto-fit {i + 1}</CardBody>
            </Card>
          ))}
        </Grid>
        <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
          <Card className="os-flex-1">
            <CardBody>Stacks on mobile…</CardBody>
          </Card>
          <Card className="os-flex-1">
            <CardBody>…sits in a row from md up.</CardBody>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
