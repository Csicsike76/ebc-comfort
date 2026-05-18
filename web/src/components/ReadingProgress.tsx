'use client';
import { useEffect, useRef } from 'react';

export default function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      if (ref.current) ref.current.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div ref={ref} className="reading-progress" aria-hidden="true" />;
}
