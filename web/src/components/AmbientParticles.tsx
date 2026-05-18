'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  count?: number;
}

export default function AmbientParticles({ count = 14 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    size: number; left: number; duration: number; delay: number; drift: number; opacity: number;
  }>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const mobile = window.innerWidth < 720;
    const finalCount = mobile ? Math.min(count, 8) : count;
    const arr = Array.from({ length: finalCount }, () => ({
      size: 3 + Math.random() * 5,
      left: Math.random() * 100,
      duration: 14 + Math.random() * 18,
      delay: -(Math.random() * 30),
      drift: (Math.random() - 0.5) * 80,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setParticles(arr);
  }, [count]);

  return (
    <div ref={containerRef} className="particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            bottom: '-20px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            ['--drift' as string]: `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
