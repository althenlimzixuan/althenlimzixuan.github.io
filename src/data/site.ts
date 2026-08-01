export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string | null;
  /** Cal.com booking URL. When null, CTAs fall back to email. */
  calBookingUrl: string | null;
  location: string;
}

export const site: SiteConfig = {
  name: 'Althen Lim Zi Xuan',
  role: 'Product Engineer',
  tagline:
    'I build and ship products end-to-end — Go APIs, Next.js web apps, React Native mobile.',
  email: 'althenlim@gmail.com',
  github: 'https://github.com/althenlimzixuan',
  linkedin: null,
  calBookingUrl: null,
  location: 'Singapore',
};

/** Primary CTA target: booking link when configured, email otherwise. */
export function primaryCtaHref(config: SiteConfig = site): string {
  return config.calBookingUrl ?? `mailto:${config.email}`;
}

/** Primary CTA label, matched to whichever target is active. */
export function primaryCtaLabel(config: SiteConfig = site): string {
  return config.calBookingUrl ? 'Book a call' : 'Get in touch';
}
