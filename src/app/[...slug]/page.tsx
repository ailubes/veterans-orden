import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { MDXRenderer } from '@/components/mdx/mdx-renderer';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Fetch page data from database
async function getPage(slugPath: string) {
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slugPath)
    .eq('status', 'published')
    .single();

  if (error || !page) {
    return null;
  }

  return page;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const page = await getPage(slugPath);

  if (!page) {
    return {
      title: 'Сторінку не знайдено',
    };
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.description,
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || page.description,
      images: page.featured_image_url ? [page.featured_image_url] : undefined,
    },
  };
}

// Main page component
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const page = await getPage(slugPath);

  if (!page) {
    notFound();
  }

  return (
    <PageLayout>
      <PageHeader
        subtitle={page.label ? `// ${page.label}` : undefined}
        title={page.title}
        description={page.description}
      />

      <PageContent narrow>
        <MDXRenderer source={page.content} />
      </PageContent>
    </PageLayout>
  );
}
