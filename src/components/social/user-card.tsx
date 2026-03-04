'use client';

import Link from 'next/link';
import { MapPin, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';

interface UserCardProps {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
    military_unit?: string;
    position?: string;
    member_identity?: 'veteran' | 'volunteer' | 'supporter';
    city?: string;
    profession?: string;
    bio?: string;
    is_following?: boolean;
  };
  showFollowButton?: boolean;
}

export function UserCard({ user, showFollowButton = true }: UserCardProps) {
  const identityLabel: Record<'veteran' | 'volunteer' | 'supporter', string> = {
    veteran: 'Ветеран',
    volunteer: 'Волонтер',
    supporter: 'Прихильник',
  };

  return (
    <div className="bg-card rounded-lg border p-4 flex items-start gap-4">
      <Link href={`/profile/${user.id}`}>
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="text-lg">
            {user.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.id}`}>
          <h3 className="font-semibold truncate">{user.display_name}</h3>
        </Link>
        {user.member_identity && (
          <p className="text-xs text-muted-foreground mt-1">{identityLabel[user.member_identity]}</p>
        )}

        {(user.position || user.military_unit) && (
          <p className="text-sm text-muted-foreground truncate">
            {user.position}
            {user.position && user.military_unit && ' • '}
            {user.military_unit}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {user.city && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {user.city}
            </span>
          )}
          {user.profession && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {user.profession}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      {showFollowButton && (
        <FollowButton
          userId={user.id}
          isFollowing={user.is_following || false}
          variant="outline"
          size="sm"
        />
      )}
    </div>
  );
}
