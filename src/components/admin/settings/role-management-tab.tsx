'use client';

import { useState, useEffect } from 'react';
import { AdminProfile } from '@/lib/permissions';
import { UserRole, getAssignableRoles } from '@/lib/permissions-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Loader2, Shield, UserCog, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoleManagementTabProps {
  adminProfile: AdminProfile;
}

interface ElevatedUser {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  oblast: { name: string } | null;
  referral_count: number;
}

export default function RoleManagementTab({
  adminProfile,
}: RoleManagementTabProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ElevatedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ElevatedUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const assignableRoles = getAssignableRoles(adminProfile.staff_role || 'none');

  useEffect(() => {
    fetchElevatedUsers();
  }, []);

  async function fetchElevatedUsers() {
    try {
      const response = await fetch('/api/admin/settings/roles');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завантажити користувачів',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleRoleChange(user: ElevatedUser, role: UserRole) {
    setSelectedUser(user);
    setNewRole(role);
    setShowDialog(true);
  }

  async function confirmRoleChange() {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/settings/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      toast({
        title: 'Роль оновлено',
        description: `${selectedUser.first_name} ${selectedUser.last_name} тепер має роль: ${getRoleLabel(newRole)}`,
      });

      // Refresh users list
      await fetchElevatedUsers();
      setShowDialog(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Не вдалося оновити роль',
      });
    } finally {
      setUpdating(false);
    }
  }

  function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      free_viewer: 'Безкоштовний глядач',
      prospect: 'Потенційний член',
      silent_member: 'Тихий член',
      full_member: 'Повноправний член',
      group_leader: 'Лідер групи',
      regional_leader: 'Регіональний лідер',
      admin: 'Адміністратор',
      super_admin: 'Супер адміністратор',
    };
    return labels[role];
  }

  function getRoleBadgeColor(role: UserRole): string {
    if (role === 'super_admin') return 'bg-bronze text-canvas';
    if (role === 'admin') return 'bg-panel-850 text-canvas';
    if (role === 'regional_leader') return 'bg-bronze text-canvas';
    return 'bg-panel-900 text-text-100 border border-line rounded-lg';
  }

  if (loading) {
    return (
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
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
      <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
        {/* Joints */}
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="mb-6">
          <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Управління ролями</h2>
          <p className="text-muted-500 text-sm">
            Користувачі з підвищеними привілеями та їх ролі
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="border border-line rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-500 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Адміністратори</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length}
            </p>
          </div>

          <div className="border border-line rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-500 mb-1">
              <UserCog className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Регіональні лідери</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'regional_leader').length}
            </p>
          </div>

          <div className="border border-line rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Лідери груп</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'group_leader').length}
            </p>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {users.length === 0 ? (
            <div className="text-center text-muted-500 py-8 border border-line rounded-lg">
              Немає користувачів з підвищеними ролями
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="border border-line rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{user.first_name} {user.last_name}</h3>
                    <p className="text-xs text-muted-500 truncate">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded flex-shrink-0 ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-500 mb-3">
                  {user.oblast?.name && (
                    <span className="px-2 py-1 bg-panel-850/10">{user.oblast.name}</span>
                  )}
                  <span>Рефералів: {user.referral_count || 0}</span>
                </div>
                {assignableRoles.length > 0 && (
                  <div className="pt-3 border-t border-line/10">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                    >
                      <SelectTrigger className="w-full">
                        <span>Змінити роль</span>
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleLabel(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block border border-line rounded-lg overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b-2 border-line hover:bg-transparent">
                <TableHead className="font-syne font-bold">Ім&apos;я</TableHead>
                <TableHead className="font-syne font-bold">Email</TableHead>
                <TableHead className="font-syne font-bold">Область</TableHead>
                <TableHead className="font-syne font-bold">Реферали</TableHead>
                <TableHead className="font-syne font-bold">Роль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-500 py-8">
                    Немає користувачів з підвищеними ролями
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-b border-bronze/30">
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-500">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.oblast?.name || '-'}</TableCell>
                    <TableCell className="text-sm">{user.referral_count || 0}</TableCell>
                    <TableCell>
                      {assignableRoles.length > 0 ? (
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {assignableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border border-line rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-syne text-2xl">Підтвердити зміну ролі</DialogTitle>
            <DialogDescription className="text-muted-500">
              Ви впевнені, що хочете змінити роль користувача?
            </DialogDescription>
          </DialogHeader>

          {selectedUser && newRole && (
            <div className="py-4">
              <p className="mb-2">
                <strong>Користувач:</strong> {selectedUser.first_name} {selectedUser.last_name}
              </p>
              <p className="mb-2">
                <strong>Поточна роль:</strong> {getRoleLabel(selectedUser.role)}
              </p>
              <p className="mb-2">
                <strong>Нова роль:</strong> {getRoleLabel(newRole)}
              </p>

              <div className="mt-4 p-4 border-2 border-bronze bg-panel-900/50">
                <p className="text-sm text-bronze">
                  ⚠️ Зміна ролі вплине на права доступу користувача
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="btn btn-outline"
              disabled={updating}
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={confirmRoleChange}
              disabled={updating}
              className="btn"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Оновлення...
                </>
              ) : (
                'Підтвердити'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
