'use client';

import { useState } from 'react';
import { ImagePlus, Globe, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface PostCreatorProps {
  user: {
    id?: string;
    display_name: string;
    avatar_url?: string;
  };
  onCreated?: (post: {
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
  }) => void;
}

const visibilityOptions = [
  { key: 'public', label: 'Публічний', icon: Globe },
  { key: 'followers', label: 'Підписники', icon: Users },
  { key: 'private', label: 'Приватний', icon: Lock },
];

export function PostCreator({ user, onCreated }: PostCreatorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          content_type: 'text',
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');

      const data = await response.json();
      setContent('');
      if (data?.post && onCreated) {
        onCreated(data.post);
      }
      toast({
        title: 'Допис опубліковано',
        description: 'Ваш допис успішно опубліковано',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося опублікувати допис',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{user.display_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Що у вас нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
            Фото
          </Button>

          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Публікація...' : 'Опублікувати'}
        </Button>
      </div>
    </div>
  );
}
