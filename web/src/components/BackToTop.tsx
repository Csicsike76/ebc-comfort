'use client';
import { useEffect, useRef } from 'react';

export default function BackToTop({ ariaLabel = 'Vissza a tetejére' }: { ariaLabel?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function update() {
      if (ref.current) ref.current.classList.toggle('visible', window.scrollY > 600);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      className="back-to-top"
      aria-label={ariaLabel}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
