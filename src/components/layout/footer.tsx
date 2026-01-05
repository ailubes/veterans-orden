'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ContentAdapter } from '@/lib/content/ContentAdapter';

function Logo() {
  return (
    <Image
      src="/images/logo-veterans-orden.png"
      alt={ContentAdapter.getOrgName('short')}
      width={120}
      height={40}
    />
  );
}

function YouTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M23.498 6.186a2.978 2.978 0 00-2.097-2.109C19.525 3.5 12 3.5 12 3.5s-7.525 0-9.401.577A2.978 2.978 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.978 2.978 0 002.097 2.109C4.475 20.5 12 20.5 12 20.5s7.525 0 9.401-.577a2.978 2.978 0 002.097-2.109C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  );
}

const navLinks = ContentAdapter.getNavigation();

const legalLinks = [
  { href: '/privacy', label: 'Політика конфіденційності' },
  { href: '/copyright', label: 'Політика авторських прав' },
  { href: '/documents', label: 'Документи' },
];

const getSocialLinks = () => {
  const social = ContentAdapter.getSocialLinks();
  const links: Array<{ href: string; icon: () => JSX.Element; label: string }> = [];

  if (social.youtube) links.push({ href: social.youtube, icon: YouTubeIcon, label: 'YouTube' });
  if (social.telegram) links.push({ href: social.telegram, icon: TelegramIcon, label: 'Telegram' });
  if (social.facebook) links.push({ href: social.facebook, icon: FacebookIcon, label: 'Facebook' });
  if (social.instagram) links.push({ href: social.instagram, icon: InstagramIcon, label: 'Instagram' });

  return links;
};

export function Footer() {
  const year = new Date().getFullYear();
  const contact = ContentAdapter.getContact();
  const legal = ContentAdapter.getLegal();
  const socialLinks = getSocialLinks();

  return (
    <>
      {/* Full-width dark footer wrapper */}
      <div
        style={{
          gridColumn: '1 / -1',
          background: 'var(--panel-850)',
          color: 'var(--canvas)',
        }}
      >
        <footer
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '60px 80px',
          }}
          className="footer-wrapper"
        >
          {/* Main Footer Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: '40px',
              marginBottom: '60px',
            }}
            className="footer-grid"
          >
            {/* Logo & Copyright */}
            <div>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  color: 'var(--canvas)',
                  marginBottom: '20px',
                }}
              >
                <Logo />
                <span className="syne" style={{ fontSize: '14px', fontWeight: 800 }}>
                  {ContentAdapter.getOrgName('short').toUpperCase()}
                </span>
              </Link>
              <p style={{ fontSize: '12px', opacity: 0.6, lineHeight: 1.6 }}>
                © {year} {ContentAdapter.getOrgName('full')}
                <br />
                Всі права захищені.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="label" style={{ marginBottom: '20px', color: 'var(--accent)' }}>НАВІГАЦІЯ</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      textDecoration: 'none',
                      color: 'var(--canvas)',
                      opacity: 0.8,
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <p className="label" style={{ marginBottom: '20px', color: 'var(--accent)' }}>ПРАВОВА ІНФОРМАЦІЯ</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      textDecoration: 'none',
                      color: 'var(--canvas)',
                      opacity: 0.8,
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div>
              <p className="label" style={{ marginBottom: '20px', color: 'var(--accent)' }}>КОНТАКТИ</p>
              <div style={{ fontSize: '13px', lineHeight: 1.8, opacity: 0.8 }}>
                {contact.phone && typeof contact.phone === 'string' && (
                  <p style={{ marginBottom: '10px' }}>
                    <a
                      href={`tel:${String(contact.phone).replace(/\s/g, '')}`}
                      style={{ color: 'var(--canvas)', textDecoration: 'none' }}
                    >
                      {contact.phone}
                    </a>
                  </p>
                )}
                {contact.email && (
                  <p style={{ marginBottom: '15px' }}>
                    <a
                      href={`mailto:${contact.email}`}
                      style={{ color: 'var(--canvas)', textDecoration: 'none' }}
                    >
                      {contact.email}
                    </a>
                  </p>
                )}
                {contact.address && (
                  <p style={{ fontSize: '12px', lineHeight: 1.6 }}>
                    {contact.address}
                  </p>
                )}
                <p style={{ fontSize: '12px', lineHeight: 1.6, marginTop: '10px' }}>
                  <span style={{ opacity: 0.6 }}>
                    {legal.organizationType}
                    <br />
                    Ознака неприбутковості: {legal.nonProfitCode}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Social & Bottom Bar */}
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 80px 40px',
          }}
          className="footer-wrapper"
        >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
          className="footer-bottom"
        >
          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="footer-socials" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    color: 'var(--canvas)',
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                  }}
                  className="social-link"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            fontSize: '11px',
            opacity: 0.5,
          }}
        >
          <span>{ContentAdapter.getMission('tagline')}</span>
        </div>
        </div>
      </div>
    </>
  );
}
