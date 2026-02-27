'use client';

import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (following: boolean) => void;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'lg' | 'default';
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  variant = 'primary',
  size = 'sm',
}: FollowButtonProps) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update follow status');

      const newStatus = !isFollowing;
      setIsFollowing(newStatus);
      onFollowChange?.(newStatus);

      toast({
        title: newStatus ? 'Ви підписалися' : 'Ви відписалися',
        description: newStatus
          ? 'Тепер ви бачитимете дописи цього користувача у своїй стрічці'
          : 'Ви більше не бачитимете дописи цього користувача',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити підписку',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Підписані
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Підписатися
        </>
      )}
    </Button>
  );
}
