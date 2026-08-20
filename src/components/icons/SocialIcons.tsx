import type { SVGProps } from 'react';
import {
  siFacebook,
  siInstagram,
  siThreads,
  siTiktok,
  siX,
  siYoutube,
} from 'simple-icons';
import type { SocialPlatform } from '@/types/content';

type IconProps = SVGProps<SVGSVGElement>;

function BrandIcon({ path, ...props }: IconProps & { path: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d={path} />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return <BrandIcon path={siInstagram.path} {...props} />;
}

export function FacebookIcon(props: IconProps) {
  return <BrandIcon path={siFacebook.path} {...props} />;
}

export function XIcon(props: IconProps) {
  return <BrandIcon path={siX.path} {...props} />;
}

export function ThreadsIcon(props: IconProps) {
  return <BrandIcon path={siThreads.path} {...props} />;
}

export function YouTubeIcon(props: IconProps) {
  return <BrandIcon path={siYoutube.path} {...props} />;
}

export function TikTokIcon(props: IconProps) {
  return <BrandIcon path={siTiktok.path} {...props} />;
}

export const socialIcons: Record<SocialPlatform, (props: IconProps) => JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
  threads: ThreadsIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
};
