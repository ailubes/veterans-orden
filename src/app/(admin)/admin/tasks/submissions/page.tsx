import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { isRegionalLeader } from '@/lib/permissions-utils';
import Link from 'next/link';
import { ArrowLeft, Clock, FileCheck, FileX } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SubmissionReviewCard } from '@/components/admin/submissions/submission-review-card';

export default async function SubmissionsPage() {
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Base query
  let query = supabase
    .from('task_submissions')
    .select(`
      *,
      task:tasks(id, title, points, type, priority, description),
      user:users!task_submissions_user_id_fkey(id, first_name, last_name, email, avatar_url),
      reviewer:users!task_submissions_reviewed_by_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  // Regional leaders can only see submissions from their referral tree
  if (isRegionalLeader(adminProfile.role)) {
    const { data: referralTree } = await supabase.rpc('get_referral_tree', {
      root_user_id: adminProfile.id,
    });
    const userIds = referralTree?.map((member: { id: string }) => member.id) || [];
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
  }

  const { data: submissions } = await query.limit(100);

  // Count by status
  const pendingCount = submissions?.filter((s) => s.status === 'pending').length || 0;
  const approvedCount = submissions?.filter((s) => s.status === 'approved').length || 0;
  const rejectedCount = submissions?.filter((s) => s.status === 'rejected').length || 0;

  const pendingSubmissions = submissions?.filter((s) => s.status === 'pending') || [];
  const reviewedSubmissions = submissions?.filter((s) => s.status !== 'pending') || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО ЗАВДАНЬ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl font-bold">Перевірка підтверджень</h1>
        <p className="text-sm text-muted-500 mt-2">
          Перегляньте та підтвердіть виконання завдань членами
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-panel-900 border border-line rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="label mb-1">ОЧІКУЮТЬ</p>
            <p className="font-syne text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <FileCheck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="label mb-1">ПІДТВЕРДЖЕНО</p>
            <p className="font-syne text-3xl font-bold text-green-600">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FileX size={24} className="text-red-600" />
          </div>
          <div>
            <p className="label mb-1">ВІДХИЛЕНО</p>
            <p className="font-syne text-3xl font-bold text-red-600">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <div className="mb-8">
          <h2 className="font-syne text-xl font-bold mb-4">
            Очікують перевірки ({pendingCount})
          </h2>
          <div className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <SubmissionReviewCard
                key={submission.id}
                submission={submission}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for pending */}
      {pendingSubmissions.length === 0 && (
        <div className="bg-panel-900 border border-line rounded-lg p-12 relative text-center mb-8">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <FileCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="font-syne text-xl font-bold mb-2">
            Всі підтвердження перевірені!
          </h3>
          <p className="text-sm text-muted-500">
            Нові підтвердження з&apos;являться тут після надсилання членами
          </p>
        </div>
      )}

      {/* Reviewed Submissions */}
      {reviewedSubmissions.length > 0 && (
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">
            Історія перевірок ({reviewedSubmissions.length})
          </h2>
          <div className="bg-panel-900 border border-line rounded-lg relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-line">
                  <tr>
                    <th className="text-left p-4 font-bold text-xs">ЗАВДАННЯ</th>
                    <th className="text-left p-4 font-bold text-xs">ЧЛЕН</th>
                    <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                    <th className="text-left p-4 font-bold text-xs">БАЛИ</th>
                    <th className="text-left p-4 font-bold text-xs">ПЕРЕВІРИВ</th>
                    <th className="text-left p-4 font-bold text-xs">ДАТА</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-line/20 hover:bg-timber-dark/5"
                    >
                      <td className="p-4">
                        <Link
                          href={`/admin/tasks/${submission.task?.id}`}
                          className="font-bold hover:text-bronze"
                        >
                          {submission.task?.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {submission.user?.first_name} {submission.user?.last_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold ${
                            submission.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {submission.status === 'approved' ? 'ПІДТВЕРДЖЕНО' : 'ВІДХИЛЕНО'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-bronze">
                          {submission.status === 'approved' ? `+${submission.points_awarded}` : '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-500">
                          {submission.reviewer?.first_name} {submission.reviewer?.last_name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-500">
                          {formatDate(submission.reviewed_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
