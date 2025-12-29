'use client';

interface TypingIndicatorProps {
  userIds: string[];
}

export function TypingIndicator({ userIds }: TypingIndicatorProps) {
  if (userIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-timber-beam">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-timber-beam rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-timber-beam rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-timber-beam rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {userIds.length === 1 ? 'Друкує...' : 'Друкують...'}
      </span>
    </div>
  );
}
