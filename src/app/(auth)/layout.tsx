import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo-veterans-orden.png"
            alt="Орден Ветеранів"
            width={48}
            height={48}
            className="rounded-sm"
          />
          <span className="font-inter font-black text-2xl tracking-tight text-text-100">
            ОРДЕН
          </span>
        </Link>

        {/* Auth Content */}
        {children}

        {/* Footer */}
        <p className="text-center mt-8 font-mono text-xs text-muted-500">
          ЧЕСТЬ. БРАТЕРСТВО. ДІЯ.
        </p>
      </div>
    </div>
  );
}
