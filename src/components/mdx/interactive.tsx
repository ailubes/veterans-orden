'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// ACCORDION - Collapsible sections
// ============================================================================

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-line rounded-lg overflow-hidden my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 bg-panel-850 hover:bg-panel-800 transition-colors text-left"
      >
        <span className="font-syne font-bold text-text-100">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-panel-900 border-t border-line">
          <div className="text-text-100/80 font-mono text-sm leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TABS - Tabbed content
// ============================================================================

interface TabsProps {
  children: React.ReactNode;
}

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export function Tabs({ children }: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className="my-6">
      <div className="flex border-b border-line overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'px-4 py-2 font-mono text-sm font-medium whitespace-nowrap transition-colors',
              activeIndex === index
                ? 'text-bronze border-b-2 border-bronze -mb-px'
                : 'text-muted-500 hover:text-text-100'
            )}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-panel-900 border border-t-0 border-line rounded-b-lg">
        {tabs[activeIndex]}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return (
    <div className="text-text-100/80 font-mono text-sm leading-relaxed">
      {children}
    </div>
  );
}
