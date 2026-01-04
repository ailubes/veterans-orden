'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ThemeToggleCompact } from '@/components/ui/theme-toggle';
import { LanguageSwitcherCompact } from '@/components/ui/language-switcher';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { ContentAdapter } from '@/lib/content/ContentAdapter';
import { Scaffold } from './skeleton-grid';

/**
 * NavigationNew - Redesigned navigation with theme and language controls
 *
 * Features:
 * - Theme toggle (light/dark)
 * - Language switcher (UA/EN)
 * - Mobile hamburger menu
 * - Theme-aware styling
 * - i18n support
 */
export function NavigationNew() {
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: t('about') },
    { href: '/directions', label: t('directions') },
    { href: '/news', label: t('events') },
    { href: '/documents', label: t('documents') },
    { href: '/contacts', label: t('contact') },
  ];

  return (
    <>
      <header className="nav-header">
        <Scaffold className="nav-scaffold">
          {/* Logo */}
          <Link href="/" className="nav-logo col-span-3">
            <Image
              src="/images/logo-veterans-orden.png"
              alt={tBrand('name')}
              width={40}
              height={40}
              priority
              className="nav-logo-image"
            />
            <span className="nav-logo-text">
              {tBrand('name')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-links col-span-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="nav-controls col-span-3">
            <LanguageSwitcherCompact />
            <ThemeToggleCompact />
            <HeavyCta
              href="/join"
              variant="primary"
              size="sm"
              className="nav-cta"
            >
              {t('join')}
            </HeavyCta>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className={`nav-hamburger ${isMenuOpen ? 'is-open' : ''}`}>
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
            </span>
          </button>
        </Scaffold>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`nav-mobile-overlay ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="nav-mobile-content">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="nav-mobile-link"
            >
              {link.label}
            </Link>
          ))}

          <div className="nav-mobile-controls">
            <LanguageSwitcherCompact />
            <ThemeToggleCompact />
          </div>

          <HeavyCta
            href="/join"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setIsMenuOpen(false)}
          >
            {t('join')}
          </HeavyCta>
        </div>
      </div>
    </>
  );
}
