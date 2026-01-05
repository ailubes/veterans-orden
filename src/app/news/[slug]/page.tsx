import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { newsArticles, getArticleBySlug, getRelatedArticles } from '@/data/news';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return newsArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Стаття не знайдена' };
  }

  return {
    title: `${article.title} | Мережа Вільних Людей`,
    description: article.excerpt,
  };
}

function parseMarkdown(content: string): string {
  return content
    .replace(/^## (.+)$/gm, '<h2 class="syne" style="font-size: 28px; font-weight: 700; margin: 40px 0 20px;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="syne" style="font-size: 22px; font-weight: 700; margin: 30px 0 15px;">$1</h3>')
    .replace(/^\> (.+)$/gm, '<blockquote style="border-left: 3px solid var(--accent); padding-left: 20px; margin: 30px 0; font-style: italic; opacity: 0.9;">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom: 10px;">$1</li>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom: 10px;">$1</li>')
    .replace(/\n\n/g, '</p><p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">')
    .replace(/^(?!<[hl]|<block|<li)(.+)$/gm, '<p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">$1</p>');
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug);
  const htmlContent = parseMarkdown(article.content.trim());

  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--panel-850)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />

        {/* Article Header */}
        <header
          style={{
            gridColumn: '2 / 5',
            paddingTop: '60px',
            paddingBottom: '40px',
            borderBottom: '1px solid var(--grid-line)',
            marginBottom: '40px',
          }}
        >
          <Link
            href="/news"
            style={{
              fontSize: '12px',
              color: 'var(--panel-850)',
              opacity: 0.6,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '30px',
            }}
          >
            ← НАЗАД ДО НОВИН
          </Link>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <span className="label" style={{ color: 'var(--accent)' }}>
              {article.category}
            </span>
            <span style={{ fontSize: '12px', opacity: 0.5 }}>{article.date}</span>
          </div>

          <h1
            className="syne"
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '20px',
              maxWidth: '800px',
            }}
          >
            {article.title}
          </h1>

          <p style={{ fontSize: '18px', lineHeight: 1.6, opacity: 0.8, maxWidth: '700px' }}>
            {article.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <article
          style={{
            gridColumn: '2 / 4',
            marginBottom: '80px',
            maxWidth: '700px',
          }}
        >
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <aside
            style={{
              gridColumn: '2 / 5',
              marginBottom: '80px',
            }}
          >
            <h2
              className="syne"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '30px',
              }}
            >
              ІНШІ НОВИНИ
            </h2>

            <div
              className="three-col"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1px',
                background: 'var(--grid-line)',
                border: '1px solid var(--grid-line)',
              }}
            >
              {relatedArticles.map((related) => (
                <article
                  key={related.slug}
                  style={{
                    background: 'var(--canvas)',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <span className="label">{related.category}</span>
                    <span style={{ fontSize: '11px', opacity: 0.5 }}>{related.date}</span>
                  </div>
                  <h3
                    className="syne"
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginBottom: '15px',
                    }}
                  >
                    {related.title}
                  </h3>
                  <Link
                    href={`/news/${related.slug}`}
                    style={{
                      color: 'var(--accent)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginTop: 'auto',
                    }}
                  >
                    ЧИТАТИ →
                  </Link>
                </article>
              ))}
            </div>
          </aside>
        )}

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
