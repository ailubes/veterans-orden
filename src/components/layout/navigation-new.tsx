'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ThemeToggleCompact } from '@/components/ui/theme-toggle';
import { LanguageSwitcherCompact } from '@/components/ui/language-switcher';
import { Scaffold } from './skeleton-grid';
import { AuthNav } from './auth-nav';
import { MobileAuthNav } from './mobile-auth-nav';

interface NavItem {
  href: string;
  label: string;
  children?: NavItem[];
}

/**
 * NavigationNew - Redesigned navigation with dropdowns and comprehensive links
 */
export function NavigationNew() {
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Simplified navigation - 4 main items with dropdowns
  const navLinks: NavItem[] = [
    {
      href: '/about',
      label: '// ПРО ОРДЕН',
      children: [
        { href: '/about', label: 'Про нас' },
        { href: '/mission', label: 'Місія та цінності' },
        { href: '/governance', label: 'Управління' },
        { href: '/honor-court', label: 'Суд Честі' },
        { href: '/code-of-honor', label: 'Кодекс Честі' },
      ],
    },
    {
      href: '/directions',
      label: '// ДІЯЛЬНІСТЬ',
      children: [
        { href: '/directions', label: 'Напрями роботи' },
        { href: '/commanderies', label: 'Командерії' },
        { href: '/news', label: 'Новини' },
      ],
    },
    {
      href: '/support',
      label: '// ПІДТРИМКА',
      children: [
        { href: '/support', label: 'Підтримати' },
        { href: '/support/partnership', label: 'Партнерство' },
        { href: '/transparency', label: 'Прозорість' },
        { href: '/documents', label: 'Документи' },
      ],
    },
    {
      href: '/help-request',
      label: '// ДОПОМОГА',
      children: [
        { href: '/help-request', label: 'Потрібна допомога' },
        { href: '/faq', label: 'FAQ' },
        { href: '/contacts', label: 'Контакти' },
      ],
    },
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
              width={144}
              height={144}
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
              <div
                key={link.href}
                className="nav-item-wrapper"
                onMouseEnter={() => link.children && setOpenDropdown(link.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="nav-link"
                >
                  {link.label}
                  {link.children && (
                    <svg
                      className="nav-dropdown-arrow"
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {link.children && openDropdown === link.href && (
                  <div className="nav-dropdown">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="nav-dropdown-link"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Controls */}
          <div className="nav-controls col-span-3">
            <LanguageSwitcherCompact />
            <ThemeToggleCompact />
            <AuthNav />
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
            <div key={link.href} className="nav-mobile-group">
              <Link
                href={link.href}
                onClick={() => !link.children && setIsMenuOpen(false)}
                className="nav-mobile-link nav-mobile-link--parent"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="nav-mobile-children">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="nav-mobile-link nav-mobile-link--child"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="nav-mobile-controls">
            <LanguageSwitcherCompact />
            <ThemeToggleCompact />
          </div>

          <MobileAuthNav onClose={() => setIsMenuOpen(false)} />
        </div>
      </div>
    </>
  );
}
