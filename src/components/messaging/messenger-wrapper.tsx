'use client';

import { ReactNode } from 'react';
import { MessengerProvider } from './messenger-provider';
import { MessengerOverlay } from './messenger-overlay';

interface MessengerWrapperProps {
  children: ReactNode;
}

export function MessengerWrapper({ children }: MessengerWrapperProps) {
  return (
    <MessengerProvider>
      {children}
      <MessengerOverlay />
    </MessengerProvider>
  );
}
