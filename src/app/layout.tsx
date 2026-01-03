import type { Metadata } from 'next';
import { Providers } from './providers';
import { ContentAdapter } from '@/lib/content/ContentAdapter';
import './globals.css';

export const metadata: Metadata = {
  title: ContentAdapter.getOrgName('full'),
  description: ContentAdapter.getMission('description'),
  keywords: [
    'ветерани',
    'україна',
    'орден',
    'підтримка',
    'братерство',
    'адаптація',
    'захист прав',
  ],
  authors: [{ name: ContentAdapter.getOrgName('short') }],
  applicationName: ContentAdapter.getOrgName('short'),
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'mask-icon', url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: ContentAdapter.getOrgName('short'),
    description: ContentAdapter.getMission('statement'),
    url: ContentAdapter.getUrls().main,
    siteName: ContentAdapter.getOrgName('short'),
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ContentAdapter.getOrgName('short'),
    description: ContentAdapter.getMission('statement'),
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-square70x70logo': '/mstile-70x70.png',
    'msapplication-square150x150logo': '/mstile-150x150.png',
    'msapplication-wide310x150logo': '/mstile-310x150.png',
    'msapplication-square310x310logo': '/mstile-310x310.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
