import { Avatar } from 'onesmallui';

const colors = [
  ['primary', 'Pia Rao'],
  ['secondary', 'Sam Ito'],
  ['accent', 'Ari Cole'],
  ['success', 'Sue Lin'],
  ['warning', 'Wes Hart'],
  ['danger', 'Dee Moss'],
  ['info', 'Ivo Park'],
  ['inverse', 'Ines Vo'],
] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <div className="os-flex os-flex-wrap os-items-center os-gap-4">
        <Avatar name="Ada Lovelace" size="xs" />
        <Avatar name="Ada Lovelace" size="sm" status="online" />
        <Avatar name="Grace Hopper" status="away" />
        <Avatar
          name="Mae Jemison"
          size="lg"
          status="busy"
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=70"
        />
        <Avatar name="Neil Armstrong" size="xl" shape="square" status="offline" />
        <Avatar name="Sally Ride" size="2xl" status="online" />
      </div>
      <div className="os-flex os-flex-wrap os-items-center os-gap-3">
        {colors.map(([color, name]) => (
          <Avatar key={color} name={name} color={color} />
        ))}
      </div>
    </div>
  );
}
