'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, UserX, UserCheck, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface MemberQuickActionsProps {
  memberId: string;
  initialStatus: string;
  editHref: string;
  canEdit: boolean;
  canApprove: boolean;
  canSuspend: boolean;
  canImpersonate: boolean;
}

export function MemberQuickActions({
  memberId,
  initialStatus,
  editHref,
  canEdit,
  canApprove,
  canSuspend,
  canImpersonate,
}: MemberQuickActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const patchStatus = async (newStatus: string, label: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
      toast({ title: label, description: `Статус змінено на "${newStatus === 'active' ? 'Активний' : newStatus === 'suspended' ? 'Призупинено' : newStatus}"` });
      router.refresh();
    } catch {
      toast({ title: 'Помилка', description: 'Не вдалося змінити статус', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <Link href={editHref} className="btn flex items-center gap-2">
          <Edit size={16} />
          РЕДАГУВАТИ
        </Link>
      )}

      {/* Approve: shown for pending members */}
      {canApprove && status === 'pending' && (
        <button
          onClick={() => patchStatus('active', 'Схвалено')}
          disabled={loading}
          className="btn flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
        >
          <UserCheck size={16} />
          {loading ? 'ЗБЕРЕЖЕННЯ...' : 'СХВАЛИТИ'}
        </button>
      )}

      {canSuspend && status !== 'suspended' && status !== 'pending' && (
        <button
          onClick={() => patchStatus('suspended', 'Призупинено')}
          disabled={loading}
          className="btn btn-outline flex items-center gap-2 disabled:opacity-50"
        >
          <UserX size={16} />
          ПРИЗУПИНИТИ
        </button>
      )}

      {canSuspend && status === 'suspended' && (
        <button
          onClick={() => patchStatus('active', 'Відновлено')}
          disabled={loading}
          className="btn btn-outline flex items-center gap-2 disabled:opacity-50"
        >
          <UserCheck size={16} />
          ВІДНОВИТИ
        </button>
      )}

      {canImpersonate && (
        <Link
          href={`/api/admin/members/${memberId}/impersonate`}
          className="btn btn-outline flex items-center gap-2"
        >
          <Shield size={16} />
          ІМІТУВАТИ
        </Link>
      )}
    </div>
  );
}
