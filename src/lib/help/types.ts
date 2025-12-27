/**
 * Help System Types
 * TypeScript interfaces for the help/wiki system
 */

// Audience types for content targeting
export type AudienceType = 'all' | 'members' | 'leaders' | 'admins';

// Article status
export type ArticleStatus = 'draft' | 'published' | 'archived';

// Help Category
export interface HelpCategory {
  id: string;
  nameUk: string;
  nameEn: string;
  slug: string;
  description: string | null;
  icon: string | null; // Lucide icon name
  parentId: string | null;
  order: number;
  isVisible: boolean;
  createdAt: Date;

  // Relations (optional, populated by joins)
  parent?: HelpCategory;
  subcategories?: HelpCategory[];
  articles?: HelpArticle[];
}

// Help Article
export interface HelpArticle {
  id: string;
  categoryId: string;

  // Content
  title: string;
  slug: string;
  content: string; // HTML from WYSIWYG
  excerpt: string | null;

  // Video support
  videoUrl: string | null; // YouTube URL

  // Search
  keywords: string[]; // Array of keywords

  // Audience targeting
  audience: AudienceType;

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;

  // Engagement metrics
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;

  // Publishing
  status: ArticleStatus;
  publishedAt: Date | null;
  authorId: string;

  // Related articles
  relatedArticleIds: string[];

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, populated by joins)
  category?: HelpCategory;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  feedback?: HelpArticleFeedback[];
  relatedArticles?: HelpArticle[];
}

// Help Article Feedback
export interface HelpArticleFeedback {
  id: string;
  articleId: string;
  userId: string | null;
  isHelpful: boolean;
  comment: string | null;
  createdAt: Date;

  // Relations (optional, populated by joins)
  article?: HelpArticle;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Help Tooltip
export interface HelpTooltip {
  id: string;
  pageSlug: string; // e.g., "dashboard-votes"
  elementId: string; // e.g., "vote-submit-button"
  content: string;
  articleId: string | null; // Link to full article
  audience: AudienceType;
  isActive: boolean;
  createdAt: Date;

  // Relations (optional, populated by joins)
  article?: HelpArticle;
}

// API Response Types

export interface ArticlesListResponse {
  articles: HelpArticle[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CategoriesTreeResponse {
  categories: HelpCategory[];
}

export interface ArticleDetailResponse {
  article: HelpArticle;
  relatedArticles: HelpArticle[];
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  categoryName: string;
  rank: number; // Relevance score
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

export interface TooltipsResponse {
  tooltips: HelpTooltip[];
}

// Analytics Types

export interface HelpAnalytics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  averageHelpfulRate: number; // Percentage
  topArticles: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    helpfulRate: number;
  }>;
  lowPerformingArticles: Array<{
    id: string;
    title: string;
    slug: string;
    helpfulRate: number;
    totalFeedback: number;
  }>;
  topSearchQueries: Array<{
    query: string;
    count: number;
  }>;
  noResultsQueries: Array<{
    query: string;
    count: number;
  }>;
}

// Form Types for Admin

export interface CreateArticleInput {
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  videoUrl?: string;
  keywords?: string[];
  audience?: AudienceType;
  metaTitle?: string;
  metaDescription?: string;
  relatedArticleIds?: string[];
  status?: ArticleStatus;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

export interface CreateCategoryInput {
  nameUk: string;
  nameEn: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CreateTooltipInput {
  pageSlug: string;
  elementId: string;
  content: string;
  articleId?: string;
  audience?: AudienceType;
}

export interface UpdateTooltipInput extends Partial<CreateTooltipInput> {
  id: string;
}

export interface SubmitFeedbackInput {
  articleId: string;
  isHelpful: boolean;
  comment?: string;
}

// Query Parameters

export interface ArticlesQueryParams {
  categoryId?: string;
  status?: ArticleStatus;
  audience?: AudienceType;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface SearchQueryParams {
  query: string;
  categoryId?: string;
  limit?: number;
}
