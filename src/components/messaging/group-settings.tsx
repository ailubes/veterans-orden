'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  UserPlus,
  UserMinus,
  LogOut,
  Crown,
  Shield,
  User,
  MoreVertical,
  Loader2,
  Camera,
  Pencil,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessenger } from './messenger-provider';
import type { Conversation, ConversationParticipant, ParticipantRole } from '@/types/messaging';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getInitials, formatParticipantCount } from '@/lib/messaging/utils';
import { AddParticipantsModal } from './add-participants-modal';
import { DefaultAvatar } from '@/components/ui/default-avatar';

interface GroupSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export function GroupSettings({
  isOpen,
  onClose,
  conversation,
}: GroupSettingsProps) {
  const { refreshConversations, backToList } = useMessenger();
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<ParticipantRole>('member');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Add participants modal state
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);

  // Fetch participants when dialog opens
  useEffect(() => {
    if (isOpen && conversation) {
      fetchParticipants();
      setEditName(conversation.name || '');
      setEditDescription(conversation.description || '');
    }
  }, [isOpen, conversation?.id]);

  const fetchParticipants = async () => {
    if (!conversation) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/messaging/conversations/${conversation.id}/participants`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);

        // Find current user's role
        const currentUser = data.participants?.find((p: ConversationParticipant) => {
          // We need to identify the current user - this will be handled when we have the user ID
          return true; // Will be updated below
        });

        // Get current user ID
        const userRes = await fetch('/api/user/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.id);

          const userParticipant = data.participants?.find(
            (p: ConversationParticipant) => p.userId === userData.id
          );
          if (userParticipant) {
            setCurrentUserRole(userParticipant.role);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!conversation) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/messaging/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        refreshConversations();
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantUserId: string) => {
    if (!conversation || !window.confirm('Ви впевнені, що хочете видалити цього учасника?')) return;

    try {
      const res = await fetch(`/api/messaging/conversations/${conversation.id}/participants/${participantUserId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setParticipants((prev) => prev.filter((p) => p.userId !== participantUserId));
        refreshConversations();
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleChangeRole = async (participantUserId: string, newRole: ParticipantRole) => {
    if (!conversation) return;

    try {
      const res = await fetch(`/api/messaging/conversations/${conversation.id}/participants/${participantUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === participantUserId ? { ...p, role: newRole } : p
          )
        );
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!conversation || !window.confirm('Ви впевнені, що хочете покинути групу?')) return;

    try {
      const res = await fetch(`/api/messaging/conversations/${conversation.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onClose();
        backToList();
        refreshConversations();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleParticipantsAdded = () => {
    fetchParticipants();
    refreshConversations();
  };

  const getRoleIcon = (role: ParticipantRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-bronze" />;
      default:
        return <User className="w-4 h-4 text-muted-500" />;
    }
  };

  const getRoleLabel = (role: ParticipantRole) => {
    switch (role) {
      case 'owner':
        return 'Власник';
      case 'admin':
        return 'Адмін';
      default:
        return 'Учасник';
    }
  };

  const canManageParticipants = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canEditGroup = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canChangeRoles = currentUserRole === 'owner';

  if (!conversation || conversation.type !== 'group') {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Налаштування групи
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Group Info Section */}
            <div className="flex items-start gap-4 p-3 bg-timber-light/30 rounded-lg">
              {/* Group Avatar */}
              <div className="relative flex-shrink-0">
                {conversation.avatarUrl ? (
                  <Image
                    src={conversation.avatarUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-timber-light flex items-center justify-center text-xl font-bold text-timber-dark">
                    {conversation.name?.charAt(0).toUpperCase() || 'Г'}
                  </div>
                )}
                {canEditGroup && (
                  <button
                    className="absolute -bottom-1 -right-1 p-1.5 bg-bronze rounded-full text-canvas hover:bg-bronze/90 transition-colors"
                    onClick={() => {
                      // TODO: Implement avatar upload
                      alert('Завантаження аватара буде доступне незабаром');
                    }}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Group Name & Description */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Назва групи"
                      className="w-full px-3 py-1.5 border border-line/20 rounded text-sm focus:outline-none focus:border-line"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Опис групи (необов'язково)"
                      className="w-full px-3 py-1.5 border border-line/20 rounded text-sm focus:outline-none focus:border-line resize-none"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveChanges}
                        disabled={saving || !editName.trim()}
                        className="px-3 py-1 bg-bronze text-canvas rounded text-sm font-medium hover:bg-bronze/90 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Зберегти'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(conversation.name || '');
                          setEditDescription(conversation.description || '');
                        }}
                        className="px-3 py-1 text-sm text-muted-500 hover:text-timber-dark"
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg truncate">
                        {conversation.name || 'Група'}
                      </h3>
                      {canEditGroup && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-muted-500 hover:text-timber-dark"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {conversation.description && (
                      <p className="text-sm text-muted-500 mt-1">{conversation.description}</p>
                    )}
                    <p className="text-xs text-muted-500 mt-1">
                      {formatParticipantCount(conversation.participantCount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Participants Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Учасники</h4>
                {canManageParticipants && (
                  <button
                    onClick={() => setIsAddParticipantsOpen(true)}
                    className="flex items-center gap-1 text-sm text-bronze hover:text-bronze/80"
                  >
                    <UserPlus className="w-4 h-4" />
                    Додати
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-500" />
                </div>
              ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {participants.map((participant) => {
                    const { user } = participant;
                    const isCurrentUser = participant.userId === currentUserId;
                    const canManageThis = canManageParticipants && !isCurrentUser && participant.role !== 'owner';

                    return (
                      <div
                        key={participant.id}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg',
                          isCurrentUser && 'bg-bronze/10'
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

                        {/* Name & Role */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {user.firstName} {user.lastName}
                              {isCurrentUser && (
                                <span className="text-muted-500 ml-1">(ви)</span>
                              )}
                            </p>
                            {getRoleIcon(participant.role)}
                          </div>
                          <p className="text-xs text-muted-500">
                            {getRoleLabel(participant.role)}
                          </p>
                        </div>

                        {/* Actions Menu */}
                        {canManageThis && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-muted-500 hover:text-timber-dark rounded-lg hover:bg-timber-light/50">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {canChangeRoles && (
                                <>
                                  {participant.role === 'member' && (
                                    <DropdownMenuItem
                                      onClick={() => handleChangeRole(participant.userId, 'admin')}
                                    >
                                      <Shield className="w-4 h-4 mr-2 text-bronze" />
                                      Зробити адміном
                                    </DropdownMenuItem>
                                  )}
                                  {participant.role === 'admin' && (
                                    <DropdownMenuItem
                                      onClick={() => handleChangeRole(participant.userId, 'member')}
                                    >
                                      <User className="w-4 h-4 mr-2" />
                                      Зняти адміна
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRemoveParticipant(participant.userId)}
                                className="text-red-600"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Видалити з групи
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Leave Group Button */}
            <div className="pt-4 border-t border-line/10">
              <button
                onClick={handleLeaveGroup}
                className="flex items-center gap-2 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Покинути групу</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Participants Modal */}
      <AddParticipantsModal
        isOpen={isAddParticipantsOpen}
        onClose={() => setIsAddParticipantsOpen(false)}
        conversationId={conversation.id}
        existingParticipantIds={participants.map((p) => p.userId)}
        onParticipantsAdded={handleParticipantsAdded}
      />
    </>
  );
}
