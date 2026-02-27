'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Briefcase, Calendar, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/social/post-card';
import { FollowButton } from '@/components/social/follow-button';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  military_unit?: string;
  position?: string;
  city?: string;
  profession?: string;
  bio?: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
}

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

export default function UserProfilePage() {
  const params = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити профіль',
        variant: 'destructive',
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [params.id]);

  const handleFollowChange = (following: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        is_following: following,
        followers_count: following
          ? profile.followers_count + 1
          : profile.followers_count - 1,
      });
    }
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Користувача не знайдено</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl">
              {profile.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            {(profile.position || profile.military_unit) && (
              <p className="text-muted-foreground">
                {profile.position}
                {profile.position && profile.military_unit && ' • '}
                {profile.military_unit}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="font-bold">{profile.posts_count}</p>
                <p className="text-xs text-muted-foreground">Дописи</p>
              </div>
              <Link
                href={`/profile/followers?userId=${profile.id}`}
                className="text-center hover:underline"
              >
                <p className="font-bold">{profile.followers_count}</p>
                <p className="text-xs text-muted-foreground">Підписники</p>
              </Link>
              <Link
                href={`/profile/following?userId=${profile.id}`}
                className="text-center hover:underline"
              >
                <p className="font-bold">{profile.following_count}</p>
                <p className="text-xs text-muted-foreground">Підписки</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <FollowButton
            userId={profile.id}
            isFollowing={profile.is_following}
            onFollowChange={handleFollowChange}
          />
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/messages/${profile.id}`}>
              <MessageCircle className="h-4 w-4" />
              Повідомлення
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Дописи</TabsTrigger>
          <TabsTrigger value="about">Про мене</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Ще немає дописів
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id, post.user_liked || false)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="about">
          <div className="bg-card rounded-lg border p-6 space-y-4">
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Про себе</h3>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            <div className="space-y-2">
              {profile.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.city}
                </div>
              )}
              {profile.profession && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {profile.profession}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Приєднався{' '}
                {new Date(profile.created_at).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
