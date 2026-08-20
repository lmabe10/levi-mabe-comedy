import { site, splitCorner } from '@/lib/content';
import { SocialLinks } from '@/components/SocialLinks';

export function Hero() {
  const copy = site.sections.hero;
  const corner = splitCorner(copy.corner);
  const [labelMain, labelRest] = copy.verticalLabel.split('●').map((part) => part.trim());

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-coral" />
      <div className="hero-apricot" />
      <div className="hero-teal" />
      <div className="hero-vertical-label">
        {labelMain}
        {labelRest ? (
          <>
            {' '}
            <span>●</span> {labelRest}
          </>
        ) : null}
      </div>
      <div className="hero-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="hero-title">
          {site.firstName}
          <br />
          <em>{site.lastName}</em>
        </h1>
        <p className="hero-intro">{copy.intro}</p>
        <SocialLinks compact />
      </div>
      <div className="hero-portrait-wrap">
        <img className="hero-portrait" src={site.images.headshot.src} alt={site.images.headshot.alt} />
        <div className="portrait-caption">{copy.portraitCaption}</div>
      </div>
      {corner ? (
        <div className="hero-corner">
          {corner.before} <span>/</span> {corner.after}
        </div>
      ) : (
        <div className="hero-corner">{copy.corner}</div>
      )}
    </section>
  );
}
