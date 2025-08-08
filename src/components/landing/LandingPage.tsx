'use client';

import { useState } from 'react';
import LetterGlitch from './LetterGlitch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import localFont from 'next/font/local';

const vibur = localFont({ src: '../../fonts/Vibur-Regular.ttf', display: 'swap', weight: '400' });

const LandingPage = ({ onEnterApp }: { onEnterApp?: () => void }) => {
  const router = useRouter();
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background LetterGlitch Effect */}
  <div className="absolute inset-0 z-0 pointer-events-none">
        <LetterGlitch 
          className="w-full h-full"
          glitchColors={['#2b4539', '#EC4899', '#2563EB']}
          glitchSpeed={50}
          outerVignette={false}
          centerVignette={false}
          smooth={true}
        />
      </div>
      {/* Radial gradient overlay in center */}
      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at center, rgba(0,0,0,0.5), rgba(255,255,255,0.1))'}} />

      {/* Header Navigation */}
  <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-transparent backdrop-blur-xs rounded-full px-8 py-3 flex items-center justify-between border border-white/10 w-[min(80%,800px)]">
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
        <div className="text-center max-w-4xl">
          {/* Removed New Background Badge */}

           {/* Main Heading */}
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Am I finally a real hacker
            <br className="hidden sm:block" />
            now, mom?
           </h1>

           {/* Action Buttons */}
           <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => router.push('/coding')}
              className="px-8 py-4 bg-white text-black font-semibold rounded-full transition transform duration-200 hover:scale-105"
            >
              Get Started
            </button>
            
             <Link href="/docs" className="px-8 py-4 bg-transparent text-gray-200 font-semibold rounded-full border border-white/10 backdrop-blur-xs transition transform duration-200 hover:bg-white/5">
               Learn More
             </Link>
           </div>

          {/* Subtitle removed */}

         </div>
       </main>

      {/* Removed edge vignette overlay */}

     </div>
  );
};

export default LandingPage;
