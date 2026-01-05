'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { MEMBERSHIP_ROLES, PRIVILEGE_LABELS } from '@/lib/constants';
import RoleBadge from '@/components/ui/role-badge';
import {
  Loader2,
  TrendingUp,
  Settings2,
  Check,
  X,
  Users,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MembershipRole = keyof typeof MEMBERSHIP_ROLES;

interface RoleRequirement {
  id: string;
  role: MembershipRole;
  roleLevel: number;
  displayNameUk: string;
  descriptionUk: string | null;
  requiresContribution: boolean;
  minContributionAmount: number | null;
  minDirectReferrals: number;
  minDirectReferralsAtRole: MembershipRole | null;
  minTotalReferrals: number;
  minHelpedAdvance: number;
  helpedAdvanceFromRole: MembershipRole | null;
  helpedAdvanceToRole: MembershipRole | null;
  privileges: string[];
}

interface PendingRequest {
  id: string;
  userId: string;
  requestedRole: MembershipRole;
  currentRole: MembershipRole;
  requestedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface RecentAdvancement {
  id: string;
  userId: string;
  fromRole: MembershipRole;
  toRole: MembershipRole;
  advancedAt: string;
  triggerType: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface MembershipProgressionTabProps {
  adminProfile: AdminProfile;
}

export default function MembershipProgressionTab({
  adminProfile,
}: MembershipProgressionTabProps) {
  const [loading, setLoading] = useState(true);
  const [advancementMode, setAdvancementMode] = useState<'automatic' | 'approval_required'>('automatic');
  const [requirements, setRequirements] = useState<RoleRequirement[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [recentAdvancements, setRecentAdvancements] = useState<RecentAdvancement[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isSuperAdmin = adminProfile.role === 'super_admin';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [requirementsRes, requestsRes, modeRes] = await Promise.all([
        fetch('/api/admin/role-requirements'),
        fetch('/api/admin/advancement-requests?includeRecent=true'),
        fetch('/api/admin/settings/advancement-mode'),
      ]);

      if (requirementsRes.ok) {
        const data = await requirementsRes.json();
        setRequirements(data.requirements || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setPendingRequests(data.pendingRequests || []);
        setRecentAdvancements(data.recentAdvancements || []);
      }

      if (modeRes.ok) {
        const data = await modeRes.json();
        setAdvancementMode(data.mode || 'automatic');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити дані',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleModeChange(mode: 'automatic' | 'approval_required') {
    setUpdatingMode(true);
    try {
      const response = await fetch('/api/admin/settings/advancement-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mode');
      }

      setAdvancementMode(mode);
      toast({
        title: 'Збережено',
        description: `Режим підвищення змінено на "${mode === 'automatic' ? 'Автоматичний' : 'Потребує схвалення'}"`,
      });
    } catch (error) {
      console.error('Error updating mode:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося оновити режим підвищення',
      });
    } finally {
      setUpdatingMode(false);
    }
  }

  async function handleApproveRequest(request: PendingRequest) {
    setProcessingRequest(request.id);
    try {
      const response = await fetch('/api/admin/advancement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          approved: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }

      toast({
        title: 'Схвалено',
        description: `${request.user.firstName} ${request.user.lastName} підвищено до "${MEMBERSHIP_ROLES[request.requestedRole]?.label}"`,
      });

      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося схвалити запит',
      });
    } finally {
      setProcessingRequest(null);
    }
  }

  async function handleRejectRequest() {
    if (!selectedRequest) return;

    setProcessingRequest(selectedRequest.id);
    try {
      const response = await fetch('/api/admin/advancement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          approved: false,
          rejectionReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject request');
      }

      toast({
        title: 'Відхилено',
        description: `Запит ${selectedRequest.user.firstName} ${selectedRequest.user.lastName} відхилено`,
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося відхилити запит',
      });
    } finally {
      setProcessingRequest(null);
    }
  }

  function openRejectDialog(request: PendingRequest) {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectDialog(true);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints flex items-center justify-center min-h-[300px]">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />
        <Loader2 className="w-8 h-8 animate-spin text-bronze" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Advancement Mode Setting */}
        <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                <Settings2 className="w-6 h-6" />
                Режим підвищення ролей
              </h2>
              <p className="text-muted-500 text-sm">
                Визначає, як користувачі отримують нові рівні членства
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={advancementMode}
              onValueChange={(v) => handleModeChange(v as 'automatic' | 'approval_required')}
              disabled={updatingMode || !isSuperAdmin}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Автоматичний</span>
                  </div>
                </SelectItem>
                <SelectItem value="approval_required">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Потребує схвалення</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {updatingMode && (
              <Loader2 className="w-5 h-5 animate-spin text-bronze" />
            )}
          </div>

          {!isSuperAdmin && (
            <p className="text-sm text-muted-500 mt-4">
              Тільки супер-адміністратор може змінювати цю настройку.
            </p>
          )}

          <div className="mt-4 p-4 bg-panel-850/5 border border-line/20">
            {advancementMode === 'automatic' ? (
              <p className="text-sm">
                <strong>Автоматичний режим:</strong> Користувачі автоматично отримують нові рівні,
                як тільки виконують всі вимоги.
              </p>
            ) : (
              <p className="text-sm">
                <strong>Потребує схвалення:</strong> Коли користувач виконує вимоги, він подає запит,
                який адміністратор повинен схвалити або відхилити.
              </p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        {advancementMode === 'approval_required' && pendingRequests.length > 0 && (
          <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-600" />
                Запити на підвищення
                <span className="bg-amber-500 text-canvas text-xs px-2 py-1 rounded-full ml-2">
                  {pendingRequests.length}
                </span>
              </h2>
              <button
                onClick={fetchData}
                className="btn btn-outline text-sm"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-line rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="font-bold">
                      {request.user.firstName} {request.user.lastName}
                    </div>
                    <div className="text-sm text-muted-500">{request.user.email}</div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <RoleBadge membershipRole={request.currentRole} size="sm" />
                      <span className="text-muted-500">→</span>
                      <RoleBadge membershipRole={request.requestedRole} size="sm" />
                    </div>
                    <div className="text-xs text-muted-500 mt-2">
                      Запит: {formatDate(request.requestedAt)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(request)}
                      disabled={processingRequest === request.id}
                      className="btn btn-primary text-sm flex items-center gap-1"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Схвалити
                    </button>
                    <button
                      onClick={() => openRejectDialog(request)}
                      disabled={processingRequest === request.id}
                      className="btn btn-outline text-sm flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                      Відхилити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Requirements */}
        <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="mb-6">
            <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Рівні членства
            </h2>
            <p className="text-muted-500 text-sm">
              8 рівнів прогресії учасників Мережі Вільних Людей
            </p>
          </div>

          <div className="space-y-3">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="border border-line rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRole(expandedRole === req.id ? null : req.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 hover:bg-panel-850/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-panel-850 text-canvas flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {req.roleLevel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <RoleBadge membershipRole={req.role} size="sm" />
                    </div>
                  </div>
                  {expandedRole === req.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-500 flex-shrink-0" />
                  )}
                </button>

                {expandedRole === req.id && (
                  <div className="p-4 pt-0 border-t border-line/20">
                    {req.descriptionUk && (
                      <p className="text-sm text-muted-500 mb-4">{req.descriptionUk}</p>
                    )}

                    {/* Requirements */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-bold">Вимоги:</h4>
                      {req.roleLevel === 0 ? (
                        <p className="text-sm text-muted-500">Реєстрація на платформі</p>
                      ) : (
                        <ul className="text-sm space-y-1">
                          {req.requiresContribution && (
                            <li className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-600" />
                              Внесок від {(req.minContributionAmount || 0) / 100} грн
                            </li>
                          )}
                          {req.minDirectReferrals > 0 && (
                            <li className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-blue-600" />
                              {req.minDirectReferrals} прямих рефералів
                              {req.minDirectReferralsAtRole && (
                                <span className="text-muted-500">
                                  (рівень: {MEMBERSHIP_ROLES[req.minDirectReferralsAtRole]?.label})
                                </span>
                              )}
                            </li>
                          )}
                          {req.minTotalReferrals > 0 && (
                            <li className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-purple-600" />
                              {req.minTotalReferrals} загальних рефералів у дереві
                            </li>
                          )}
                          {req.minHelpedAdvance > 0 && (
                            <li className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-amber-600" />
                              {req.minHelpedAdvance} допомогли підвищити
                              {req.helpedAdvanceFromRole && req.helpedAdvanceToRole && (
                                <span className="text-muted-500">
                                  (з {MEMBERSHIP_ROLES[req.helpedAdvanceFromRole]?.label} до{' '}
                                  {MEMBERSHIP_ROLES[req.helpedAdvanceToRole]?.label})
                                </span>
                              )}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* Privileges */}
                    {req.privileges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold mb-2">Привілеї:</h4>
                        <div className="flex flex-wrap gap-1">
                          {req.privileges.map((privilege) => (
                            <span
                              key={privilege}
                              className="text-xs bg-bronze/10 text-bronze px-2 py-0.5 border border-bronze/30"
                            >
                              {PRIVILEGE_LABELS[privilege as keyof typeof PRIVILEGE_LABELS] || privilege}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Advancements */}
        {recentAdvancements.length > 0 && (
          <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <h2 className="font-syne text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Останні підвищення
            </h2>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentAdvancements.slice(0, 20).map((adv) => (
                <div
                  key={adv.id}
                  className="p-3 border border-line/20 flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <div className="flex-1">
                    <span className="font-medium">
                      {adv.user?.firstName} {adv.user?.lastName}
                    </span>
                    <span className="text-muted-500 mx-2">•</span>
                    <span className="text-sm text-muted-500">
                      {formatDate(adv.advancedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge membershipRole={adv.fromRole} size="sm" showLabel={false} />
                    <span className="text-muted-500">→</span>
                    <RoleBadge membershipRole={adv.toRole} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="border border-line rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-syne text-2xl">Відхилити запит</DialogTitle>
            <DialogDescription className="text-muted-500">
              Вкажіть причину відхилення запиту на підвищення.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <p className="mb-2">
                <strong>Користувач:</strong>{' '}
                {selectedRequest.user.firstName} {selectedRequest.user.lastName}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <RoleBadge membershipRole={selectedRequest.currentRole} size="sm" />
                <span className="text-muted-500">→</span>
                <RoleBadge membershipRole={selectedRequest.requestedRole} size="sm" />
              </div>

              <label className="block text-sm font-medium mb-2">
                Причина відхилення (необов&apos;язково):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-line rounded-lg p-3 bg-panel-900 text-sm min-h-[100px]"
                placeholder="Вкажіть причину..."
              />
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowRejectDialog(false)}
              className="btn btn-outline"
              disabled={processingRequest !== null}
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleRejectRequest}
              disabled={processingRequest !== null}
              className="btn bg-red-600 text-canvas hover:bg-red-700 border-red-600"
            >
              {processingRequest !== null ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Відхилення...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Відхилити
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
