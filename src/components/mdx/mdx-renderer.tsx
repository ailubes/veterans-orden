import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx';
import { cn } from '@/lib/utils';

interface MDXRendererProps {
  source: string;
  className?: string;
}

/**
 * Check if content is likely HTML (from legacy RichTextEditor)
 * Returns true if content looks like HTML, false if it looks like MDX
 */
function isHtmlContent(content: string): boolean {
  // Check for HTML tags that wouldn't appear in MDX
  const htmlPatterns = [
    /<div[^>]*>/i,
    /<span[^>]*>/i,
    /<p[^>]*>/i,
    /<br\s*\/?>/i,
    /<strong[^>]*>/i,
    /<em[^>]*>/i,
  ];

  const mdxPatterns = [
    /^#+ /m,           // Markdown headings
    /^\s*-\s+/m,       // Markdown lists
    /\*\*[^*]+\*\*/,   // Bold markdown
    /\[.+\]\(.+\)/,    // Markdown links
    /<[A-Z][A-Za-z]+/, // JSX components (capitalized)
  ];

  const hasHtml = htmlPatterns.some(pattern => pattern.test(content));
  const hasMdx = mdxPatterns.some(pattern => pattern.test(content));

  // If has HTML tags but no MDX patterns, treat as HTML
  return hasHtml && !hasMdx;
}

/**
 * Convert HTML content to basic markdown/MDX
 */
function convertHtmlToMdx(html: string): string {
  return html
    // Headings
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    // Lists
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
    })
    // Code
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Horizontal rule
    .replace(/<hr[^>]*\/?>/gi, '---\n\n')
    // Line breaks
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Clean up remaining HTML
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * MDX Renderer component for public pages
 * Uses next-mdx-remote/rsc for server-side rendering of MDX content
 */
export async function MDXRenderer({ source, className }: MDXRendererProps) {
  // Handle empty content
  if (!source || !source.trim()) {
    return (
      <div className={cn('mdx-content', className)}>
        <p className="text-muted-500">Немає контенту</p>
      </div>
    );
  }

  // Convert HTML to MDX if necessary
  let processedSource = source;
  if (isHtmlContent(source)) {
    processedSource = convertHtmlToMdx(source);
  }

  try {
    return (
      <div className={cn('mdx-content', className)}>
        <MDXRemote
          source={processedSource}
          components={mdxComponents}
        />
      </div>
    );
  } catch (error) {
    console.error('[MDXRenderer] Error rendering MDX:', error);
    // Fallback: render as plain text with basic formatting
    return (
      <div className={cn('mdx-content', className)}>
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: source }}
        />
      </div>
    );
  }
}
