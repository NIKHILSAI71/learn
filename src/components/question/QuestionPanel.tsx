'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Check } from 'lucide-react';
import { Topic, Question, Difficulty } from '@/types';

interface QuestionPanelProps {
  question: Question | null;
  onGenerateQuestion: (topic: Topic, difficulty: Difficulty) => void;
  isLoading: boolean;
}

const topics: Topic[] = [
  'Arrays',
  'Strings',
  'Dynamic Programming',
  'Graphs',
  'Trees',
  'Sorting',
  'Searching',
  'Hash Tables',
  'Linked Lists',
  'Stack and Queue',
  'Custom',
];

const difficulties: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];

const SkeletonLine = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => (
  <div 
    className={`relative overflow-hidden bg-gradient-to-r from-gray-800/40 via-gray-700/60 to-gray-800/40 bg-[length:200%_100%] rounded ${className}`}
    style={{ 
      animation: `shimmerWave 2s ease-in-out infinite ${delay}s`,
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmerGlow_2s_ease-in-out_infinite] translate-x-[-100%]" />
  </div>
);

const QuestionSkeleton = () => (
  <div className="space-y-6 p-4">
    <div className="space-y-3">
      <SkeletonLine className="h-7 w-4/5" delay={0} />
      <SkeletonLine className="h-5 w-20" delay={0.1} />
    </div>
    
    <div className="space-y-3">
      <SkeletonLine className="h-5 w-24" delay={0.2} />
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-full" delay={0.3} />
        <SkeletonLine className="h-4 w-full" delay={0.35} />
        <SkeletonLine className="h-4 w-3/4" delay={0.4} />
        <SkeletonLine className="h-4 w-5/6" delay={0.45} />
        <SkeletonLine className="h-4 w-full" delay={0.5} />
        <SkeletonLine className="h-4 w-2/3" delay={0.55} />
      </div>
    </div>
    
    <div className="space-y-3">
      <SkeletonLine className="h-5 w-28" delay={0.6} />
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-full" delay={0.65} />
        <SkeletonLine className="h-4 w-4/5" delay={0.7} />
        <SkeletonLine className="h-4 w-3/4" delay={0.75} />
      </div>
    </div>
    
    <div className="space-y-4">
      <SkeletonLine className="h-5 w-24" delay={0.8} />
      <div className="space-y-4">
        <div className="p-4 space-y-3 border border-gray-600/30 rounded-lg bg-gray-900/20">
          <SkeletonLine className="h-4 w-3/4" delay={0.85} />
          <SkeletonLine className="h-4 w-2/3" delay={0.9} />
          <SkeletonLine className="h-4 w-full" delay={0.95} />
        </div>
        <div className="p-4 space-y-3 border border-gray-600/30 rounded-lg bg-gray-900/20">
          <SkeletonLine className="h-4 w-4/5" delay={1.0} />
          <SkeletonLine className="h-4 w-3/4" delay={1.05} />
          <SkeletonLine className="h-4 w-5/6" delay={1.1} />
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      <SkeletonLine className="h-5 w-32" delay={1.15} />
      <div className="p-4 border border-gray-600/30 rounded-lg bg-gray-900/20 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonLine 
            key={i} 
            className={`h-3 ${i % 3 === 0 ? 'w-1/2' : i % 3 === 1 ? 'w-3/4' : 'w-full'}`} 
            delay={1.2 + i * 0.05} 
          />
        ))}
      </div>
    </div>
  </div>
);

