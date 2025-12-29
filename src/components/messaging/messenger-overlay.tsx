'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMessenger } from './messenger-provider';
import { ConversationList } from './conversation-list';
import { ConversationView } from './conversation-view';
import { NewConversation } from './new-conversation';
import {
  X,
  MessageCircle,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessengerOverlay() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isOpen,
    activeView,
    currentConversation,
    totalUnread,
    closeMessenger,
    backToList,
    openNewConversation,
  } = useMessenger();

  if (!isOpen) return null;

  // Facebook-style layout: compact panel or expanded view
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - only when expanded */}
      {isExpanded && (
        <div
          className="absolute inset-0 bg-timber-dark/40 backdrop-blur-sm pointer-events-auto"
          onClick={closeMessenger}
        />
      )}

      {/* Messenger Panel */}
      <div
        className={cn(
          'absolute pointer-events-auto bg-canvas border-2 border-timber-dark shadow-2xl flex flex-col overflow-hidden transition-all duration-300',
          // Mobile: full screen
          'inset-0 sm:inset-auto',
          // Desktop: bottom right corner
          isExpanded
            ? 'sm:right-4 sm:bottom-4 sm:w-[800px] sm:h-[600px] sm:max-w-[calc(100vw-32px)] sm:max-h-[calc(100vh-32px)]'
            : 'sm:right-4 sm:bottom-4 sm:w-[380px] sm:h-[520px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b-2 border-timber-dark bg-timber-dark text-canvas shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {activeView !== 'list' && (
              <button
                onClick={backToList}
                className="p-1.5 hover:bg-canvas/10 rounded transition-colors shrink-0"
                aria-label="Назад"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <MessageCircle className="w-4 h-4 shrink-0" />
            <h2 className="font-syne font-bold text-sm truncate">
              {activeView === 'list' && 'Повідомлення'}
              {activeView === 'conversation' && (
                currentConversation?.otherParticipant
                  ? `${currentConversation.otherParticipant.firstName} ${currentConversation.otherParticipant.lastName}`
                  : currentConversation?.name || 'Розмова'
              )}
              {activeView === 'new' && 'Нова розмова'}
            </h2>
            {activeView === 'list' && totalUnread > 0 && (
              <span className="bg-accent text-canvas text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* New Message */}
            {activeView === 'list' && (
              <button
                onClick={openNewConversation}
                className="p-1.5 hover:bg-canvas/10 rounded transition-colors"
                aria-label="Нове повідомлення"
                title="Нова розмова"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {/* Open Full Page */}
            <Link
              href="/dashboard/messages"
              onClick={closeMessenger}
              className="p-1.5 hover:bg-canvas/10 rounded transition-colors hidden sm:block"
              aria-label="Відкрити у новому вікні"
              title="Відкрити повністю"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {/* Expand/Collapse (desktop only) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-canvas/10 rounded transition-colors hidden sm:block"
              aria-label={isExpanded ? 'Згорнути' : 'Розгорнути'}
              title={isExpanded ? 'Згорнути' : 'Розгорнути'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={closeMessenger}
              className="p-1.5 hover:bg-canvas/10 rounded transition-colors"
              aria-label="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Facebook-style split view when expanded */}
        <div className="flex-1 flex overflow-hidden">
          {isExpanded ? (
            // Expanded: Split view (list on left, conversation on right)
            <>
              {/* Conversation List Sidebar */}
              <div className="w-[280px] border-r-2 border-timber-dark/20 flex flex-col shrink-0">
                <ConversationList compact />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeView === 'list' && (
                  <div className="flex-1 flex items-center justify-center text-timber-beam">
                    <div className="text-center p-6">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Виберіть розмову або почніть нову</p>
                    </div>
                  </div>
                )}
                {activeView === 'conversation' && <ConversationView />}
                {activeView === 'new' && <NewConversation />}
              </div>
            </>
          ) : (
            // Compact: Single view
            <div className="flex-1 overflow-hidden">
              {activeView === 'list' && <ConversationList />}
              {activeView === 'conversation' && <ConversationView />}
              {activeView === 'new' && <NewConversation />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
