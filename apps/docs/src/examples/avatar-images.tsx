import { Avatar, AvatarGroup } from '@onesmall/ui';

// Portrait, landscape and square images all crop to the avatar's square.
const images = ['avatars/portrait.svg', 'avatars/landscape.svg', 'avatars/square.svg'];

export default function Example() {
  return (
    <div className="os-grid os-gap-5">
      <div className="os-flex os-flex-wrap os-items-center os-gap-4">
        {images.map((src) => (
          <Avatar key={src} name="Mae Jemison" src={src} size="xl" status="online" />
        ))}
        {images.map((src) => (
          <Avatar key={src} name="Mae Jemison" src={src} size="xl" shape="square" />
        ))}
      </div>
      <AvatarGroup label="Mission crew" size="lg">
        {images.map((src, i) => (
          <Avatar key={src} name={['Mae Jemison', 'Sally Ride', 'Ellen Ochoa'][i]!} src={src} />
        ))}
        <Avatar name="Guion Bluford" color="info" />
      </AvatarGroup>
    </div>
  );
}
