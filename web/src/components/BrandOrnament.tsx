interface Props {
  size?: number;
  position?: 'top-right' | 'bottom-left' | 'static';
  className?: string;
}

export default function BrandOrnament({
  size = 64,
  position = 'static',
  className = '',
}: Props) {
  if (position === 'static') {
    return (
      <span
        className={`brand-ornament ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={`hero-ornament ${position} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
