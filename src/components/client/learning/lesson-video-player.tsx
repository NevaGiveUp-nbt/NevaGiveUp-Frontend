"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';
interface Props {
  videoId: string;
  lessonId: number;
  duration: number | null;
  startSeconds: number;
  onSaveProgress: (lessonId: number, seconds: number) => void;
  onEnded?: () => void;
}

export function LessonVideoPlayer({ videoId, lessonId, duration, startSeconds, onSaveProgress, onEnded }: Props) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimeRef = useRef(0); //vị trí gần nhất đọc được
  const endedRef = useRef(false); //đã xem hết thì không lưu đè lại

  // đóng băng lúc mount; gần cuối video thì xem lại từ đầu, còn lại lùi 3s cho dễ nhớ ngữ cảnh
  const [initialStart] = useState(() =>
    duration && startSeconds >= duration - 10 ? 0 : Math.max(0, startSeconds - 3),
  );
  const opts = useMemo(
    () => ({ width: '100%', height: '100%', playerVars: { start: initialStart, rel: 0, autoplay: 0 as const } }),
    [initialStart],
  );

  const readTime = () => {
    try {
      const t = playerRef.current?.getCurrentTime();
      if (typeof t === 'number') lastTimeRef.current = Math.floor(t);
    } catch {
       //nếu user bị hủy thì lấy lại giá trị cũ
    }
    return lastTimeRef.current;
  }

  const save = () => {
    if (endedRef.current) return;
    const t = readTime();
    if (t > 0) onSaveProgress(lessonId, t);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleStateChange = (e: YouTubeEvent<number>) => {
    if (e.data === 1) {                 // playing
      endedRef.current = false;
      stopTimer();
      save();
      let tick = 0;
      timerRef.current = setInterval(() => {  // mỗi giây cập nhật ref, mỗi 10s mới gọi API
        tick += 1;
        if (tick % 10 === 0) save(); else readTime();
      }, 1000);
    } else if (e.data === 2) {          // paused
      stopTimer();
      save();
    } else if (e.data === 0) {          // ended
      stopTimer();
      endedRef.current = true;
      onSaveProgress(lessonId, 0);
      onEnded?.(); 
    }
  };

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') save(); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', save);
      stopTimer();
      save();  // lưu lần cuối khi đổi bài / rời trang
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <YouTube
      videoId={videoId}
      className="absolute inset-0 w-full h-full"
      iframeClassName="w-full h-full border-0"
      opts={opts}
      onReady={(e) => { playerRef.current = e.target; }}
      onStateChange={handleStateChange}
    />
  );
}