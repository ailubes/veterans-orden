'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserCard } from '@/components/social/user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Member {
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
}

export default function CommunityPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', reset ? '1' : page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/community?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();

      if (reset) {
        setMembers(data.members);
        setPage(1);
      } else {
        setMembers((prev) => [...prev, ...data.members]);
      }

      setTotal(data.pagination.total);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити спільноту',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, toast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMembers(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchMembers(false);
    }
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Спільнота</h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} учасників` : 'Завантаження...'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук ветеранів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {loading && members.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'Нічого не знайдено' : 'Поки немає учасників'}
          </div>
        ) : (
          members.map((member) => (
            <UserCard key={member.id} user={member} />
          ))
        )}
      </div>

      {members.length > 0 && members.length < total && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
        >
          {loading ? (
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
  );
}
