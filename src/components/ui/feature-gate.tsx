'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  showLockOverlay?: boolean; // If false, just hides content instead of showing lock
}

interface GateInfo {
  unlocked: boolean;
  displayName: string;
  description: string;
  requiredRole: string;
  requiredRoleLabel: string;
  requiredRoleLevel: number;
  currentRole: string;
  currentRoleLabel: string;
  currentRoleLevel: number;
}

/**
 * FeatureGate component - controls access to features based on membership role
 * If unlocked, renders children normally
 * If locked, shows overlay with lock icon and CTA to progression page
 */
export default function FeatureGate({
  featureKey,
  children,
  showLockOverlay = true,
}: FeatureGateProps) {
  const [gateInfo, setGateInfo] = useState<GateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkFeature() {
      try {
        const response = await fetch('/api/features/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureKey }),
        });

        if (!response.ok) {
          console.error('[FeatureGate] Failed to check feature:', response.statusText);
          // Default to unlocked on error to avoid blocking users
          setGateInfo({
            unlocked: true,
            displayName: featureKey,
            description: '',
            requiredRole: '',
            requiredRoleLabel: '',
            requiredRoleLevel: 0,
            currentRole: '',
            currentRoleLabel: '',
            currentRoleLevel: 0,
          });
          return;
        }

        const data = await response.json();
        setGateInfo(data);
      } catch (error) {
        console.error('[FeatureGate] Error checking feature:', error);
        // Default to unlocked on error
        setGateInfo({
          unlocked: true,
          displayName: featureKey,
          description: '',
          requiredRole: '',
          requiredRoleLabel: '',
          requiredRoleLevel: 0,
          currentRole: '',
          currentRoleLabel: '',
          currentRoleLevel: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkFeature();
  }, [featureKey]);

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-timber-dark/10 rounded" />
      </div>
    );
  }

  // Feature is unlocked - render normally
  if (gateInfo?.unlocked) {
    return <>{children}</>;
  }

  // Feature is locked - hide or show lock overlay
  if (!showLockOverlay) {
    return null;
  }

  // Feature is locked - show overlay
  return (
    <div className="relative">
      {/* Dimmed content */}
      <div className="opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="
          max-w-md w-full
          border-2 border-timber-dark bg-canvas
          card-with-joints
          p-6
          text-center
        ">
          <Lock className="w-12 h-12 text-timber-dark mx-auto mb-4" />

          <h3 className="font-syne text-2xl font-bold text-timber-dark mb-2">
            {gateInfo?.displayName || 'Функція заблокована'}
          </h3>

          <p className="font-mono text-sm text-timber-dark/80 mb-4">
            {gateInfo?.description || 'Ця функція доступна на вищих рівнях членства'}
          </p>

          {/* Required role badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent mb-6">
            <Lock className="w-4 h-4 text-accent" />
            <span className="font-mono text-sm text-accent">
              Потрібно: <strong>{gateInfo?.requiredRoleLabel}</strong>
            </span>
          </div>

          {/* CTA to progression page */}
          <Link
            href="/dashboard/progression"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-accent text-canvas
              font-mono text-sm font-semibold
              border-2 border-accent
              transition-all duration-200
              hover:bg-timber-dark hover:border-timber-dark
            "
          >
            Дізнатися як розблокувати
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Progress indicator */}
          <p className="font-mono text-xs text-timber-dark/60 mt-4">
            Ваш рівень: {gateInfo?.currentRoleLabel} (рівень {gateInfo?.currentRoleLevel})
          </p>
        </div>
      </div>
    </div>
  );
}
