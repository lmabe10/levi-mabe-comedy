import { useState } from 'react';
import { ChevronRight, Play } from 'lucide-react';
import { site, videos } from '@/lib/content';
import { renderHeadline } from '@/lib/headline';
import { youtubeThumb } from '@/lib/youtube';

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return { lead: title, rest: '' };
  const mid = Math.ceil(words.length / 2);
  return {
    lead: words.slice(0, mid).join(' '),
    rest: words.slice(mid).join(' '),
  };
}

export function Videos() {
  const copy = site.sections.videos;
  const [playing, setPlaying] = useState<string | null>(null);
  const featured = videos.featured;
  const featuredThumb = youtubeThumb(featured.youtubeUrl) || site.images.about.src;
  const featuredParts = splitTitle(featured.title);

  return (
    <section id="videos" className="videos" aria-labelledby="videos-title">
      <div className="videos-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="videos-title">{renderHeadline(copy.headline)}</h2>
      </div>
      <div className="featured-video" style={{ backgroundImage: `url(${featuredThumb})` }}>
        <div className="video-overlay">
          <h3>
            {featuredParts.lead}
            {featuredParts.rest ? (
              <>
                <br />
                <em>{featuredParts.rest}</em>
              </>
            ) : null}
          </h3>
          <button
            className="play-button"
            onClick={() => setPlaying(playing === featured.id ? null : featured.id)}
            aria-label={`Play ${featured.title}`}
          >
            <Play size={22} fill="currentColor" />
          </button>
          {playing === featured.id && <p className="playing-label">{copy.previewLabel}</p>}
        </div>
      </div>
      {videos.additional.length > 0 ? (
        <div className="video-list">
          {videos.additional.map((video) => {
            const thumb = youtubeThumb(video.youtubeUrl) || site.images.about.src;
            return (
              <article className="supporting-video" key={video.id}>
                <div className="supporting-image" style={{ backgroundImage: `url(${thumb})` }}>
                  <button
                    className="small-play"
                    onClick={() => setPlaying(playing === video.id ? null : video.id)}
                    aria-label={`Play ${video.title}`}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="supporting-meta">
                  <h3>{video.title}</h3>
                  <ChevronRight size={20} />
                </div>
                {playing === video.id && <p className="playing-label dark">{copy.previewLabel}</p>}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
