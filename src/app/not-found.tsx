import Link from 'next/link';
import Image from 'next/image';
import { PageWrapper, Scaffold } from '@/components/layout/skeleton-grid';
import { NavigationNew } from '@/components/layout/navigation-new';
import { FooterNew } from '@/components/layout/footer-new';

export default function NotFound() {
  return (
    <PageWrapper>
      <NavigationNew />
      <main className="section section-lg">
        <Scaffold>
        <section
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 0',
            minHeight: '60vh',
          }}
        >
          {/* 404 Status */}
          <p
            className="syne"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0',
              fontSize: 'clamp(80px, 15vw, 200px)',
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: '40px',
              color: 'var(--text-100)',
            }}
          >
            <span>4</span>
            <Image
              src="/images/hole.png"
              alt=""
              width={240}
              height={253}
              style={{
                width: 'clamp(100px, 12vw, 180px)',
                height: 'auto',
                margin: '0 -10px',
              }}
            />
            <span>4</span>
          </p>

          {/* Title */}
          <h1
            className="syne"
            style={{
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 700,
              marginBottom: '20px',
              maxWidth: '600px',
            }}
          >
            Ми не знайшли сторінку що ви шукаєте
          </h1>

          {/* Message */}
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              maxWidth: '500px',
              marginBottom: '40px',
              opacity: 0.8,
            }}
          >
            Сторінка яку ви шукаєте застаріла, або можлива помилка в посиланні. Ви можете перейти на{' '}
            <Link
              href="/"
              style={{
                color: 'var(--bronze)',
                textDecoration: 'underline',
              }}
            >
              Головну сторінку
            </Link>{' '}
            щоб продовжити навігацію та знайти для вас корисну інформацію.
          </p>

          {/* CTA Button */}
          <Link href="/" className="btn" style={{ padding: '20px 40px' }}>
            НА ГОЛОВНУ →
          </Link>
        </section>
        </Scaffold>
      </main>
      <FooterNew />
    </PageWrapper>
  );
}
