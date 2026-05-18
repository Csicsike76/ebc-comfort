'use client';
import { useEffect, useRef, ReactNode, ElementType } from 'react';

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
}

export default function FadeIn({ children, as: Tag = 'div', className = '', id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('visible');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const TagComponent = Tag as React.ElementType;
  return (
    <TagComponent ref={ref} id={id} className={`fade-in ${className}`}>
      {children}
    </TagComponent>
  );
}
