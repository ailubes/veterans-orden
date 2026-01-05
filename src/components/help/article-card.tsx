import Link from 'next/link';
import { Eye, ThumbsUp, Package, Download, Ticket } from 'lucide-react';
import type { HelpArticle } from '@/lib/help/types';

interface ArticleCardProps {
  article: HelpArticle & {
    category?: {
      name_uk: string;
      slug: string;
      icon?: string | null;
    };
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const categorySlug = article.category?.slug || 'general';
  const helpfulRate = article.helpfulCount + article.notHelpfulCount > 0
    ? Math.round((article.helpfulCount / (article.helpfulCount + article.notHelpfulCount)) * 100)
    : null;

  return (
    <Link
      href={`/help/${categorySlug}/${article.slug}`}
      className="bg-panel-900 border border-line rounded-lg relative hover:border-bronze transition-colors group block"
    >
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="p-6">
        {/* Category Badge */}
        {article.category && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-bronze uppercase tracking-wider">
              {article.category.name_uk}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-syne text-xl font-bold mb-3 group-hover:text-bronze transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-muted-500 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-xs text-muted-500 pt-4 border-t-2 border-line/20">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{article.viewCount || 0}</span>
          </div>

          {helpfulRate !== null && (
            <div className="flex items-center gap-1">
              <ThumbsUp size={14} />
              <span>{helpfulRate}% корисно</span>
            </div>
          )}

          {article.videoUrl && (
            <span className="text-bronze font-bold">+ Відео</span>
          )}
        </div>
      </div>
    </Link>
  );
}
