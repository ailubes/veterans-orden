'use client';

import { ClerkProvider } from '@clerk/nextjs';

// Clerk appearance customization to match Timber design
const clerkAppearance = {
  variables: {
    colorPrimary: '#2c2824',
    colorText: '#2c2824',
    colorTextSecondary: '#4a4238',
    colorBackground: '#f4f1eb',
    colorInputBackground: '#f4f1eb',
    colorInputText: '#2c2824',
    borderRadius: '0px',
    fontFamily: '"Space Mono", monospace',
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: '#2c2824',
      color: '#f4f1eb',
      fontFamily: '"Space Mono", monospace',
      fontWeight: '700',
      fontSize: '13px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderRadius: '0',
      '&:hover': {
        backgroundColor: '#4a4238',
      },
    },
    card: {
      backgroundColor: '#f4f1eb',
      border: '2px solid #2c2824',
      borderRadius: '0',
      boxShadow: 'none',
    },
    headerTitle: {
      fontFamily: '"Syne", sans-serif',
      fontWeight: '800',
      color: '#2c2824',
    },
    headerSubtitle: {
      fontFamily: '"Space Mono", monospace',
      color: '#4a4238',
    },
    formFieldLabel: {
      fontFamily: '"Space Mono", monospace',
      fontSize: '10px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      color: '#2c2824',
    },
    formFieldInput: {
      fontFamily: '"Space Mono", monospace',
      backgroundColor: '#f4f1eb',
      border: '2px solid #2c2824',
      borderRadius: '0',
      '&:focus': {
        borderColor: '#d45d3a',
        boxShadow: 'none',
      },
    },
    footerActionLink: {
      color: '#d45d3a',
      fontFamily: '"Space Mono", monospace',
      '&:hover': {
        color: '#2c2824',
      },
    },
    identityPreviewEditButton: {
      color: '#d45d3a',
    },
    formResendCodeLink: {
      color: '#d45d3a',
    },
  },
};

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
}
