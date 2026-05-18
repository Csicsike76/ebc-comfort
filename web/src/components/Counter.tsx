'use client';
import { useEffect, useRef } from 'react';

interface Props {
  target: number;
  locale?: string;
  className?: string;
  suffix?: string;
}

export default function Counter({ target, locale = 'hu-HU', className = '', suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = target.toLocaleString(locale) + suffix;
      return;
    }
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const dur = Math.min(1200, 400 + target / 20);
    let raf = 0;
    let started = 0;
    function tick(now: number) {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / dur);
      if (node) node.textContent = Math.round(target * ease(t)).toLocaleString(locale) + suffix;
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            raf = requestAnimationFrame(tick);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    obs.observe(node);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [target, locale, suffix]);

  return (
    <span ref={ref} className={`counter-num ${className}`}>
      0{suffix}
    </span>
  );
}
