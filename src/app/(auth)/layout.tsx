import { GrainOverlay } from '@/components/layout/grain-overlay';
import { Logo } from '@/components/ui/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GrainOverlay />
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Logo size={48} className="text-timber-dark" />
            <span className="font-syne font-bold text-2xl tracking-tight">
              МЕРЕЖА
            </span>
          </div>

          {/* Auth Content */}
          {children}

          {/* Footer */}
          <p className="text-center mt-8 font-mono text-xs text-timber-beam">
            ГУРТУЄМОСЬ, ЩОБ ВПЛИВАТИ!
          </p>
        </div>
      </div>
    </>
  );
}
