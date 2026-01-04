'use client';

import Link from 'next/link';
import { PageLayout, PageHeader } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { newsArticles } from '@/data/news';

export default function NewsPage() {
  const featuredArticle = newsArticles.find((a) => a.featured);
  const otherArticles = newsArticles.filter((a) => !a.featured);

  return (
    <PageLayout>
      <PageHeader
        subtitle="// ОСТАННІ ОНОВЛЕННЯ"
        title="НОВИНИ"
        description="Слідкуйте за розвитком Мережі та важливими подіями у сфері захисту прав громадян."
      />

      {/* Featured Article */}
      {featuredArticle && (
        <section className="section">
          <Scaffold>
            <div className="col-span-full">
              <div className="section-card section-card--dark" style={{ padding: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                      <span className="mono pill pill--bronze">{featuredArticle.category}</span>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>{featuredArticle.date}</span>
                    </div>
                    <h2 className="section-card__title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                      {featuredArticle.title}
                    </h2>
                    <p className="section-card__desc" style={{ marginBottom: '1.5rem' }}>
                      {featuredArticle.excerpt}
                    </p>
                    <Link
                      href={`/news/${featuredArticle.slug}`}
                      style={{ color: 'var(--bronze)', fontWeight: 700, textDecoration: 'none' }}
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
            </div>
          </Scaffold>
        </section>
      )}

      {/* Articles Grid */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              {otherArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className="section-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <span className="mono pill">{article.category}</span>
                    <span style={{ fontSize: '11px', opacity: 0.5 }}>{article.date}</span>
                  </div>
                  <h3 className="section-card__title">{article.title}</h3>
                  <p className="section-card__desc" style={{ flex: 1 }}>{article.excerpt}</p>
                  <span style={{ color: 'var(--bronze)', fontSize: '12px', fontWeight: 700, marginTop: '1rem', display: 'block' }}>
                    ЧИТАТИ →
                  </span>
                </Link>
              ))}
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* YouTube Section */}
      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <span className="mono pill pill--bronze">ДИВІТЬСЯ ЩОВІВТОРКА</span>
            <h2 className="cta-title">ЗБРОЙОВИЙ ЛОБІСТ</h2>
            <p className="cta-desc">
              YouTube-канал про право на зброю та політичний вплив громадян
            </p>
            <a
              href="https://www.youtube.com/@ZBROIOVYILOBIST"
              target="_blank"
              rel="noopener noreferrer"
              className="heavy-cta heavy-cta--primary heavy-cta--lg"
            >
              <span className="heavy-cta__text">▶ ДИВИТИСЬ НА YOUTUBE</span>
            </a>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
