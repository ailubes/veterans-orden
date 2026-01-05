import { Video } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="bg-timber-dark/10 border border-line rounded-lg/30 p-8 text-center">
        <Video className="mx-auto mb-3 text-muted-500" size={48} />
        <p className="text-muted-500">Неможливо завантажити відео</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bronze hover:underline text-sm mt-2 inline-block"
        >
          Відкрити посилання
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-lg relative overflow-hidden">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
