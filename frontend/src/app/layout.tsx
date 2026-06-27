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
        <header className="border-b-4 border-white bg-black shadow-[0_4px_0_#e76f51]">
          <div className="mx-auto max-w-5xl flex justify-between items-center px-3 py-3 gap-2">
            <a href="/" className="font-bold tracking-wider text-[#f4a261] hover:text-white transition-colors flex items-center shrink-0 text-base md:text-2xl">
              <span className="hidden sm:inline">GAMIFY.EVERYTHING</span>
              <span className="sm:hidden">G.E</span>
            </a>
            <nav className="flex gap-2 items-center shrink-0">
              <a href="/" className="nes-btn is-warning text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 whitespace-nowrap">[GOALS]</a>
              <a href="/inventory" className="nes-btn is-success text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 whitespace-nowrap">[ITEMS]</a>
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
