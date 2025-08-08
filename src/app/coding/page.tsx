'use client';

import { useEffect, useState } from 'react';
import QuestionPanel from '@/components/question/QuestionPanel';
import CodingPlayground from '@/components/layout/CodingPlayground';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Language, Topic, Question, Difficulty } from '@/types';
import { generateQuestion } from '@/lib/api';

export default function CodingPlatform() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Python');
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isQuestionPanelCollapsed, setIsQuestionPanelCollapsed] = useState(false);
  const [isVertical, setIsVertical] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const onResize = () => setIsVertical(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const handleToggleQuestionPanelCollapse = (collapsed: boolean) => {
    setIsQuestionPanelCollapsed(collapsed);
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-visible">
      <ResizablePanelGroup key={isQuestionPanelCollapsed ? 'collapsed' : 'open'} direction={isVertical ? 'vertical' : 'horizontal'}>
        <ResizablePanel 
          defaultSize={isQuestionPanelCollapsed ? 3 : (isVertical ? 45 : 30)}
          minSize={isQuestionPanelCollapsed ? 3 : 20}
          maxSize={isQuestionPanelCollapsed ? 3 : (isVertical ? 60 : 50)}
        >
          <QuestionPanel
            question={question}
            onGenerateQuestion={handleGenerateQuestion}
            isLoading={isLoadingQuestion}
            onToggleCollapse={handleToggleQuestionPanelCollapse}
            isCollapsed={isQuestionPanelCollapsed}
          />
        </ResizablePanel>
        {!isQuestionPanelCollapsed && <ResizableHandle withHandle />}        
        <ResizablePanel defaultSize={isVertical ? 55 : 70} minSize={isVertical ? 40 : 30}>
          <CodingPlayground
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            currentQuestion={question}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}