export default function QuestionPanel({
  question,
  onGenerateQuestion,
  isLoading,
}: QuestionPanelProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic>('Arrays');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [customTopic, setCustomTopic] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [dots, setDots] = useState('.');

  // Dots animation effect
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        if (prev === '...') return '....';
        return '.';
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-600';
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-orange-500';
      case 'expert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleGenerate = () => {
    const topicToUse = selectedTopic === 'Custom' ? customTopic : selectedTopic;
    onGenerateQuestion(topicToUse as Topic, selectedDifficulty);
  };

  const handleCopy = () => {
    if (!question) return;

    const textToCopy = `${String(question.description || 'No description available')}`.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col p-4 bg-card overflow-hidden">
      <div className="space-y-4 mb-6 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Topic</label>
            <Select value={selectedTopic} onValueChange={(value: Topic) => setSelectedTopic(value)}>
              <SelectTrigger className="w-full bg-input border-border text-foreground">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {topics.map((topic) => (
                  <SelectItem 
                    key={topic} 
                    value={topic}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTopic === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Difficulty</label>
            <Select value={selectedDifficulty} onValueChange={(value: Difficulty) => setSelectedDifficulty(value)}>
              <SelectTrigger className="w-full bg-input border-border text-foreground">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {difficulties.map((difficulty) => (
                  <SelectItem 
                    key={difficulty} 
                    value={difficulty}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 text-white font-semibold">
              {isLoading ? `Generating${dots}` : 'Generate'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {isLoading ? (
          <div className="flex-1 overflow-y-auto">
            <QuestionSkeleton />
          </div>
        ) : question ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
            <div>
              {question.description ? (
                <div>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: (props: any) => (
                          <div>
                            <h1 className="text-2xl font-bold text-foreground mb-4" {...props}>{props.children}</h1>
                            {question.difficulty && (
                              <div className="mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                              </div>
                            )}
                          </div>
                        ),
                        h2: (props: any) => <h2 className="text-lg font-semibold text-foreground mb-3 mt-6" {...props}>{props.children}</h2>,
                        h3: (props: any) => <h3 className="text-md font-semibold text-foreground mb-2 mt-4" {...props}>{props.children}</h3>,
                        h4: (props: any) => <h4 className="text-sm font-semibold text-foreground mb-2" {...props}>{props.children}</h4>,
                        p: (props: any) => <p className="text-sm text-foreground mb-4 leading-relaxed" {...props}>{props.children}</p>,
                        strong: (props: any) => <strong className="font-semibold text-foreground" {...props}>{props.children}</strong>,
                        em: (props: any) => <em className="italic text-foreground" {...props}>{props.children}</em>,
                        ul: (props: any) => <ul className="list-disc list-inside text-sm text-foreground space-y-2 mb-4 ml-4" {...props}>{props.children}</ul>,
                        ol: (props: any) => <ol className="list-decimal list-inside text-sm text-foreground space-y-2 mb-4 ml-4" {...props}>{props.children}</ol>,
                        li: (props: any) => <li className="text-foreground mb-1" {...props}>{props.children}</li>,
                        code: (props: any) => <code className="bg-gray-700/80 text-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-600/50" {...props}>{props.children}</code>,
                        pre: (props: any) => <pre className="bg-gray-800/90 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4 border border-gray-600/50 shadow-inner" {...props}>{props.children}</pre>,
                        blockquote: (props: any) => <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300 mb-4 bg-gray-800/30 py-2 rounded-r" {...props}>{props.children}</blockquote>,
                      }}
                    >
                      {typeof question.description === 'string' ? question.description : JSON.stringify(question.description, null, 2)}
                  </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-400 p-4 border border-red-400/30 rounded-lg bg-red-900/20">
                  No description available for this question.
                </div>
              )}

              {/* Examples, Solution Template, Sample Code, Copy Button */}
              {question.examples && question.examples.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Examples</h3>
                  <div className="space-y-4">
                    {question.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-gray-900/40 rounded-lg border border-gray-600/40 shadow-sm">
                        <div className="text-secondary-foreground text-sm space-y-3">
                          <div>
                            <span className="font-semibold text-foreground">Input:</span> 
                            <code className="ml-2 bg-gray-700/80 px-3 py-1 rounded text-xs border border-gray-600/50">{String(example.input)}</code>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Output:</span> 
                            <code className="ml-2 bg-gray-700/80 px-3 py-1 rounded text-xs border border-gray-600/50">{String(example.output)}</code>
                          </div>
                          {example.explanation && typeof example.explanation === 'string' && (
                            <div>
                              <span className="font-semibold text-foreground">Explanation:</span>
                              <div className="mt-2 prose prose-sm prose-invert max-w-none">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: (props: any) => <p className="text-sm text-foreground leading-relaxed" {...props}>{props.children}</p>,
                                    code: (props: any) => <code className="bg-gray-700/80 text-gray-100 px-2 py-1 rounded text-xs font-mono border border-gray-600/50" {...props}>{props.children}</code>,
                                  }}
                                >
                                  {example.explanation}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.solutionTemplate && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Solution Template</h3>
                  <pre className="bg-gray-800/90 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-gray-600/50 shadow-inner">
                    {question.solutionTemplate}
                  </pre>
                </div>
              )}

              <div className="flex-shrink-0 pt-4 border-t border-gray-600/30">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/70 border-gray-600/50 hover:border-gray-500/70 text-foreground hover:text-white transition-all duration-200 flex items-center justify-center gap-2 py-3"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      <span className="font-medium">Copy Question</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/30">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-center max-w-sm mx-auto leading-relaxed">
                Select a topic and difficulty level above, then click "Generate" to create your coding challenge.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}