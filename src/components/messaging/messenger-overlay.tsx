'use client';

import { useMessenger } from './messenger-provider';
import { ConversationList } from './conversation-list';
import { ConversationView } from './conversation-view';
import { NewConversation } from './new-conversation';
import { X, MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessengerOverlay() {
  const {
    isOpen,
    activeView,
    currentConversation,
    totalUnread,
    closeMessenger,
    backToList,
  } = useMessenger();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-timber-dark/30 backdrop-blur-sm"
        onClick={closeMessenger}
      />

      {/* Messenger Panel */}
      <div
        className={cn(
          'relative w-full sm:w-[420px] h-[600px] max-h-[calc(100vh-48px)]',
          'bg-canvas border-2 border-timber-dark shadow-xl',
          'flex flex-col overflow-hidden',
          'animate-in slide-in-from-bottom-4 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-timber-dark bg-timber-light">
          <div className="flex items-center gap-2">
            {activeView !== 'list' && (
              <button
                onClick={backToList}
                className="p-1 hover:bg-timber-dark/10 rounded transition-colors"
                aria-label="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-syne font-bold text-lg">
              {activeView === 'list' && 'Повідомлення'}
              {activeView === 'conversation' && (
                currentConversation?.otherParticipant
                  ? `${currentConversation.otherParticipant.firstName} ${currentConversation.otherParticipant.lastName}`
                  : currentConversation?.name || 'Розмова'
              )}
              {activeView === 'new' && 'Нова розмова'}
            </h2>
            {activeView === 'list' && totalUnread > 0 && (
              <span className="bg-accent text-canvas text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={closeMessenger}
            className="p-1 hover:bg-timber-dark/10 rounded transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'list' && <ConversationList />}
          {activeView === 'conversation' && <ConversationView />}
          {activeView === 'new' && <NewConversation />}
        </div>
      </div>
    </div>
  );
}
