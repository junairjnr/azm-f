import Image from 'next/image';

type LogoVariant = 'sidebar' | 'full';

interface LogoProps {
  variant?: LogoVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  framed?: boolean;
  animate?: boolean;
  priority?: boolean;
  className?: string;
}

const assets: Record<LogoVariant, { src: string; alt: string; width: number; height: number }> = {
  sidebar: {
    src: '/icons/icon512_rounded.png',
    alt: 'AZM',
    width: 512,
    height: 512,
  },
  full: {
    src: '/icons/icon512_rounded.png',
    alt: 'AZM — Determination. Resolve. Grow.',
    width: 512,
    height: 512,
  },
};

const sizeClasses: Record<LogoVariant, Record<string, string>> = {
  sidebar: {
    xs: 'w-[68px]',
    sm: 'w-[80px]',
    md: 'w-[92px]',
  },
  full: {
    sm: 'w-[148px]',
    md: 'w-[176px]',
    lg: 'w-[200px]',
    xl: 'w-[min(220px,78vw)]',
  },
};

export default function Logo({
  variant = 'sidebar',
  size = 'sm',
  framed = true,
  animate = false,
  priority = false,
  className = '',
}: LogoProps) {
  const asset = assets[variant];
  const sizeClass =
    sizeClasses[variant][size] ??
    sizeClasses[variant].sm ??
    Object.values(sizeClasses[variant])[0];

  const image = (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      quality={75}
      priority={priority}
      unoptimized
      className={`block h-auto max-w-full object-contain ${framed ? 'rounded-2xl shadow-2xl' : ''} ${sizeClass} ${className}`}
    />
  );

  if (!framed) {
    return (
      <div className={`mx-auto flex w-full justify-center  ${animate ? 'logo-intro' : ''} ${className}`}>
        {image}
      </div>
    );
  }

  const frameClass = variant === 'full' ? 'logo-card' : 'logo-sidebar-card';

  return (
    <div className={`mx-auto flex w-full justify-center ${className}`}>
      <div className={`${frameClass} ${animate ? 'logo-intro' : ''}`}>{image}</div>
    </div>
  );
}
