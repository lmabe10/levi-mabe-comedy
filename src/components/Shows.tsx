import { ArrowUpRight } from 'lucide-react';
import {
  getDateDay,
  getDateMonth,
  getDayOfWeek,
  shows,
  site,
} from '@/lib/content';
import { renderHeadline } from '@/lib/headline';

export function Shows() {
  const copy = site.sections.shows;

  return (
    <section id="shows" className="shows" aria-labelledby="shows-title">
      <div className="shows-intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="shows-title">{renderHeadline(copy.headline)}</h2>
        <p className="shows-note">{copy.note}</p>
      </div>
      <div className="shows-list">
        {shows.map((show) => {
          const soldOut = show.status?.toLowerCase() === 'sold out';
          const ticketHref = show.ticketUrl?.trim() || '#contact';

          return (
            <article className="show-row" key={show.id}>
              <div className="show-date">
                <span>{getDateMonth(show.date)}</span>
                <strong>{getDateDay(show.date)}</strong>
                <span>{getDayOfWeek(show.date, 'short').toUpperCase()}</span>
              </div>
              <div className="show-time">{show.time}</div>
              <div className="show-location">
                <strong>
                  {show.city}, {show.state}
                </strong>
                <span className="show-venue">{show.venue}</span>
                <span className="show-detail">{show.detail || copy.defaultDetail}</span>
              </div>
              <div className="show-status">
                {show.status ? <span>{show.status}</span> : null}
                {soldOut ? null : (
                  <a href={ticketHref}>
                    {copy.ticketsLabel} <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="shows-footer">
        <span>{copy.moreDates}</span>
      </div>
    </section>
  );
}
