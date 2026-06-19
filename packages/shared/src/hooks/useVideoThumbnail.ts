import { useEffect, useState } from 'react';

export function useVideoThumbnail(videoSrc: string | undefined): string | null {
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    if (!videoSrc) return;

    setFrame(null);

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');

    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    function drawFrame() {
      if (video.videoWidth === 0 || video.videoHeight === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFrame(canvas.toDataURL('image/jpeg', 0.8));
    }

    function onSeeked() {
      drawFrame();
    }

    function onLoadedData() {
      // Seek slightly past 0 to ensure a real frame is decoded
      video.currentTime = 0.001;
    }

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('seeked', onSeeked);
    video.src = videoSrc;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      video.src = '';
    };
  }, [videoSrc]);

  return frame;
}
