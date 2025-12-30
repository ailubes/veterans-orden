'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMessenger } from './messenger-provider';
import { createClient } from '@/lib/supabase/client';
import { Search, Loader2, User, Users, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getInitials } from '@/lib/messaging/utils';
import { DefaultAvatar } from '@/components/ui/default-avatar';
import type { UserSex } from '@/types/messaging';

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  sex?: UserSex;
  membershipRole: string;
}

type ConversationType = 'dm' | 'group';

export function NewConversation() {
  const { openDM, backToList } = useMessenger();

  const [type, setType] = useState<ConversationType>('dm');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchResult[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const getToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }, []);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const searchUsers = async () => {
      setSearching(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.users || []);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Search error:', err);
        }
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, getToken]);

  // Handle user selection
  const toggleUser = (user: SearchResult) => {
    if (type === 'dm') {
      // For DM, directly open conversation
      handleOpenDM(user.id);
    } else {
      // For group, toggle selection
      setSelectedUsers((prev) => {
        const exists = prev.find((u) => u.id === user.id);
        if (exists) {
          return prev.filter((u) => u.id !== user.id);
        }
        return [...prev, user];
      });
    }
  };

  // Open DM
  const handleOpenDM = async (userId: string) => {
    setCreating(true);
    await openDM(userId);
    setCreating(false);
  };

  // Create group
  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2 || !groupName.trim()) return;

    setCreating(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'group',
          name: groupName.trim(),
          participantIds: selectedUsers.map((u) => u.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Would need to add openConversation to context
        backToList();
      }
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-3">
      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setType('dm');
            setSelectedUsers([]);
          }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 border-2 rounded transition-colors',
            type === 'dm'
              ? 'border-timber-dark bg-timber-dark text-canvas'
              : 'border-timber-dark/30 hover:border-timber-dark'
          )}
        >
          <User className="w-4 h-4" />
          Особисте
        </button>
        <button
          onClick={() => setType('group')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 border-2 rounded transition-colors',
            type === 'group'
              ? 'border-timber-dark bg-timber-dark text-canvas'
              : 'border-timber-dark/30 hover:border-timber-dark'
          )}
        >
          <Users className="w-4 h-4" />
          Група
        </button>
      </div>

      {/* Group name input */}
      {type === 'group' && (
        <div className="mb-3">
          <Label htmlFor="group-name" className="text-sm">
            Назва групи
          </Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Введіть назву групи..."
            className="mt-1"
          />
        </div>
      )}

      {/* Selected users for group */}
      {type === 'group' && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-timber-dark/20">
          {selectedUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUser(user)}
              className="flex items-center gap-1 bg-timber-light px-2 py-1 rounded-full text-sm"
            >
              {user.firstName} {user.lastName}
              <span className="text-timber-beam hover:text-timber-dark">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук користувачів..."
          className="pl-9"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searching ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-timber-beam" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-timber-beam text-sm py-8">
            {searchQuery
              ? 'Нікого не знайдено'
              : 'Введіть ім\'я для пошуку'}
          </div>
        ) : (
          <ul className="space-y-1">
            {results.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <li key={user.id}>
                  <button
                    onClick={() => toggleUser(user)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded hover:bg-timber-light/50 transition-colors',
                      isSelected && 'bg-timber-light'
                    )}
                    disabled={creating}
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar
                        sex={user.sex}
                        size="sm"
                        fallbackInitials={getInitials(user.firstName, user.lastName)}
                      />
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    {type === 'group' && isSelected && (
                      <Check className="w-5 h-5 text-accent" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create group button */}
      {type === 'group' && selectedUsers.length >= 2 && (
        <div className="pt-3 border-t border-timber-dark/20">
          <button
            onClick={handleCreateGroup}
            disabled={creating || !groupName.trim()}
            className="w-full btn flex items-center justify-center gap-2"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Users className="w-4 h-4" />
                Створити групу ({selectedUsers.length} учасників)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
