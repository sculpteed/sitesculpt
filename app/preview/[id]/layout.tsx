import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'sitesculpt preview',
  robots: { index: false, follow: false },
};

// Minimal layout — no sitesculpt chrome, full-bleed, real fonts so the
// preview reads as a premium website, not a 2000s WordPress template.
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${instrumentSerif.variable}`}
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1.02) translate3d(-0.5%, 0.3%, 0); }
          100% { transform: scale(1.12) translate3d(0.8%, -0.6%, 0); }
        }
      `}</style>
      {children}
    </div>
  );
}
