'use client';

import React from 'react';

interface LinkifyTextProps {
  text: string;
  className?: string;
  maxUrlLength?: number;
}

/**
 * Shortens a URL for display while keeping it readable
 * e.g., "https://example.com/very/long/path/to/page" → "example.com/very/long..."
 */
function shortenUrl(url: string, maxLength: number = 40): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname + urlObj.search;

    // If domain alone is too long, truncate it
    if (domain.length >= maxLength) {
      return domain.slice(0, maxLength - 3) + '...';
    }

    // Calculate remaining space for path
    const remainingLength = maxLength - domain.length;

    if (path.length <= remainingLength || path === '/') {
      return domain + (path === '/' ? '' : path);
    }

    // Truncate path
    return domain + path.slice(0, remainingLength - 3) + '...';
  } catch {
    // If URL parsing fails, just truncate the string
    if (url.length > maxLength) {
      return url.slice(0, maxLength - 3) + '...';
    }
    return url;
  }
}

/**
 * Component that renders text with clickable, shortened URLs
 */
export function LinkifyText({ text, className = '', maxUrlLength = 40 }: LinkifyTextProps) {
  // URL regex pattern - matches http, https, and www URLs
  const urlPattern = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  // Reset regex lastIndex
  urlPattern.lastIndex = 0;

  while ((match = urlPattern.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // Get the matched URL
    let url = match[0];

    // Add protocol if missing (for www. URLs)
    const href = url.startsWith('http') ? url : `https://${url}`;

    // Add the shortened, clickable URL
    parts.push(
      <a
        key={`link-${keyIndex++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bronze hover:underline break-all"
        title={url}
      >
        {shortenUrl(url, maxUrlLength)}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${keyIndex++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  // If no URLs found, just return the text
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return <span className={`whitespace-pre-wrap ${className}`}>{parts}</span>;
}
