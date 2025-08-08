'use client';

import Link from 'next/link';
import LetterGlitch from '@/components/landing/LetterGlitch';
import localFont from 'next/font/local';

// Correct font path from src/app to src/fonts
const vibur = localFont({ src: '../fonts/Vibur-Regular.ttf', display: 'swap', weight: '400' });

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      {/* Background LetterGlitch Effect */}
  <div className="absolute inset-0 z-0 pointer-events-none">
        <LetterGlitch 
          className="w-full h-full"
          glitchColors={['#DC2626', '#7C2D12', '#991B1B']}
          glitchSpeed={30}
          outerVignette={false}
          centerVignette={false}
          smooth={true}
        />
      </div>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at center, rgba(0,0,0,0.7), rgba(220,38,38,0.1))'}} />
      
      {/* Header Navigation */}
  <header suppressHydrationWarning className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-transparent backdrop-blur-xs rounded-full px-8 py-3 flex items-center justify-between border border-white/10 w-[min(80%,800px)]">
        <div className="flex items-center space-x-4">
          <span className={`${vibur.className} text-white text-2xl sm:text-3xl font-semibold`}>
            Learn
          </span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-white hover:text-gray-300">Home</Link>
          <Link href="/docs" className="text-white hover:text-gray-300">Docs</Link>
          <Link href="/community" className="text-white hover:text-gray-300">Community</Link>
          <Link href="/pricing" className="text-white hover:text-gray-300">Pricing</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Oops! Looks like this page got lost in the matrix. Let&apos;s get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/" className="px-8 py-4 bg-white text-black font-semibold rounded-full transition transform duration-200 hover:scale-105">
              Go Home
            </Link>
            <Link href="/coding" className="px-8 py-4 bg-transparent text-gray-200 font-semibold rounded-full border border-white/10 backdrop-blur-xs transition transform duration-200 hover:bg-white/5">
              Start Coding
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
