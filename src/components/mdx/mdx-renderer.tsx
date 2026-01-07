import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx';
import { cn } from '@/lib/utils';

interface MDXRendererProps {
  source: string;
  className?: string;
}

/**
 * MDX Renderer component for public pages
 * Uses next-mdx-remote/rsc for server-side rendering of MDX content
 */
export async function MDXRenderer({ source, className }: MDXRendererProps) {
  return (
    <div className={cn('mdx-content', className)}>
      <MDXRemote
        source={source}
        components={mdxComponents}
      />
    </div>
  );
}
