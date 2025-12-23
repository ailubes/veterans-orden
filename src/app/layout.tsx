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
