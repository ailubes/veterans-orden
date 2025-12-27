'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BulkActionsToolbar, commonBulkActions } from './bulk-actions-toolbar';
import { toast } from '@/hooks/use-toast';
import { exportMembersData } from '@/lib/export-utils';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  status: string;
  membership_tier: string;
  points: number;
  oblast: {
    name: string;
  } | null;
}

interface MembersTableProps {
  members: Member[];
  canSuspend: boolean;
  canDelete: boolean;
  showExportButtons?: boolean;
}

export function MembersTable({ members, canSuspend, canDelete, showExportButtons = true }: MembersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk action handlers
  const handleBulkExport = async () => {
    try {
      const response = await fetch('/api/admin/members/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        throw new Error('Failed to export members');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      clearSelection();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const handleBulkActivate = async () => {
    try {
      const response = await fetch('/api/admin/members/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: Array.from(selectedIds),
          status: 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to activate members');
      }

      toast({
        title: 'Членів активовано',
        description: `Успішно активовано ${selectedIds.size} членів`,
      });

      clearSelection();
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Activate error:', error);
      throw error;
    }
  };

  const handleBulkSuspend = async () => {
    if (!confirm(`Ви впевнені, що хочете призупинити ${selectedIds.size} членів?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/members/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: Array.from(selectedIds),
          status: 'suspended',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suspend members');
      }

      toast({
        title: 'Членів призупинено',
        description: `Успішно призупинено ${selectedIds.size} членів`,
      });

      clearSelection();
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Suspend error:', error);
      throw error;
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`УВАГА: Ви впевнені, що хочете видалити ${selectedIds.size} членів? Цю дію не можна скасувати!`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/members/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete members');
      }

      toast({
        title: 'Членів видалено',
        description: `Успішно видалено ${selectedIds.size} членів`,
      });

      clearSelection();
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  // Build actions array based on permissions
  const bulkActions = [
    commonBulkActions.export(handleBulkExport),
    commonBulkActions.activate(handleBulkActivate),
  ];

  if (canSuspend) {
    bulkActions.push(commonBulkActions.suspend(handleBulkSuspend));
  }

  if (canDelete) {
    bulkActions.push(commonBulkActions.delete(handleBulkDelete));
  }

  const handleExportExcel = () => {
    const dataToExport = selectedIds.size > 0
      ? members.filter(m => selectedIds.has(m.id))
      : members;

    exportMembersData(dataToExport, 'excel');

    toast({
      title: 'Експортовано',
      description: `${dataToExport.length} членів експортовано в Excel`,
    });
  };

  const handleExportPDF = () => {
    const dataToExport = selectedIds.size > 0
      ? members.filter(m => selectedIds.has(m.id))
      : members;

    exportMembersData(dataToExport, 'pdf');

    toast({
      title: 'Експортовано',
      description: `${dataToExport.length} членів експортовано в PDF`,
    });
  };

  if (members.length === 0) {
    return (
      <div className="bg-canvas border-2 border-timber-dark relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />
        <div className="text-center py-16 text-timber-beam">
          <p className="text-sm">Поки що немає членів</p>
        </div>
      </div>
    );
  }

  const allSelected = selectedIds.size === members.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < members.length;

  return (
    <>
      {/* Export Buttons */}
      {showExportButtons && (
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-4">
          <button
            onClick={handleExportExcel}
            className="btn btn-outline btn-sm flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Експорт Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn btn-outline btn-sm flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Експорт PDF
          </button>
        </div>
      )}

      <div className="bg-canvas border-2 border-timber-dark relative overflow-hidden">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-timber-dark bg-timber-dark/5">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={toggleSelectAll}
              className="w-5 h-5 border-2 border-timber-dark cursor-pointer accent-accent"
              title={allSelected ? 'Скасувати всі' : 'Обрати всі'}
            />
          </div>
          <div className="col-span-3 label">ЧЛЕН</div>
          <div className="col-span-2 label">РОЛЬ</div>
          <div className="col-span-1 label">СТАТУС</div>
          <div className="col-span-2 label">ПЛАН</div>
          <div className="col-span-1 label">БАЛИ</div>
          <div className="col-span-2 label text-right">ДІЇ</div>
        </div>

        {/* Table Rows */}
        {members.map((member) => {
          const isSelected = selectedIds.has(member.id);

          return (
            <div
              key={member.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-timber-dark/20 transition-colors ${
                isSelected ? 'bg-accent/10' : 'hover:bg-timber-dark/5'
              }`}
            >
              {/* Checkbox - show on mobile too */}
              <div className="md:col-span-1 flex items-start md:items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(member.id)}
                  className="w-5 h-5 border-2 border-timber-dark cursor-pointer accent-accent mr-3 md:mr-0 mt-1 md:mt-0"
                />
                {/* Mobile: inline member info after checkbox */}
                <div className="md:hidden flex-1">
                  <div className="font-bold">
                    {member.first_name} {member.last_name}
                  </div>
                  <div className="text-xs text-timber-beam">{member.email}</div>
                </div>
              </div>

              {/* Member info - desktop only */}
              <div className="hidden md:block md:col-span-3">
                <div className="font-bold">
                  {member.first_name} {member.last_name}
                </div>
                <div className="text-xs text-timber-beam">{member.email}</div>
                {member.oblast && (
                  <div className="text-xs text-timber-beam mt-1">
                    {member.oblast.name}
                  </div>
                )}
              </div>

              {/* Mobile: Status badges + Actions row */}
              <div className="md:hidden flex flex-wrap items-center gap-2 pl-8">
                <span className="px-2 py-1 bg-timber-dark/10 text-xs font-bold">
                  {member.role === 'super_admin' && 'Супер-адмін'}
                  {member.role === 'admin' && 'Адмін'}
                  {member.role === 'regional_leader' && 'Рег. лідер'}
                  {member.role === 'group_leader' && 'Лідер групи'}
                  {member.role === 'full_member' && 'Повноцінний'}
                  {member.role === 'silent_member' && 'Мовчазний'}
                  {member.role === 'prospect' && 'Потенційний'}
                  {member.role === 'free_viewer' && 'Спостерігач'}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-bold ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : member.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : member.status === 'suspended'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.status === 'active' && 'Активний'}
                  {member.status === 'pending' && 'Перевірка'}
                  {member.status === 'suspended' && 'Блок'}
                  {member.status === 'churned' && 'Відійшов'}
                </span>
                <span className="font-bold text-accent text-sm">
                  {member.points || 0} балів
                </span>
                <Link
                  href={`/admin/members/${member.id}`}
                  className="ml-auto text-xs text-accent hover:underline font-bold"
                >
                  ПЕРЕГЛЯНУТИ →
                </Link>
              </div>

              {/* Role - desktop only */}
              <div className="hidden md:block md:col-span-2">
                <span className="px-2 py-1 bg-timber-dark/10 text-xs font-bold">
                  {member.role === 'super_admin' && 'Супер-адмін'}
                  {member.role === 'admin' && 'Адмін'}
                  {member.role === 'regional_leader' && 'Рег. лідер'}
                  {member.role === 'group_leader' && 'Лідер групи'}
                  {member.role === 'full_member' && 'Повноцінний'}
                  {member.role === 'silent_member' && 'Мовчазний'}
                  {member.role === 'prospect' && 'Потенційний'}
                  {member.role === 'free_viewer' && 'Спостерігач'}
                </span>
              </div>

              {/* Status - desktop only */}
              <div className="hidden md:block md:col-span-1">
                <span
                  className={`px-2 py-1 text-xs font-bold ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : member.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : member.status === 'suspended'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.status === 'active' && 'Активний'}
                  {member.status === 'pending' && 'Перевірка'}
                  {member.status === 'suspended' && 'Блок'}
                  {member.status === 'churned' && 'Відійшов'}
                </span>
              </div>

              {/* Tier - desktop only */}
              <div className="hidden md:block md:col-span-2">
                <span className="text-sm">
                  {member.membership_tier === 'patron_500' && 'Патрон'}
                  {member.membership_tier === 'supporter_200' &&
                    'Прихильник 200'}
                  {member.membership_tier === 'supporter_100' &&
                    'Прихильник 100'}
                  {member.membership_tier === 'basic_49' && 'Базовий'}
                  {member.membership_tier === 'free' && 'Безкоштовний'}
                </span>
              </div>

              {/* Points - desktop only */}
              <div className="hidden md:block md:col-span-1">
                <span className="font-bold text-accent">
                  {member.points || 0}
                </span>
              </div>

              {/* Actions - desktop only */}
              <div className="hidden md:block md:col-span-2 text-right">
                <Link
                  href={`/admin/members/${member.id}`}
                  className="text-xs text-accent hover:underline font-bold"
                >
                  ПЕРЕГЛЯНУТИ →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        totalCount={members.length}
        onClear={clearSelection}
        actions={bulkActions}
      />
    </>
  );
}
