import { site } from '@/lib/content';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  return (
    <footer className="footer">
      <a className="site-logo" href="#top" aria-label={`${site.name} home`}>
        <img src={site.images.logoCream} alt="" />
      </a>
      <p>
        © {site.copyrightYear} {site.name}. All rights reserved.
      </p>
      <SocialLinks compact />
    </footer>
  );
}
