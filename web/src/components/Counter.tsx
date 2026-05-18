'use client';
import { useEffect, useRef } from 'react';

interface Props {
  target: number;
  from?: number;
  locale?: string;
  className?: string;
  suffix?: string;
  durationMs?: number;
}

export default function Counter({
  target,
  from = 0,
  locale = 'hu-HU',
  className = '',
  suffix = '',
  durationMs,
}: Props) {
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
    const span = target - from;
    const dur = durationMs ?? Math.min(1800, 400 + Math.abs(span) * 2);
    let raf = 0;
    let started = 0;
    function tick(now: number) {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / dur);
      const value = from + span * ease(t);
      if (node) node.textContent = Math.round(value).toLocaleString(locale) + suffix;
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
  }, [target, from, locale, suffix, durationMs]);

  return (
    <span ref={ref} className={`counter-num ${className}`}>
      {from.toLocaleString(locale)}{suffix}
    </span>
  );
}
