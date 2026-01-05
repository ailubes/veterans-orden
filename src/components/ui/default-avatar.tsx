'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic import for Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => null,
});

export type UserSex = 'male' | 'female' | 'not_specified' | null | undefined;

interface DefaultAvatarProps {
  sex?: UserSex;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackInitials?: string;
  showAnimation?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeClasses = {
  xs: 'text-[8px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
};

export function DefaultAvatar({
  sex,
  size = 'md',
  className,
  fallbackInitials,
  showAnimation = true,
}: DefaultAvatarProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load animation data on client side
  useEffect(() => {
    setIsClient(true);

    const loadAnimation = async () => {
      try {
        let data;
        switch (sex) {
          case 'male':
            data = await import('@/../public/animations/avatars/avatar-male.json');
            break;
          case 'female':
            data = await import('@/../public/animations/avatars/avatar-female.json');
            break;
          default:
            data = await import('@/../public/animations/avatars/avatar-neutral.json');
            break;
        }
        setAnimationData(data.default || data);
      } catch (error) {
        console.error('Failed to load avatar animation:', error);
      }
    };

    if (showAnimation) {
      loadAnimation();
    }
  }, [sex, showAnimation]);

  // Static fallback (initials or User icon)
  const renderFallback = () => (
    <div
      className={cn(
        'rounded-full bg-panel-850 flex items-center justify-center text-text-100 font-bold border border-line rounded-lg/20',
        sizeClasses[size],
        textSizeClasses[size],
        className
      )}
    >
      {fallbackInitials || <User className="w-1/2 h-1/2" />}
    </div>
  );

  // If animations are disabled or not loaded yet, show static fallback
  if (!showAnimation || !isClient || !animationData) {
    return renderFallback();
  }

  return (
    <div
      className={cn(
        'rounded-full bg-panel-850 overflow-hidden border border-line rounded-lg/20',
        sizeClasses[size],
        className
      )}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
