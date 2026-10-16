import { LightboxGallery, type LightboxImage } from '@onesmall/ui';

// Each photo ships at 640 and 1280px wide plus a square thumbnail (files in the docs' public/gallery).
const photos: [name: string, alt: string, caption: string, portrait?: boolean][] = [
  ['harbor', 'Fishing boats moored in a harbor at dawn', 'Harbor at dawn, the fleet still at anchor.'],
  ['dunes', 'Wind-carved sand dunes under a pale sky', 'Dunes after a night of wind.'],
  ['lake', 'A still mountain lake below forested hills', 'Glass-calm water before the breeze.'],
  ['city', 'City towers with lit windows at night', 'Downtown after dark.', true],
  ['forest', 'Pine forest fading into morning fog', 'Fog lifting through the pines.'],
  ['cliffs', 'A grassy sea cliff above deep blue water', 'The headland at midday.'],
  ['aurora', 'Green aurora over dark hills', 'Aurora over the ridge, 2 a.m.'],
  ['terraces', 'Green rice terraces stepping down a hillside', 'Terraces in early summer.'],
  ['sunset', 'The sun setting over the sea, its reflection in stripes', 'Last light over the bay.'],
  ['peaks', 'Snow-covered peaks against a blue sky', 'Peaks after the first snow.', true],
  ['lavender', 'Rows of lavender running to the horizon', 'Lavender rows at golden hour.'],
  ['canyon', 'Red canyon walls above a turquoise river', 'Looking down the canyon.'],
];

const images: LightboxImage[] = photos.map(([name, alt, caption, portrait]) => ({
  src: `gallery/${name}-1280.jpg`,
  srcSet: `gallery/${name}-640.jpg 640w, gallery/${name}-1280.jpg 1280w`,
  sizes: '100vw',
  thumbnail: `gallery/${name}-thumb.jpg`,
  width: portrait ? 853 : 1280,
  height: portrait ? 1280 : name === 'terraces' ? 960 : 853,
  alt,
  caption,
  download: true,
}));

export default function Example() {
  return <LightboxGallery images={images} aria-label="Landscape photography" minItemSize="9rem" lightboxProps={{ thumbnails: true }} />;
}
