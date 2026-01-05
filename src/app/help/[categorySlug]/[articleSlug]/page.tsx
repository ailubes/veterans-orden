'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, User, Eye, Share2, Printer, ChevronRight } from 'lucide-react';
import { VideoEmbed } from '@/components/help/video-embed';
import { FeedbackWidget } from '@/components/help/feedback-widget';
import type { HelpArticle } from '@/lib/help/types';

export default function ArticleDetailPage() {
  const params = useParams();
  const articleSlug = params.articleSlug as string;

  const [article, setArticle] = useState<any | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const response = await fetch(`/api/help/articles/${articleSlug}`);

        if (!response.ok) {
          throw new Error('Article not found');
        }

        const data = await response.json();
        setArticle(data.article);
        setRelatedArticles(data.relatedArticles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [articleSlug]);

  // Generate Table of Contents from HTML content
  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: heading.tagName === 'H2' ? 2 : 3,
    }));
  }, [article?.content]);

  // Add IDs to headings in content for anchor links
  const processedContent = useMemo(() => {
    if (!article?.content) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    return doc.body.innerHTML;
  }, [article?.content]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Посилання скопійовано!');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line border-t-accent"></div>
        <p className="mt-4 text-muted-500">Завантаження...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white border border-line rounded-lg p-12 text-center relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <h2 className="font-syne text-2xl font-bold mb-2">Статтю не знайдено</h2>
        <p className="text-muted-500 mb-6">{error || 'Неможливо знайти статтю'}</p>
        <a href="/help" className="text-bronze hover:underline font-bold">
          ← Повернутися до допомоги
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Article Header */}
        <div className="bg-white border border-line rounded-lg p-8 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-500 mb-4">
            <a href="/help" className="hover:text-bronze">Допомога</a>
            <ChevronRight size={14} />
            <a href={`/help/${article.category?.slug}`} className="hover:text-bronze">
              {article.category?.name_uk}
            </a>
            <ChevronRight size={14} />
            <span className="font-bold">{article.title}</span>
          </div>

          {/* Title */}
          <h1 className="font-syne text-4xl font-bold mb-6">{article.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-500 pb-6 border-b-2 border-line/20">
            {article.author && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{article.author.first_name} {article.author.last_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(article.created_at).toLocaleDateString('uk-UA')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{article.view_count || 0} переглядів</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-line rounded-lg hover:bg-panel-850/10 transition-colors font-bold text-sm"
            >
              <Share2 size={16} />
              Поділитися
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-line rounded-lg hover:bg-panel-850/10 transition-colors font-bold text-sm"
            >
              <Printer size={16} />
              Друк
            </button>
          </div>
        </div>

        {/* Video (if present) */}
        {article.video_url && (
          <VideoEmbed url={article.video_url} title={article.title} />
        )}

        {/* Article Content */}
        <div className="bg-white border border-line rounded-lg p-8 relative prose prose-invert max-w-none">
          <div className="joint joint-tl" />
          <div className="joint joint-br" />

          <div
            dangerouslySetInnerHTML={{ __html: processedContent }}
            className="article-content"
          />
        </div>

        {/* Feedback Widget */}
        <FeedbackWidget articleId={article.id} />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <div className="bg-white border border-line rounded-lg p-6 sticky top-4 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <h2 className="font-syne font-bold mb-4 pb-2 border-b-2 border-line/20">
              Зміст
            </h2>

            <nav className="space-y-2">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-sm hover:text-bronze transition-colors ${
                    item.level === 3 ? 'ml-4 text-muted-500' : 'font-bold'
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-br" />

            <h2 className="font-syne font-bold mb-4 pb-2 border-b-2 border-line/20">
              Пов'язані статті
            </h2>

            <div className="space-y-3">
              {relatedArticles.map((related: any) => (
                <a
                  key={related.id}
                  href={`/help/${article.category?.slug}/${related.slug}`}
                  className="block p-3 border border-line rounded-lg/20 hover:border-bronze transition-colors group"
                >
                  <h3 className="font-bold text-sm mb-1 group-hover:text-bronze transition-colors">
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p className="text-xs text-muted-500 line-clamp-2">{related.excerpt}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
