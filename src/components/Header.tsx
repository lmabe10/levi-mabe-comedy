import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { site } from '@/lib/content';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label={`${site.name} home`}>
        <span>{site.initials}</span> {site.name}
      </a>
      <button
        className="menu-button"
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
        {site.nav.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
