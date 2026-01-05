'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MEMBERSHIP_ROLES, PRIVILEGE_LABELS } from '@/lib/constants';
import RoleBadge from '@/components/ui/role-badge';
import {
  ChevronRight,
  Check,
  X,
  Loader2,
  TrendingUp,
  Users,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type MembershipRole = keyof typeof MEMBERSHIP_ROLES;

interface RoleProgress {
  currentRole: MembershipRole;
  currentRoleLevel: number;
  currentRoleLabel: string;
  nextRole: MembershipRole | null;
  nextRoleLevel: number | null;
  nextRoleLabel: string | null;
  isEligible: boolean;
  progressPercent: number;
  requirements: {
    type: 'contribution' | 'direct_referrals' | 'total_referrals' | 'helped_advance';
    label: string;
    current: number;
    required: number;
    isMet: boolean;
  }[];
  privileges: {
    current: string[];
    next: string[];
  };
}

interface ReferralStats {
  directReferrals: {
    total: number;
  };
  totalTreeCount: number;
}

interface RoleProgressCardProps {
  className?: string;
}

export default function RoleProgressCard({ className = '' }: RoleProgressCardProps) {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState<RoleProgress | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      const response = await fetch('/api/user/role-progress');
      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setProgress(data.progress);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching role progress:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити прогрес ролі',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckAdvancement() {
    setChecking(true);
    try {
      const response = await fetch('/api/user/check-advancement', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.advanced) {
        toast({
          title: 'Вітаємо! 🎉',
          description: `Ваш рівень підвищено до "${MEMBERSHIP_ROLES[data.newRole as MembershipRole]?.label}"!`,
        });
        fetchProgress();
      } else if (data.approvalRequired) {
        toast({
          title: 'Запит подано',
          description: 'Ваш запит на підвищення надіслано на розгляд адміністратора.',
        });
      } else {
        toast({
          title: 'Не вдалося підвищити',
          description: data.message || 'Ви ще не виконали всі вимоги.',
        });
      }
    } catch (error) {
      console.error('Error checking advancement:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося перевірити підвищення',
      });
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className={`border border-line p-6 bg-panel-900 rounded-lg ${className}`}>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-bronze" />
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className={`border border-line p-6 bg-panel-900 rounded-lg ${className}`}>
        <div className="text-center py-4">
          <p className="text-amber-500 font-medium mb-2">Дані про прогрес недоступні</p>
          <p className="text-sm text-muted-500">
            Система прогресу ролей налаштовується. Спробуйте пізніше.
          </p>
        </div>
      </div>
    );
  }

  const newPrivileges = progress.privileges.next.filter(
    (p) => !progress.privileges.current.includes(p)
  );

  return (
    <div className={`border border-line p-6 bg-panel-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-syne font-bold text-lg text-text-100">Ваш рівень у Мережі</h3>
        <TrendingUp className="w-5 h-5 text-bronze" />
      </div>

      {/* Current Role */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <RoleBadge membershipRole={progress.currentRole} size="lg" />
        </div>
        <p className="text-sm text-muted-500">
          {MEMBERSHIP_ROLES[progress.currentRole]?.description}
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-panel-850 border border-line rounded">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-100">
              {stats.directReferrals.total}
            </div>
            <div className="text-xs text-muted-500">Прямих рефералів</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-100">
              {stats.totalTreeCount}
            </div>
            <div className="text-xs text-muted-500">Всього у дереві</div>
          </div>
        </div>
      )}

      {/* Next Role Progress */}
      {progress.nextRole && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-text-100">Наступний рівень:</span>
            <RoleBadge membershipRole={progress.nextRole} size="sm" />
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-panel-850 rounded-full overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-bronze transition-all duration-500"
              style={{ width: `${progress.progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-text-100">
                {progress.progressPercent}%
              </span>
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-2">
            {progress.requirements.map((req, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm p-2 border rounded ${
                  req.isMet
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-panel-850 border-line text-text-200'
                }`}
              >
                {req.isMet ? (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-muted-500 flex-shrink-0" />
                )}
                <span className="flex-1">{req.label}</span>
                <span className="font-mono text-xs">
                  {req.current}/{req.required}
                </span>
              </div>
            ))}
          </div>

          {/* New Privileges Preview */}
          {newPrivileges.length > 0 && (
            <div className="mt-4 p-3 bg-bronze/10 border border-bronze/30 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-bronze" />
                <span className="text-sm font-medium text-bronze">
                  Нові привілеї:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {newPrivileges.map((privilege) => (
                  <span
                    key={privilege}
                    className="text-xs bg-panel-850 text-text-200 px-2 py-0.5 border border-line rounded"
                  >
                    {PRIVILEGE_LABELS[privilege as keyof typeof PRIVILEGE_LABELS] || privilege}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Max Level Message */}
      {!progress.nextRole && (
        <div className="mb-6 p-4 bg-bronze/10 border border-bronze/30 text-center rounded">
          <Sparkles className="w-8 h-8 text-bronze mx-auto mb-2" />
          <p className="font-bold text-text-100">Ви досягли найвищого рівня!</p>
          <p className="text-sm text-muted-500">
            Дякуємо за вашу відданість Мережі Вільних Людей.
          </p>
        </div>
      )}

      {/* Action Button */}
      {progress.nextRole && (
        <Link
          href="/dashboard/progression"
          className="w-full flex items-center justify-center gap-2 bg-bronze text-bg-950 px-6 py-3 font-bold text-sm hover:bg-bronze/90 transition-colors rounded"
        >
          <TrendingUp className="w-4 h-4" />
          {progress.isEligible ? 'Підвищити рівень' : 'Переглянути завдання'}
        </Link>
      )}
    </div>
  );
}
