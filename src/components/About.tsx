import { bio, site } from '@/lib/content';
import { renderHeadline } from '@/lib/headline';

export function About() {
  const copy = site.sections.about;

  return (
    <section id="about" className="about section-grid" aria-labelledby="about-title">
      <div className="about-marker">{copy.marker}</div>
      <div className="about-photo-block">
        <img src={site.images.about.src} alt={site.images.about.alt} />
        {copy.photoCaption ? <span>{copy.photoCaption}</span> : null}
      </div>
      <div className="about-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="about-title">{renderHeadline(copy.headline)}</h2>
        <div className="about-copy">
          {bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
