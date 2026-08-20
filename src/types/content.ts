export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'threads'
  | 'youtube'
  | 'tiktok';

export type SiteImage = {
  src: string;
  alt: string;
};

export type SiteContent = {
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  tagline: string;
  email: string;
  copyrightYear: number;
  seo: {
    title: string;
    description: string;
  };
  images: {
    headshot: SiteImage;
    about: SiteImage;
    og: string;
    logoColor: string;
    logoCream: string;
  };
  social: Partial<Record<SocialPlatform, string>>;
  nav: string[];
  sections: {
    hero: {
      eyebrow: string;
      verticalLabel: string;
      intro: string;
      portraitCaption: string;
      corner: string;
    };
    about: {
      marker: string;
      eyebrow: string;
      headline: string;
      photoCaption: string;
    };
    shows: {
      eyebrow: string;
      headline: string;
      note: string;
      moreDates: string;
      defaultDetail: string;
      ticketsLabel: string;
    };
    videos: {
      eyebrow: string;
      headline: string;
      previewLabel: string;
    };
    contact: {
      sideLabel: string;
      eyebrow: string;
      headline: string;
      blurb: string;
      success: string;
      successBody: string;
      submitLabel: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      messagePlaceholder: string;
    };
  };
};

export type Show = {
  id: string;
  date: string;
  time: string;
  city: string;
  state: string;
  venue: string;
  status?: string;
  detail?: string;
  ticketUrl?: string;
  soldOut?: boolean;
};

export type Video = {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
};

export type VideosContent = {
  featured: Video;
  additional: Video[];
};
