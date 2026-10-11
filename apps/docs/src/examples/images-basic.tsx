// .os-img-fluid scales an image to its container; .os-img-thumbnail adds a framed border.
export default function Example() {
  const src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&q=70';
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3 os-items-start">
      <img src={src} className="os-img-fluid" alt="Earth seen from orbit" width={900} height={600} />
      <img src={src} className="os-img-thumbnail" alt="Earth seen from orbit, framed" width={900} height={600} />
      <figure>
        <img src={src} className="os-img-fluid os-rounded-xl" alt="Earth seen from orbit, rounded" width={900} height={600} />
        <figcaption className="os-figure__caption">A caption for the image above.</figcaption>
      </figure>
    </div>
  );
}
