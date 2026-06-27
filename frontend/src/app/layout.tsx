import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gamify Everything - AI Goal Tracker",
  description: "Transform your daily habits (fitness, learning, productivity) into an interactive goal tracker. Upload proof photos and earn rewards!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#212529] text-white selection:bg-[#e76f51] selection:text-white">
        <header className="border-b-4 border-white bg-black p-4 text-center shadow-[0_4px_0_#e76f51]">
          <div className="mx-auto max-w-5xl flex justify-between items-center px-2">
            <a href="/" className="text-xl md:text-2xl font-bold tracking-wider text-[#f4a261] hover:text-white transition-colors flex items-center gap-2">
              GAMIFY.EVERYTHING
            </a>
            <nav className="flex gap-4 text-xs md:text-sm">
              <a href="/" className="nes-badge"><span className="is-warning">[GOALS]</span></a>
              <a href="/inventory" className="nes-badge"><span className="is-success">[ITEMS]</span></a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4 md:p-6 pb-24">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 border-t-4 border-white bg-black p-3 text-center text-[10px] text-gray-400 z-50">
          AI GOAL DECOMPOSITION &amp; PHOTO VERIFICATION ENGINE
        </footer>
      </body>
    </html>
  );
}
