'use client';

import { ReactNode } from 'react';

interface TinaProviderProps {
  children: ReactNode;
}

/**
 * TinaProvider component for wrapping the app with TinaCMS context
 * This provider enables visual editing for static pages via TinaCMS
 */
export function TinaProvider({ children }: TinaProviderProps) {
  // TinaCMS will automatically inject its visual editing tools in development mode
  // when running with `tinacms dev -c "next dev"`

  return <>{children}</>;
}
