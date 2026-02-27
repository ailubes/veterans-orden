'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  created_at: string;
  is_edited?: boolean;
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
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_edited?: boolean;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count: number;
  user_liked?: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити допис',
        variant: 'destructive',
      });
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [params.id]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: post.user_liked ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update like');

      setPost({
        ...post,
        user_liked: !post.user_liked,
        likes_count: post.user_liked
          ? post.likes_count - 1
          : post.likes_count + 1,
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити вподобання',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (!response.ok) throw new Error('Failed to create comment');

      const data = await response.json();
      setComments([...comments, data.comment]);
      setCommentText('');
      setPost({
        ...post,
        comments_count: post.comments_count + 1,
      });

      toast({
        title: 'Успіх',
        description: 'Коментар додано',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося додати коментар',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const timeAgo = post
    ? formatDistanceToNow(new Date(post.created_at), {
        addSuffix: true,
        locale: uk,
      })
    : '';

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Допис не знайдено</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>

      {/* Post */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link
            href={`/profile/${post.author.id}`}
            className="flex items-center gap-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback>
                {post.author.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
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
          <span className="text-xs text-muted-foreground">
            {timeAgo}
            {post.is_edited && ' (ред.)'}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media_urls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-video bg-muted rounded-md overflow-hidden"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${post.user_liked ? 'text-primary' : ''}`}
            onClick={handleLike}
          >
            <Heart
              className="h-4 w-4"
              fill={post.user_liked ? 'currentColor' : 'none'}
            />
            <span className="text-xs">
              {post.likes_count > 0 ? post.likes_count : 'Подобається'}
            </span>
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">
              {post.comments_count > 0 ? post.comments_count : 'Коментарі'}
            </span>
          </Button>

          <Button variant="outline" size="sm" className="gap-2 ml-auto">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="font-semibold">
          Коментарі ({post.comments_count})
        </h2>

        {/* Comment Input */}
        <div className="flex gap-3">
          <Textarea
            placeholder="Написати коментар..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || submittingComment}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Поки немає коментарів. Будьте першим!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-card rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar_url} />
                    <AvatarFallback>
                      {comment.author.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {comment.author.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: uk,
                      })}
                      {comment.is_edited && ' (ред.)'}
                    </p>
                  </div>
                </div>
                <p className="text-sm pl-10">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
