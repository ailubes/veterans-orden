import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Client components that need interactivity
import { Accordion, Tabs, Tab } from './interactive';

// ============================================================================
// CALLOUT - Alert/info boxes
// ============================================================================

type CalloutType = 'info' | 'warning' | 'error' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutStyles: Record<CalloutType, { bg: string; border: string; icon: React.ReactNode }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Info className="w-5 h-5 text-blue-400" />,
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = calloutStyles[type];

  return (
    <div
      className={cn(
        'my-6 rounded-lg border-l-4 p-4',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1">
          {title && (
            <p className="font-syne font-bold text-text-100 mb-1">{title}</p>
          )}
          <div className="text-text-100/80 font-mono text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD - Content cards
// ============================================================================

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
}

export function Card({ title, icon, href, children }: CardProps) {
  const content = (
    <div className="group h-full rounded-lg border border-line bg-panel-900 p-6 transition-all hover:border-bronze/50 hover:shadow-lg hover:shadow-bronze/5">
      <div className="flex items-start gap-3 mb-3">
        {icon && (
          <div className="flex-shrink-0 text-bronze">{icon}</div>
        )}
        <h3 className="font-syne font-bold text-lg text-text-100 group-hover:text-bronze transition-colors">
          {title}
        </h3>
        {href && (
          <ExternalLink className="w-4 h-4 text-muted-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="text-text-100/70 font-mono text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

// ============================================================================
// CARD GRID - Grid of cards
// ============================================================================

interface CardGridProps {
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function CardGrid({ cols = 3, children }: CardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 my-6', gridCols[cols])}>
      {children}
    </div>
  );
}

// ============================================================================
// ACCORDION - Re-exported from interactive
// ============================================================================
// Note: Accordion is exported from ./interactive as a client component

// ============================================================================
// ACCORDION GROUP - Multiple accordions
// ============================================================================

interface AccordionGroupProps {
  children: React.ReactNode;
}

export function AccordionGroup({ children }: AccordionGroupProps) {
  return <div className="my-6 space-y-2">{children}</div>;
}

// ============================================================================
// TABS - Re-exported from interactive
// ============================================================================
// Note: Tabs and Tab are exported from ./interactive as client components

// ============================================================================
// STEPS - Numbered steps
// ============================================================================

interface StepsProps {
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
  const steps = React.Children.toArray(children) as React.ReactElement<StepProps>[];

  return (
    <div className="my-6 space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-bronze text-bg-950 flex items-center justify-center font-syne font-bold text-sm">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 h-full bg-line mx-auto mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <h4 className="font-syne font-bold text-text-100 mb-2">
              {step.props.title}
            </h4>
            <div className="text-text-100/70 font-mono text-sm leading-relaxed">
              {step.props.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Step({ children }: StepProps) {
  return <>{children}</>;
}

// ============================================================================
// QUOTE - Styled blockquote
// ============================================================================

interface QuoteProps {
  author?: string;
  role?: string;
  children: React.ReactNode;
}

export function Quote({ author, role, children }: QuoteProps) {
  return (
    <blockquote className="my-6 border-l-4 border-bronze pl-6 py-2">
      <p className="font-mono text-lg text-text-100/90 italic leading-relaxed">
        "{children}"
      </p>
      {(author || role) && (
        <footer className="mt-3">
          {author && (
            <span className="font-syne font-bold text-bronze">{author}</span>
          )}
          {role && (
            <span className="text-muted-500 text-sm ml-2">— {role}</span>
          )}
        </footer>
      )}
    </blockquote>
  );
}

// ============================================================================
// HERO - Page hero section
// ============================================================================

interface HeroProps {
  title: string;
  description?: string;
  image?: string;
}

export function Hero({ title, description, image }: HeroProps) {
  return (
    <div className="relative py-16 -mx-4 px-4 mb-8 bg-gradient-to-b from-panel-850 to-panel-900">
      {image && (
        <div className="absolute inset-0 opacity-20">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="relative max-w-3xl mx-auto text-center">
        <h1 className="font-syne text-4xl md:text-5xl font-bold text-text-100 mb-4">
          {title}
        </h1>
        {description && (
          <p className="font-mono text-lg text-text-100/70">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STATS - Statistics display
// ============================================================================

interface StatItem {
  label: string;
  value: string;
}

interface StatsProps {
  items: StatItem[];
}

export function Stats({ items }: StatsProps) {
  return (
    <div className="my-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="text-center p-4 bg-panel-850 rounded-lg border border-line"
        >
          <div className="font-syne text-3xl font-bold text-bronze mb-1">
            {item.value}
          </div>
          <div className="font-mono text-xs text-muted-500 uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CTA - Call-to-action
// ============================================================================

interface CTAProps {
  title: string;
  description?: string;
  buttonText: string;
  href: string;
}

export function CTA({ title, description, buttonText, href }: CTAProps) {
  return (
    <div className="my-8 p-8 bg-gradient-to-r from-bronze/20 to-bronze/10 border border-bronze/30 rounded-lg text-center">
      <h3 className="font-syne text-2xl font-bold text-text-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-mono text-text-100/70 mb-6 max-w-lg mx-auto">
          {description}
        </p>
      )}
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-bg-950 font-mono font-bold text-sm rounded hover:bg-bronze/90 transition-colors"
      >
        {buttonText}
      </Link>
    </div>
  );
}

// ============================================================================
// ENHANCED IMAGE - With caption support
// ============================================================================

interface MDXImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function MDXImage({ src, alt, caption }: MDXImageProps) {
  return (
    <figure className="my-6">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-panel-850">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-sm text-muted-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ============================================================================
// VIDEO - Video embed
// ============================================================================

interface VideoProps {
  src: string;
  provider?: 'youtube' | 'vimeo';
}

export function Video({ src, provider = 'youtube' }: VideoProps) {
  let embedUrl = src;

  if (provider === 'youtube') {
    // Convert various YouTube URL formats to embed format
    const videoId = src.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (provider === 'vimeo') {
    const videoId = src.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  return (
    <div className="my-6 relative aspect-video rounded-lg overflow-hidden bg-panel-850">
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ============================================================================
// DIVIDER - Horizontal rule with style
// ============================================================================

export function Divider() {
  return (
    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
  );
}

// ============================================================================
// LINK CARD - Rich link preview card
// ============================================================================

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  image?: string;
}

export function LinkCard({ href, title, description, image }: LinkCardProps) {
  const isExternal = href.startsWith('http');

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group block my-4 border border-line rounded-lg overflow-hidden hover:border-bronze/50 transition-colors"
    >
      <div className="flex">
        {image && (
          <div className="relative w-32 flex-shrink-0 bg-panel-850">
            <Image src={image} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2">
            <h4 className="font-syne font-bold text-text-100 group-hover:text-bronze transition-colors">
              {title}
            </h4>
            {isExternal && (
              <ExternalLink className="w-4 h-4 text-muted-500" />
            )}
          </div>
          {description && (
            <p className="mt-1 font-mono text-sm text-text-100/60 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// EXPORTS FOR MDX
// ============================================================================

export const mdxComponents = {
  Callout,
  Card,
  CardGrid,
  Accordion,
  AccordionGroup,
  Tabs,
  Tab,
  Steps,
  Step,
  Quote,
  Hero,
  Stats,
  CTA,
  Image: MDXImage,
  Video,
  Divider,
  LinkCard,
};
