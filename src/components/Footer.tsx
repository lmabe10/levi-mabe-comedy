import { site } from '@/lib/content';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  return (
    <footer className="footer">
      <a className="wordmark" href="#top">
        <span>{site.initials}</span> {site.name}
      </a>
      <p>
        © {site.copyrightYear} {site.name}. All rights reserved.
      </p>
      <SocialLinks compact />
    </footer>
  );
}
