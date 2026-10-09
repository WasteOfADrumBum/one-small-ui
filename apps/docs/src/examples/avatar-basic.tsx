import { Avatar } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-4">
      <Avatar name="Ada Lovelace" size="sm" status="online" />
      <Avatar name="Grace Hopper" status="away" />
      <Avatar
        name="Mae Jemison"
        size="lg"
        status="busy"
        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=70"
      />
      <Avatar name="Neil Armstrong" size="xl" shape="square" status="offline" />
    </div>
  );
}
