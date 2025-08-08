'use client';

import Link from 'next/link';
import localFont from 'next/font/local';

const vibur = localFont({ src: '../../fonts/Vibur-Regular.ttf', display: 'swap', weight: '400' });

export default function DocsPage() {
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
          <Link href="/docs" className="text-white hover:text-gray-300 font-bold">Docs</Link>
          <Link href="/pricing" className="text-white hover:text-gray-300">Pricing</Link>
        </nav>
      </header>

      <main className="pt-32 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Documentation</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p className="text-gray-300 mb-4">
              Learn is an interactive coding platform that helps you practice programming through AI-generated questions and real-time code execution.
            </p>
            <p className="text-gray-300">
              Simply select a programming language, choose a topic and difficulty, and start solving coding challenges with immediate feedback.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Supported Languages</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Python</li>
              <li>JavaScript</li>
              <li>TypeScript</li>
              <li>Java</li>
              <li>C++</li>
              <li>C</li>
              <li>Go</li>
              <li>Rust</li>
              <li>Ruby</li>
              <li>PHP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>AI-generated coding questions</li>
              <li>Real-time code execution</li>
              <li>Interactive terminal with input/output support</li>
              <li>Multiple difficulty levels</li>
              <li>Various programming topics</li>
              <li>Modern code editor with syntax highlighting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Generate Question</h3>
              <code className="text-green-400">POST /api/generate-question</code>
              <p className="text-gray-300 mt-2">Generate a coding question based on language, topic, and difficulty.</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">Execute Code</h3>
              <code className="text-green-400">POST /api/execute-interactive</code>
              <p className="text-gray-300 mt-2">Execute code with support for interactive input/output.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
