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
  clerk_id: string;
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

  const assignableRoles = getAssignableRoles(adminProfile.role);

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
    if (role === 'super_admin') return 'bg-accent text-canvas';
    if (role === 'admin') return 'bg-timber-dark text-canvas';
    if (role === 'regional_leader') return 'bg-timber-beam text-canvas';
    return 'bg-canvas text-timber-dark border-2 border-timber-dark';
  }

  if (loading) {
    return (
      <div className="border-2 border-timber-dark p-8 bg-canvas relative flex items-center justify-center min-h-[400px]">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <>
      <div className="border-2 border-timber-dark p-4 sm:p-8 bg-canvas relative">
        {/* Joints */}
        <div className="joint hidden sm:block" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint hidden sm:block" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint hidden sm:block" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint hidden sm:block" style={{ bottom: '-6px', right: '-6px' }} />

        <div className="mb-6">
          <h2 className="font-syne text-xl sm:text-2xl font-bold mb-2">Управління ролями</h2>
          <p className="text-timber-beam text-sm">
            Користувачі з підвищеними привілеями та їх ролі
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="border-2 border-timber-dark p-4">
            <div className="flex items-center gap-2 text-timber-beam mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Адміністратори</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length}
            </p>
          </div>

          <div className="border-2 border-timber-dark p-4">
            <div className="flex items-center gap-2 text-timber-beam mb-1">
              <UserCog className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Регіональні лідери</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'regional_leader').length}
            </p>
          </div>

          <div className="border-2 border-timber-dark p-4">
            <div className="flex items-center gap-2 text-timber-beam mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Лідери груп</span>
            </div>
            <p className="font-syne text-2xl font-bold">
              {users.filter((u) => u.role === 'group_leader').length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="border-2 border-timber-dark overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b-2 border-timber-dark hover:bg-transparent">
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
                  <TableCell colSpan={5} className="text-center text-timber-beam py-8">
                    Немає користувачів з підвищеними ролями
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-b border-timber-beam/30">
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-timber-beam">{user.email}</TableCell>
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
        <DialogContent className="border-2 border-timber-dark">
          <DialogHeader>
            <DialogTitle className="font-syne text-2xl">Підтвердити зміну ролі</DialogTitle>
            <DialogDescription className="text-timber-beam">
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

              <div className="mt-4 p-4 border-2 border-accent bg-canvas/50">
                <p className="text-sm text-accent">
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
