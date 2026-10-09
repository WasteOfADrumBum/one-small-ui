import { Avatar, AvatarGroup } from 'onesmallui';

const crew = ['Ada Lovelace', 'Grace Hopper', 'Mae Jemison', 'Neil Armstrong', 'Sally Ride', 'Yuri Gagarin', 'Valentina Tereshkova'];
const colors = ['primary', 'accent', 'success', 'info', 'warning', 'secondary', 'danger'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-5">
      <AvatarGroup label="Bridge crew" max={4}>
        {crew.map((name, i) => (
          <Avatar key={name} name={name} color={colors[i]} />
        ))}
      </AvatarGroup>
      {/* Only a page of people loaded: pass `total` for the real count. */}
      <AvatarGroup label="Mission subscribers" size="sm" spacing="tight" total={128}>
        {crew.slice(0, 5).map((name, i) => (
          <Avatar key={name} name={name} color={colors[i]} />
        ))}
      </AvatarGroup>
      <AvatarGroup label="Flight directors" size="lg" spacing="loose" max={3}>
        {crew.map((name, i) => (
          <Avatar key={name} name={name} color={colors[i]} status={i === 0 ? 'online' : undefined} />
        ))}
      </AvatarGroup>
    </div>
  );
}
