import Image from 'next/image';

interface Props {
  variant?: 'image' | 'video';
  size?: number;
  className?: string;
}

export default function BrandLogo({ variant = 'image', size = 40, className = '' }: Props) {
  if (variant === 'video') {
    return (
      <video
        src="/brand/logo-luxus.mp4"
        autoPlay
        loop
        muted
        playsInline
        width={size}
        height={size}
        className={className}
        aria-label="EBC Comfort logo"
      />
    );
  }
  return (
    <Image
      src="/brand/logo-luxus.png"
      alt="EBC Comfort"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
