'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus, Search, Check, Loader2, X } from 'lucide-react';
import type { MessagingUser } from '@/types/messaging';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getInitials } from '@/lib/messaging/utils';
import { DefaultAvatar } from '@/components/ui/default-avatar';
import type { UserSex } from '@/types/messaging';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  existingParticipantIds: string[];
  onParticipantsAdded: () => void;
}

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  sex?: UserSex;
  membershipRole: string;
}

export function AddParticipantsModal({
  isOpen,
  onClose,
  conversationId,
  existingParticipantIds,
  onParticipantsAdded,
}: AddParticipantsModalProps) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(new Set());
      setSearch('');
      setSearchResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchUsers(search);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [search]);

  const searchUsers = async (query: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/user/search?q=${encodeURIComponent(query)}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        // Filter out existing participants
        const filtered = (data.users || []).filter(
          (user: SearchUser) => !existingParticipantIds.includes(user.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleAddParticipants = async () => {
    if (selectedUsers.size === 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      });

      if (res.ok) {
        onParticipantsAdded();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка при додаванні учасників');
      }
    } catch (error) {
      console.error('Error adding participants:', error);
      alert('Помилка при додаванні учасників');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUsersDisplay = () => {
    return searchResults
      .filter((user) => selectedUsers.has(user.id))
      .concat(
        // Also include users that were selected but are no longer in search results
        Array.from(selectedUsers)
          .filter((id) => !searchResults.find((u) => u.id === id))
          .map((id) => ({
            id,
            firstName: '...',
            lastName: '',
            avatarUrl: null,
            membershipRole: '',
          }))
      );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Додати учасників
          </DialogTitle>
        </DialogHeader>

        {/* Selected users chips */}
        {selectedUsers.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {getSelectedUsersDisplay().map((user) => (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className="flex items-center gap-1.5 px-2 py-1 bg-accent/20 rounded-full text-sm hover:bg-accent/30 transition-colors"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <DefaultAvatar
                    sex={user.sex}
                    size="xs"
                    fallbackInitials={getInitials(user.firstName, user.lastName)}
                  />
                )}
                <span>
                  {user.firstName} {user.lastName}
                </span>
                <X className="w-3 h-3 text-timber-beam" />
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук користувачів..."
            className="w-full pl-9 pr-4 py-2 border border-timber-dark/20 rounded-lg text-sm focus:outline-none focus:border-timber-dark"
            autoFocus
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-timber-beam" />
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {search.trim().length < 2 ? (
            <p className="text-center text-sm text-timber-beam py-4">
              Введіть мінімум 2 символи для пошуку
            </p>
          ) : searchResults.length === 0 && !searching ? (
            <p className="text-center text-sm text-timber-beam py-4">
              Користувачів не знайдено
            </p>
          ) : (
            searchResults.map((user) => {
              const isSelected = selectedUsers.has(user.id);

              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
                    isSelected ? 'bg-accent/20' : 'hover:bg-timber-light/50'
                  )}
                >
                  {/* Avatar */}
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar
                      sex={user.sex}
                      size="md"
                      fallbackInitials={getInitials(user.firstName, user.lastName)}
                    />
                  )}

                  {/* Name */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-timber-beam capitalize">
                      {user.membershipRole?.replace('_', ' ') || 'Учасник'}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-accent border-accent text-canvas'
                        : 'border-timber-dark/30'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-timber-dark/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-timber-beam hover:text-timber-dark transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleAddParticipants}
            disabled={selectedUsers.size === 0 || loading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedUsers.size > 0 && !loading
                ? 'bg-accent text-canvas hover:bg-accent/90'
                : 'bg-timber-light text-timber-beam cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Додати
            {selectedUsers.size > 0 && ` (${selectedUsers.size})`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
