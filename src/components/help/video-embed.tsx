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
      <div className="bg-timber-dark/10 border-2 border-timber-dark/30 p-8 text-center">
        <Video className="mx-auto mb-3 text-timber-beam" size={48} />
        <p className="text-timber-beam">Неможливо завантажити відео</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline text-sm mt-2 inline-block"
        >
          Відкрити посилання
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-timber-dark relative overflow-hidden">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

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
