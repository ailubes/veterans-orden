'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from '@/components/social/post-card';
import { PostCreator } from '@/components/social/post-creator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  content: string;
  content_type: string;
  media_urls?: string[];
  created_at: string;
  is_edited?: boolean;
  visibility: string;
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
}

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
}

interface MemberMeResponse {
  id?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
}

export default function FeedPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [filter, setFilter] = useState<'all' | 'following' | 'popular'>('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.append('type', filter);
      params.append('limit', '20');
      if (!reset && cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();

      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити дописи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, cursor, toast]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/members/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = (await response.json()) as MemberMeResponse;
      const displayName =
        data.display_name ||
        `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
        'Користувач';

      if (data.id) {
        setUser({
          id: data.id,
          display_name: displayName,
          avatar_url: data.avatar_url,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
      setCursor(null);
      fetchPosts(true);
  }, [filter]);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: currentlyLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update like');

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_liked: !currentlyLiked,
                likes_count: currentlyLiked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              }
            : post
        )
      );
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити вподобання',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей допис?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast({
        title: 'Видалено',
        description: 'Допис успішно видалено',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити допис',
        variant: 'destructive',
      });
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Стрічка</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Усі</TabsTrigger>
          <TabsTrigger value="following">Підписки</TabsTrigger>
          <TabsTrigger value="popular">Популярні</TabsTrigger>
        </TabsList>
      </Tabs>

      {user && <PostCreator user={user} onCreated={handlePostCreated} />}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id, post.user_liked || false)}
            onDelete={() => handleDelete(post.id)}
            isOwner={user?.id === post.author.id}
          />
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            Поки немає дописів. Будьте першим!
          </div>
        )}

        {hasMore && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fetchPosts(false)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Завантаження...
              </>
            ) : (
              'Завантажити ще'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
