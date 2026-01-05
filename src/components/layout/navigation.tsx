'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ContentAdapter } from '@/lib/content/ContentAdapter';

const navLinks = ContentAdapter.getNavigation();

function Logo() {
  return (
    <Image
      src="/images/logo-veterans-orden.png"
      alt={ContentAdapter.getOrgName('short')}
      width={120}
      height={40}
      priority
    />
  );
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      style={{
        width: '24px',
        height: '20px',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute',
          height: '2px',
          width: '100%',
          background: 'var(--panel-850)',
          left: 0,
          top: isOpen ? '9px' : 0,
          transform: isOpen ? 'rotate(45deg)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          height: '2px',
          width: '100%',
          background: 'var(--panel-850)',
          left: 0,
          top: '9px',
          opacity: isOpen ? 0 : 1,
          transition: 'all 0.3s ease',
        }}
      />
      <span
        style={{
          position: 'absolute',
          height: '2px',
          width: '100%',
          background: 'var(--panel-850)',
          left: 0,
          bottom: isOpen ? '9px' : 0,
          transform: isOpen ? 'rotate(-45deg)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
    </div>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="main-nav">
        <Link
          href="/"
          className="syne"
          style={{
            fontSize: '20px',
            fontWeight: 800,
            textDecoration: 'none',
            color: 'var(--panel-850)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Logo />
          <span className="hide-mobile">{ContentAdapter.getOrgName('short').toUpperCase()}</span>
          <span className="show-mobile-only">ОРДЕН</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: 'none',
                  color: 'var(--panel-850)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/join"
            className="btn"
            style={{ padding: '15px 25px', fontSize: '11px' }}
          >
            ПРИЄДНАТИСЯ
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
        >
          <HamburgerIcon isOpen={isMenuOpen} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMenuOpen ? 'is-open' : ''}`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="syne"
            style={{
              textDecoration: 'none',
              color: 'var(--panel-850)',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/join"
          onClick={() => setIsMenuOpen(false)}
          className="btn"
          style={{ padding: '20px 40px', fontSize: '14px', marginTop: '20px' }}
        >
          ПРИЄДНАТИСЯ
        </Link>
      </div>
    </>
  );
}
