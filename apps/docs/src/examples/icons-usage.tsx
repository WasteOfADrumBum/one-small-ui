import { Button } from '@onesmall/ui';
import { DownloadIcon, SettingsIcon, StarIcon, WarningIcon } from '@onesmall/ui/icons';

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      {/* Sizes: sm 16px, md 20px (default), lg 24px, or any number of pixels. */}
      <div className="os-flex os-items-center os-gap-4">
        <StarIcon size="sm" />
        <StarIcon size="md" />
        <StarIcon size="lg" />
        <StarIcon size={32} strokeWidth={1.5} />
      </div>

      {/* Next to text, icons are decorative: no label. */}
      <div className="os-flex os-flex-wrap os-gap-2">
        <Button leftIcon={<DownloadIcon />}>Download report</Button>
        {/* Icon-only button: name the button, not the icon. */}
        <Button iconOnly variant="ghost" aria-label="Settings">
          <SettingsIcon />
        </Button>
      </div>

      {/* Standalone and meaningful: give it a label. */}
      <p className="os-flex os-items-center os-gap-2 os-mb-0">
        <WarningIcon label="Warning" /> Fuel below 20%
      </p>
    </div>
  );
}
