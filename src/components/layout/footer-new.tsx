'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Scaffold } from './skeleton-grid';

/**
 * FooterNew - Comprehensive footer with all site links
 */
export function FooterNew() {
  const t = useTranslations('footer');
  const tBrand = useTranslations('brand');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-new">
      <Scaffold>
        <div className="col-span-full">
          <div className="footer-grid-new">
            {/* Brand Column */}
            <div className="footer-brand">
              <Image
                src="/images/logo-veterans-orden.png"
                alt={tBrand('name')}
                width={40}
                height={40}
                className="footer-logo-image"
              />
              <span className="footer-brand-name">{tBrand('name')}</span>
              <span className="footer-brand-tag">{tBrand('tag')}</span>

              {/* Contact Info */}
              <div className="footer-contact">
                <a href="mailto:info@veterans-orden.org" className="footer-contact-link">
                  info@veterans-orden.org
                </a>
                <a href="https://t.me/orden_veteraniv" className="footer-contact-link" target="_blank" rel="noopener noreferrer">
                  @orden_veteraniv
                </a>
              </div>
            </div>

            {/* About Column */}
            <div className="footer-col">
              <span className="footer-col-title">// ПРО ОРДЕН</span>
              <nav className="footer-links">
                <Link href="/about" className="footer-link">Про нас</Link>
                <Link href="/mission" className="footer-link">Місія та цінності</Link>
                <Link href="/governance" className="footer-link">Управління (Тріада)</Link>
                <Link href="/honor-court" className="footer-link">Суд Честі</Link>
                <Link href="/code-of-honor" className="footer-link">Кодекс Честі</Link>
              </nav>
            </div>

            {/* Programs Column */}
            <div className="footer-col">
              <span className="footer-col-title">// НАПРЯМИ</span>
              <nav className="footer-links">
                <Link href="/directions" className="footer-link">Усі напрями</Link>
                <Link href="/commanderies" className="footer-link">Командерії (Осередки)</Link>
                <Link href="/news" className="footer-link">Новини</Link>
                <Link href="/join" className="footer-link">Приєднатися</Link>
                <Link href="/join/procedure" className="footer-link">Процедура вступу</Link>
              </nav>
            </div>

            {/* Support Column */}
            <div className="footer-col">
              <span className="footer-col-title">// ПІДТРИМКА</span>
              <nav className="footer-links">
                <Link href="/support" className="footer-link">Підтримати</Link>
                <Link href="/support/partnership" className="footer-link">Партнерство</Link>
                <Link href="/help-request" className="footer-link">Потрібна допомога</Link>
                <Link href="/transparency" className="footer-link">Прозорість</Link>
              </nav>
            </div>

            {/* Resources Column */}
            <div className="footer-col">
              <span className="footer-col-title">// РЕСУРСИ</span>
              <nav className="footer-links">
                <Link href="/contacts" className="footer-link">Контакти</Link>
                <Link href="/documents" className="footer-link">Документи</Link>
                <Link href="/faq" className="footer-link">FAQ</Link>
                <Link href="/media" className="footer-link">Медіа / Прес-кіт</Link>
                <Link href="/privacy" className="footer-link">Конфіденційність</Link>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-new">
            <span className="footer-copyright">
              {currentYear} {t('copyright')}. {t('allRights')}.
            </span>
            <span className="footer-legal">
              УКРАЇНА · ДІЯЛЬНІСТЬ У МЕЖАХ ЗАКОНУ
            </span>
            <div className="footer-socials">
              <a
                href="https://www.facebook.com/veteransorden"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://t.me/orden_veteraniv"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Telegram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </Scaffold>
    </footer>
  );
}
