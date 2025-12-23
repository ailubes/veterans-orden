import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Мережа Вільних Людей',
  description:
    'Громадянська мережа політичного впливу. 1 000 000 вільних людей, щоб ухвалити закон про зброю самозахисту та контролювати порядок денний.',
  keywords: [
    'Мережа Вільних Людей',
    'зброя самозахисту',
    'громадянський вплив',
    'праймеріз',
    'політична участь',
  ],
  authors: [{ name: 'Мережа Вільних Людей' }],
  applicationName: 'Мережа Вільних Людей',
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
    title: 'Мережа Вільних Людей',
    description:
      'Громадянська мережа політичного впливу. 1 000 000 вільних людей, щоб ухвалити закон про зброю самозахисту.',
    url: 'https://freepeople.org.ua',
    siteName: 'Мережа Вільних Людей',
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Мережа Вільних Людей',
    description:
      'Громадянська мережа політичного впливу. 1 000 000 вільних людей, щоб ухвалити закон про зброю самозахисту.',
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
