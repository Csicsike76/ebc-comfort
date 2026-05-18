'use client';
import { useEffect, useRef } from 'react';

interface Props {
  text: string;
  href: string;
  ctaLabel: string;
  heroSelector?: string;
}

export default function StickyCta({ text, href, ctaLabel, heroSelector = '#hero' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function update() {
      const hero = document.querySelector(heroSelector);
      if (!hero || !ref.current) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const scrolledPastHero = heroBottom < 0;
      const nearEnd = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 200;
      ref.current.classList.toggle('visible', scrolledPastHero && !nearEnd);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [heroSelector]);
  return (
    <div ref={ref} className="sticky-cta" aria-hidden="true">
      <span className="sticky-cta-text">{text}</span>
      <a
        href={href}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] transition-colors"
      >
        {ctaLabel}
      </a>
    </div>
  );
}
