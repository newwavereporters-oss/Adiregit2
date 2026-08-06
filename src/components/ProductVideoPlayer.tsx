import React from 'react';
import { Play, Film, AlertCircle } from 'lucide-react';

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'gdrive' | 'iframe' | 'direct';
  embedUrl: string;
}

export function parseVideoUrl(url?: string | null): VideoInfo | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (!clean) return null;

  // 1. YouTube standard watch URL, short URL, shorts, or embed URL
  // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // e.g. https://youtu.be/dQw4w9WgXcQ
  // e.g. https://www.youtube.com/shorts/dQw4w9WgXcQ
  // e.g. https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const ytMatch = clean.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&enablejsapi=1&rel=0`,
    };
  }

  // 2. Vimeo URL
  // e.g. https://vimeo.com/76979871 or https://player.vimeo.com/video/76979871
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
  const vimeoMatch = clean.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&autopause=0&muted=1`,
    };
  }

  // 3. Google Drive Video Preview URL
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view
  const gdriveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/i;
  const gdriveMatch = clean.match(gdriveRegex);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
    };
  }

  // 4. Generic iframe embed URLs
  if (clean.includes('/embed/') || clean.includes('player.')) {
    return {
      type: 'iframe',
      embedUrl: clean,
    };
  }

  // 5. Direct Video Files (.mp4, .webm, .mov, .m4v, blob, or custom hosting)
  return {
    type: 'direct',
    embedUrl: clean,
  };
}

interface ProductVideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
  posterImage?: string;
  className?: string;
  aspectRatio?: 'aspect-video' | 'aspect-4/3' | 'aspect-square' | 'aspect-auto';
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export const ProductVideoPlayer: React.FC<ProductVideoPlayerProps> = ({
  videoUrl,
  title = 'Product Showcase Video',
  posterImage,
  className = '',
  aspectRatio = 'aspect-video',
  autoPlay = true,
  muted = true,
  controls = true,
}) => {
  const videoInfo = parseVideoUrl(videoUrl);

  if (!videoInfo) {
    return (
      <div className={`w-full ${aspectRatio} bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-gray-400 border border-gray-800 ${className}`}>
        <Film className="w-10 h-10 text-[#D1B464] mb-2 opacity-60" />
        <p className="text-xs font-semibold">No video URL available</p>
      </div>
    );
  }

  if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' || videoInfo.type === 'gdrive' || videoInfo.type === 'iframe') {
    return (
      <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden bg-black shadow-lg border border-[#D1B464]/30 ${className}`}>
        <iframe
          src={videoInfo.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Direct video file (.mp4, .webm, .mov)
  return (
    <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden bg-black shadow-lg border border-[#D1B464]/30 ${className}`}>
      <video
        src={videoInfo.embedUrl}
        poster={posterImage}
        autoPlay={autoPlay}
        loop
        muted={muted}
        controls={controls}
        playsInline
        className="w-full h-full object-cover"
      >
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
};
