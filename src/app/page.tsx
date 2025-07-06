'use client';

import { useState } from 'react';
import QuestionPanel from '@/components/question/QuestionPanel';
import CodingPlayground from '@/components/layout/CodingPlayground';
import ResizeHandle from '@/components/layout/ResizeHandle';
import { useResize } from '@/hooks/useResize';
import { Language, Topic, Question, Difficulty } from '@/types';
import { generateQuestion } from '@/lib/api';
import { DEFAULT_VALUES } from '@/constants';

export default function CodingPlatform() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Python');
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_VALUES.SIDEBAR_WIDTH);
  const [outputHeight, setOutputHeight] = useState<number>(DEFAULT_VALUES.OUTPUT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingOutput, setIsResizingOutput] = useState(false);

  const {
    startResizing,
    isResizing: resizing,
    isResizingOutput: resizingOutput,
    containerRef
  } = useResize({
    sidebarWidth,
    setSidebarWidth,
    outputHeight,
    setOutputHeight,
    isResizing,
    setIsResizing,
    isResizingOutput,
    setIsResizingOutput
  });

  const handleGenerateQuestion = async (topic: Topic, difficulty: Difficulty) => {
    setIsLoadingQuestion(true);
    setQuestion(null);
    try {
      const newQuestion = await generateQuestion(selectedLanguage, topic, difficulty);
      setQuestion(newQuestion);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to generate question';
      setQuestion({
        title: "Error",
        description: errorMessage,
        constraints: "",
        examples: []
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-background text-foreground flex overflow-hidden"
      style={{ userSelect: resizing || resizingOutput ? 'none' : 'auto' }}
    >
      <div 
        className="h-full bg-card border-r border-border flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <QuestionPanel
          question={question}
          onGenerateQuestion={handleGenerateQuestion}
          isLoading={isLoadingQuestion}
        />
      </div>

      <ResizeHandle onMouseDown={startResizing} />

      <CodingPlayground
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        currentQuestion={question}
      />
    </div>
  );
}
