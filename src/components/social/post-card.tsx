'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, MoreHorizontal, Briefcase, MapPin, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    content_type: string;
    media_urls?: string[];
    created_at: string;
    is_edited?: boolean;
    visibility: string;
    link_preview?: {
      kind?: string;
      job_id?: string;
      title?: string;
      company_name?: string;
      location?: string;
      application_url?: string;
      salary_min?: number | null;
      salary_max?: number | null;
    } | null;
    author: {
      id: string;
      display_name: string;
      avatar_url?: string;
      military_unit?: string;
      position?: string;
    };
    likes_count: number;
    comments_count: number;
    user_liked?: boolean;
    user_reaction?: string | null;
  };
  onLike?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
  canFollow?: boolean;
  isFollowingAuthor?: boolean;
  onToggleFollow?: () => Promise<void> | void;
}

export function PostCard({
  post,
  onLike,
  onDelete,
  isOwner,
  canFollow = false,
  isFollowingAuthor = false,
  onToggleFollow,
}: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowUpdating, setIsFollowUpdating] = useState(false);
  const isJobPost = post.link_preview?.kind === 'job';

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: uk,
  });

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await onLike?.();
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!onToggleFollow || isFollowUpdating) return;
    setIsFollowUpdating(true);
    try {
      await onToggleFollow();
    } finally {
      setIsFollowUpdating(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar_url} />
            <AvatarFallback>{post.author.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.author.display_name}</p>
            {(post.author.position || post.author.military_unit) && (
              <p className="text-xs text-muted-foreground">
                {post.author.position}
                {post.author.position && post.author.military_unit && ' • '}
                {post.author.military_unit}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {canFollow && (
            <Button
              size="sm"
              variant={isFollowingAuthor ? 'outline' : 'primary'}
              onClick={handleFollow}
              disabled={isFollowUpdating}
              className="h-8 text-xs"
            >
              {isFollowUpdating ? '...' : isFollowingAuthor ? 'Підписка' : 'Підписатись'}
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {timeAgo}
            {post.is_edited && ' (ред.)'}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Видалити
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Поскаржитися</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`}>
        {isJobPost && (
          <div className="mb-3 rounded-md border bg-blue-500/5 border-blue-500/20 p-3 space-y-2">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500">
              <Briefcase className="h-3.5 w-3.5" />
              ВАКАНСІЯ
            </div>
            <p className="font-semibold text-sm">
              {post.link_preview?.title || 'Нова вакансія'}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {post.link_preview?.company_name ? (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {post.link_preview.company_name}
                </span>
              ) : null}
              {post.link_preview?.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {post.link_preview.location}
                </span>
              ) : null}
            </div>
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {post.media_urls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-video bg-muted rounded-md overflow-hidden"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${post.user_liked ? 'text-primary' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart
            className="h-4 w-4"
            fill={post.user_liked ? 'currentColor' : 'none'}
          />
          <span className="text-xs">
            {post.likes_count > 0 ? post.likes_count : 'Подобається'}
          </span>
        </Button>

        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={`/post/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">
              {post.comments_count > 0 ? post.comments_count : 'Коментарі'}
            </span>
          </Link>
        </Button>

        <Button variant="outline" size="sm" className="gap-2 ml-auto">
          <Share2 className="h-4 w-4" />
        </Button>

        {isJobPost && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/jobs">Робота</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
