'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

interface HelpTooltipProps {
  pageSlug: string;
  elementId: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TooltipData {
  id: string;
  content: string;
  article: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

/**
 * HelpTooltip Component
 *
 * Displays a contextual help tooltip next to UI elements
 *
 * Usage:
 * <HelpTooltip pageSlug="dashboard-votes" elementId="vote-submit-button">
 *   <button>Submit Vote</button>
 * </HelpTooltip>
 *
 * Or standalone:
 * <HelpTooltip pageSlug="dashboard-votes" elementId="vote-submit-button" />
 */
export function HelpTooltip({
  pageSlug,
  elementId,
  children,
  position = 'right',
}: HelpTooltipProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch tooltips for this page
  useEffect(() => {
    async function fetchTooltips() {
      try {
        const response = await fetch(`/api/help/tooltips/${pageSlug}`);
        const data = await response.json();

        if (data.tooltips && data.tooltips[elementId]) {
          setTooltip(data.tooltips[elementId]);
        }
      } catch (error) {
        console.error('Failed to fetch tooltip:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTooltips();
  }, [pageSlug, elementId]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Don't render if loading or no tooltip exists
  if (loading || !tooltip) {
    return children ? <>{children}</> : null;
  }

  // Get position classes for popover
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
      default:
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {children}

      {/* Help Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-bronze/10 transition-colors rounded-full group"
          title="Довідка"
          aria-label="Показати довідку"
        >
          <HelpCircle
            size={18}
            className="text-muted-500 group-hover:text-bronze transition-colors"
          />
        </button>

        {/* Popover */}
        {isOpen && (
          <div
            ref={popoverRef}
            className={`absolute z-50 w-80 bg-white border border-line rounded-lg shadow-lg ${getPositionClasses()}`}
          >
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b-2 border-line bg-timber-dark/5">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-bronze" />
                <p className="font-bold text-sm">Підказка</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-timber-dark/10 transition-colors rounded"
                aria-label="Закрити"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm leading-relaxed">{tooltip.content}</p>

              {/* Link to article */}
              {tooltip.article && (
                <Link
                  href={`/help/${tooltip.article.slug}`}
                  className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-bronze hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  <ExternalLink size={14} />
                  Дізнатися більше: {tooltip.article.title}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
