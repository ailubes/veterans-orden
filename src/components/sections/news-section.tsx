'use client';

import Link from 'next/link';

interface NewsItem {
  date: string;
  title: string;
  excerpt: string;
  slug?: string;
}

const sampleNews: NewsItem[] = [
  {
    date: '18.12.2024',
    title: 'Мережа проголосувала за Положення про праймеріз',
    excerpt:
      'Члени Мережі одноголосно підтримали новий механізм внутрішнього відбору кандидатів.',
    slug: 'praymeriz-2024',
  },
  {
    date: '15.12.2024',
    title: "Підбиваємо підсумки перших дев'яти місяців",
    excerpt:
      'Від ідеї до 4,500+ членів: як ми будуємо інфраструктуру демократії в Україні.',
    slug: 'pidsumky-2024',
  },
  {
    date: '10.12.2024',
    title: 'Що зміниться в Мережі до кінця 2025 року?',
    excerpt:
      'Плани розвитку: нові функції, регіональні осередки та шлях до 100,000 членів.',
    slug: 'plany-2025',
  },
];

interface NewsSectionProps {
  news?: NewsItem[];
}

export function NewsSection({ news = sampleNews }: NewsSectionProps) {
  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <div style={{ gridColumn: '2 / 5', marginBottom: '80px' }} id="news">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          borderBottom: '2px solid var(--timber-dark)',
          paddingBottom: '20px',
        }}
      >
        <div>
          <p className="label">ОСТАННІ ОНОВЛЕННЯ</p>
          <h2
            className="syne"
            style={{
              fontSize: '48px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginTop: '10px',
            }}
          >
            НОВИНИ
          </h2>
        </div>
        <Link
          href="/news"
          style={{
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          ВСІ НОВИНИ →
        </Link>
      </div>

      <div
        className="mobile-full news-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1px',
          background: 'var(--grid-line)',
          border: '1px solid var(--grid-line)',
        }}
      >
        <div
          style={{
            background: 'var(--timber-dark)',
            color: 'var(--grain)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '350px',
          }}
        >
          <div>
            <p className="label" style={{ color: 'var(--accent)' }}>
              ГОЛОВНЕ
            </p>
            <h3
              className="syne"
              style={{
                fontSize: '28px',
                fontWeight: 700,
                marginTop: '20px',
                lineHeight: 1.2,
              }}
            >
              {featuredNews.title}
            </h3>
            <p
              style={{
                marginTop: '20px',
                fontSize: '14px',
                opacity: 0.8,
                lineHeight: 1.6,
              }}
            >
              {featuredNews.excerpt}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '30px',
            }}
          >
            <span style={{ fontSize: '11px', opacity: 0.5 }}>{featuredNews.date}</span>
            <Link
              href={`/news/${featuredNews.slug}`}
              style={{
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ЧИТАТИ →
            </Link>
          </div>
        </div>

        <div style={{ background: 'var(--canvas)' }}>
          {otherNews.map((item, i) => (
            <div key={i} className="news-card">
              <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '10px' }}>
                {item.date}
              </p>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h4>
              <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.5 }}>
                {item.excerpt}
              </p>
            </div>
          ))}

          <div
            style={{
              padding: '30px',
              background: 'rgba(212, 93, 58, 0.1)',
              borderTop: '1px solid var(--grid-line)',
            }}
          >
            <p className="label">ДИВІТЬСЯ ЩОВІВТОРКА</p>
            <a
              href="https://www.youtube.com/@ZBROIOVYILOBIST"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '15px',
                color: 'var(--timber-dark)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <span
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '8px 12px',
                  fontSize: '10px',
                }}
              >
                ▶ YT
              </span>
              ЗБРОЙОВИЙ ЛОБІСТ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
