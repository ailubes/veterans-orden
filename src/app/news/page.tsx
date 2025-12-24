import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';
import { newsArticles } from '@/data/news';

export default function NewsPage() {
  const featuredArticle = newsArticles.find((a) => a.featured);
  const otherArticles = newsArticles.filter((a) => !a.featured);

  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--timber-dark)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ОСТАННІ ОНОВЛЕННЯ"
          title="НОВИНИ"
          description="Слідкуйте за розвитком Мережі та важливими подіями у сфері захисту прав громадян."
        />

        {/* Featured Article */}
        {featuredArticle && (
          <div
            style={{
              gridColumn: '2 / 5',
              marginBottom: '60px',
            }}
          >
            <div
              className="two-col"
              style={{
                background: 'var(--timber-dark)',
                color: 'var(--grain)',
                padding: '60px',
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center',
              }}
            >
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <div className="joint" style={{ top: '-6px', right: '-6px' }} />
              <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
              <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

              <div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <span className="label" style={{ color: 'var(--accent)' }}>
                    {featuredArticle.category}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>{featuredArticle.date}</span>
                </div>
                <h2
                  className="syne"
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    marginBottom: '20px',
                  }}
                >
                  {featuredArticle.title}
                </h2>
                <p style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.8, marginBottom: '30px' }}>
                  {featuredArticle.excerpt}
                </p>
                <Link
                  href={`/news/${featuredArticle.slug}`}
                  style={{
                    color: 'var(--accent)',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  ЧИТАТИ ПОВНІСТЮ →
                </Link>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ opacity: 0.3, fontSize: '14px' }}>ЗОБРАЖЕННЯ</span>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div
          className="three-col"
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--grid-line)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          {otherArticles.map((article) => (
            <article
              key={article.slug}
              style={{
                background: 'var(--canvas)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '280px',
              }}
            >
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <span className="label">{article.category}</span>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>{article.date}</span>
              </div>
              <h3
                className="syne"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '15px',
                }}
              >
                {article.title}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  opacity: 0.7,
                  marginBottom: '20px',
                  flex: 1,
                }}
              >
                {article.excerpt}
              </p>
              <Link
                href={`/news/${article.slug}`}
                style={{
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ЧИТАТИ →
              </Link>
            </article>
          ))}
        </div>

        {/* YouTube Section */}
        <div
          style={{
            gridColumn: '2 / 5',
            padding: '60px',
            background: 'rgba(212, 93, 58, 0.1)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: '15px' }}>
              ДИВІТЬСЯ ЩОВІВТОРКА
            </p>
            <h3 className="syne" style={{ fontSize: '32px', fontWeight: 700 }}>
              ЗБРОЙОВИЙ ЛОБІСТ
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
              YouTube-канал про право на зброю та політичний вплив громадян
            </p>
          </div>
          <a
            href="https://www.youtube.com/@ZBROIOVYILOBIST"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ padding: '20px 40px' }}
          >
            <span style={{ marginRight: '10px' }}>▶</span>
            ДИВИТИСЬ НА YOUTUBE
          </a>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
