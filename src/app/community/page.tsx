import Link from 'next/link';
import localFont from 'next/font/local';

const vibur = localFont({ src: '../../fonts/Vibur-Regular.ttf', display: 'swap', weight: '400' });

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white">
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
          <Link href="/community" className="text-white hover:text-gray-300 font-bold">Community</Link>
          <Link href="/pricing" className="text-white hover:text-gray-300">Pricing</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">Community</h1>
          <p className="text-xl text-gray-300 mb-8">Join thousands of developers learning together</p>
          <div className="text-gray-400">
            <p className="mb-4">🚀 Coming Soon...</p>
            <p>Connect, collaborate, and grow with fellow coders</p>
          </div>
        </div>
      </main>
    </div>
  );
}
