import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getDateDay, getDateMonth, getDayOfWeek, site } from '@/lib/content';
import { fetchTourShows } from '@/lib/shows/api';
import { renderHeadline } from '@/lib/headline';
import type { Show } from '@/types/content';

export function Shows() {
  const copy = site.sections.shows;
  const [shows, setShows] = useState<Show[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetchTourShows(controller.signal)
      .then((nextShows) => {
        setShows(nextShows);
        setLoadState('ok');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setShows([]);
        setLoadState('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <section id="shows" className="shows" aria-labelledby="shows-title">
      <div className="shows-intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="shows-title">{renderHeadline(copy.headline)}</h2>
        <p className="shows-note">{copy.note}</p>
      </div>
      <div className="shows-list">
        {loadState === 'loading' ? (
          <p className="shows-message">Loading tour dates…</p>
        ) : null}
        {loadState === 'error' ? (
          <p className="shows-message">Tour dates are temporarily unavailable</p>
        ) : null}
        {loadState === 'ok'
          ? shows.map((show) => {
              const soldOut = Boolean(show.soldOut) || show.status?.toLowerCase() === 'sold out';
              const ticketUrl = show.ticketUrl?.trim();

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
                    {show.status && !soldOut ? <span>{show.status}</span> : null}
                    {soldOut ? (
                      <span className="show-sold-out">Sold Out</span>
                    ) : ticketUrl ? (
                      <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                        {copy.ticketsLabel} <ArrowUpRight size={15} />
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })
          : null}
      </div>
      <div className="shows-footer">
        <span>{copy.moreDates}</span>
      </div>
    </section>
  );
}
