import { getSocialLinks, site } from '@/lib/content';
import { socialIcons } from '@/components/icons/SocialIcons';

type SocialLinksProps = {
  compact?: boolean;
};

export function SocialLinks({ compact = false }: SocialLinksProps) {
  const links = getSocialLinks(site.social);

  if (links.length === 0) return null;

  return (
    <div className={compact ? 'social-links compact' : 'social-links'}>
      {links.map(({ platform, label, url }) => {
        const Icon = socialIcons[platform];
        return (
          <a
            key={platform}
            href={url}
            aria-label={label}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon width={compact ? 16 : 18} height={compact ? 16 : 18} />
            {!compact && <span>{label}</span>}
          </a>
        );
      })}
    </div>
  );
}
