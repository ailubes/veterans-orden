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
        <div className="h-40 bg-panel-850/10 rounded" />
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
          border-2 border-bronze/40 rounded-lg bg-panel-900
          shadow-lg shadow-bronze/10
          p-6
          text-center
          relative
          overflow-hidden
        ">
          {/* Locked badge */}
          <div className="absolute top-0 left-0 right-0 bg-bronze/20 py-1.5 px-3">
            <span className="font-mono text-xs font-bold text-bronze tracking-wider">ЗАБЛОКОВАНО</span>
          </div>

          <Lock className="w-12 h-12 text-bronze mx-auto mb-4 mt-8" />

          <h3 className="font-syne text-2xl font-bold text-text-100 mb-2">
            {gateInfo?.displayName || 'Функція заблокована'}
          </h3>

          <p className="font-mono text-sm text-text-100/80 mb-4">
            {gateInfo?.description || 'Ця функція доступна на вищих рівнях членства'}
          </p>

          {/* Required role badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bronze/10 border border-bronze mb-6">
            <Lock className="w-4 h-4 text-bronze" />
            <span className="font-mono text-sm text-bronze">
              Потрібно: <strong>{gateInfo?.requiredRoleLabel}</strong>
            </span>
          </div>

          {/* CTA to progression page */}
          <Link
            href="/dashboard/progression"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-bronze text-canvas
              font-mono text-sm font-semibold
              border-2 border-bronze
              transition-all duration-200
              hover:bg-panel-850 hover:border-line
            "
          >
            Дізнатися як розблокувати
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Progress indicator */}
          <p className="font-mono text-xs text-text-100/60 mt-4">
            Ваш рівень: {gateInfo?.currentRoleLabel} (рівень {gateInfo?.currentRoleLevel})
          </p>
        </div>
      </div>
    </div>
  );
}
