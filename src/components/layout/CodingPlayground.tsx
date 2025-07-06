'use client';

import { useState, useEffect, useRef } from 'react';
import ControlsBar from '@/components/editor/ControlsBar';
import CodeEditor from '@/components/editor/CodeEditor';
import InteractiveTerminal, { TerminalRef } from '@/components/terminal/InteractiveTerminal';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Language, Question } from '@/types';
import { executeCodeInteractive, stopSession } from '@/lib/api';
import { LANGUAGES } from '@/constants';

interface CodingPlaygroundProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  currentQuestion: Question | null;
}

export default function CodingPlayground({
  selectedLanguage,
  onLanguageChange,
  currentQuestion
}: CodingPlaygroundProps) {
  const [code, setCode] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [executionTimeout, setExecutionTimeout] = useState<number>(10);
  const [memoryLimit, setMemoryLimit] = useState<number>(128000);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (currentQuestion?.sampleCode?.code) {
      setCode(currentQuestion.sampleCode.code);
    } else if (currentQuestion?.solutionTemplate) {
      setCode(currentQuestion.solutionTemplate);
    } else {
      setCode('');
    }
  }, [currentQuestion]);

  const terminalRef = useRef<TerminalRef>(null);

  const handleLanguageChange = (language: Language) => {
    onLanguageChange(language);
  };

  const addTerminalMessage = (message: string, type: 'output' | 'error' = 'output') => {
    if (terminalRef.current) {
      if (type === 'error') {
        terminalRef.current.addError(message);
      } else {
        terminalRef.current.addOutput(message);
      }
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      addTerminalMessage('No code to execute', 'error');
      return;
    }

    setIsExecuting(true);
    
    if (currentSessionId) {
      try {
        await stopSession(currentSessionId);
        setCurrentSessionId(null);
      } catch {
        // Session cleanup failed silently
      }
    }
    
    try {
      addTerminalMessage('Executing code...');
      
      const result = await executeCodeInteractive(code, selectedLanguage);
      
      if (result.stdout) {
        addTerminalMessage(result.stdout);
      }
      if (result.stderr) {
        addTerminalMessage(result.stderr, 'error');
      }
      
      // Show message if no output
      if (!result.stdout && !result.stderr) {
        addTerminalMessage('(No output)');
      }
      
      addTerminalMessage(`\nExecution completed in ${result.time}s`);
      
      if (result.debug_info && typeof window !== 'undefined' && (window as unknown as { terminal?: unknown }).terminal) {
        ((window as unknown as { terminal: {
          updateDebugInfo: (info: {
            line: number;
            variables: Record<string, unknown>;
            stack: string[];
            state: string;
          }) => void;
        } }).terminal).updateDebugInfo({
          line: (result.debug_info as { currentLine: number }).currentLine,
          variables: (result.debug_info as { variables: Record<string, unknown> }).variables,
          stack: (result.debug_info as { stack: string[] }).stack,
          state: 'stopped'
        });
      }
      
      if (result.interactive && result.session_id) {
        setCurrentSessionId(result.session_id);
        if (typeof window !== 'undefined' && (window as unknown as { terminal?: unknown }).terminal) {
          ((window as unknown as { terminal: { requestInput: () => void } }).terminal).requestInput();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code execution failed';
      addTerminalMessage(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleOutputCollapse = () => {
    setIsOutputCollapsed(!isOutputCollapsed);
  };

  useEffect(() => {
    return () => {
      if (currentSessionId) {
        stopSession(currentSessionId).catch(() => {});
      }
    };
  }, [currentSessionId]);

  return (
    <div className="h-full flex flex-col">
      <ControlsBar
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        isExecuting={isExecuting}
        executionTimeout={executionTimeout}
        setExecutionTimeout={setExecutionTimeout}
        memoryLimit={memoryLimit}
        setMemoryLimit={setMemoryLimit}
        languages={LANGUAGES}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        {!isOutputCollapsed ? (
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="h-full p-4">
                <div className="h-full rounded-lg border border-border overflow-hidden">
                  <CodeEditor
                    language={selectedLanguage}
                    code={code}
                    onChange={setCode}
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              <InteractiveTerminal
                ref={terminalRef}
                isCollapsed={isOutputCollapsed}
                onToggleCollapse={toggleOutputCollapse}
                isExecuting={isExecuting}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4">
              <div className="h-full rounded-lg border border-border overflow-hidden">
                <CodeEditor
                  language={selectedLanguage}
                  code={code}
                  onChange={setCode}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <InteractiveTerminal
                ref={terminalRef}
                isCollapsed={isOutputCollapsed}
                onToggleCollapse={toggleOutputCollapse}
                isExecuting={isExecuting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
