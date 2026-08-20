import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Shows } from '@/components/Shows';
import { Videos } from '@/components/Videos';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { site } from '@/lib/content';

function App() {
  useEffect(() => {
    document.title = site.seo.title;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', site.seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = site.seo.description;
      document.head.appendChild(meta);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', site.images.og);
    }
  }, []);

  return (
    <div className="site-shell">
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Shows />
        <Videos />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
