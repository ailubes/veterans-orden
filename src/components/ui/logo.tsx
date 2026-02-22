import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <Image
      src="/images/logo-veterans-orden.png"
      alt="Орден Ветеранів"
      width={size}
      height={size}
      className={className}
    />
  );
}
