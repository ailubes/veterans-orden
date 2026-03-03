import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
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
    title: `${article.title} | Орден Ветеранів`,
    description: article.excerpt,
  };
}

function parseMarkdown(content: string): string {
  return content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hluo]|<block|<li|<p)(.+)$/gm, '<p>$1</p>');
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
    <PageLayout>
      <section className="news-article-page section">
        <Scaffold>
          <header className="col-span-full news-article-header">
            <Link href="/news" className="news-article-back">
              ← НАЗАД ДО НОВИН
            </Link>

            <div className="news-article-meta">
              <span className="label text-bronze">{article.category}</span>
              <span className="news-article-date">{article.date}</span>
            </div>

            <h1 className="news-article-title">{article.title}</h1>
            <p className="news-article-excerpt">{article.excerpt}</p>
          </header>

          <article className="col-span-8 news-article-body">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </article>

          {relatedArticles.length > 0 && (
            <aside className="col-span-full news-related-section">
              <h2 className="section-title">ІНШІ НОВИНИ</h2>
              <div className="news-related-grid">
                {relatedArticles.map((related) => (
                  <article key={related.slug} className="news-related-card">
                    <div className="news-related-meta">
                      <span className="label">{related.category}</span>
                      <span className="news-related-date">{related.date}</span>
                    </div>
                    <h3 className="news-related-title">{related.title}</h3>
                    <Link href={`/news/${related.slug}`} className="news-related-link">
                      ЧИТАТИ →
                    </Link>
                  </article>
                ))}
              </div>
            </aside>
          )}
        </Scaffold>
      </section>
    </PageLayout>
  );
}
