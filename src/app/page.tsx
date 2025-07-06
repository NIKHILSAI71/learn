'use client';

import { useState } from 'react';
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
    <div className="h-screen bg-background text-foreground overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <QuestionPanel
            question={question}
            onGenerateQuestion={handleGenerateQuestion}
            isLoading={isLoadingQuestion}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
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
