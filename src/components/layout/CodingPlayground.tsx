'use client';

import { useState, useEffect, useRef } from 'react';
import ControlsBar from '@/components/editor/ControlsBar';
import CodeEditor from '@/components/editor/CodeEditor';
import InteractiveTerminal, { TerminalRef } from '@/components/terminal/InteractiveTerminal';
import ResizeHandle from '@/components/layout/ResizeHandle';
import { useResize } from '@/hooks/useResize';
import { Language, Question } from '@/types';
import { executeCodeInteractive, sendInput, stopSession, executeTerminalCommand } from '@/lib/api';
import { LANGUAGES, DEFAULT_VALUES } from '@/constants';

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
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_VALUES.SIDEBAR_WIDTH);
  const [outputHeight, setOutputHeight] = useState<number>(DEFAULT_VALUES.OUTPUT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingOutput, setIsResizingOutput] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'terminal' | 'debug'>('terminal');
  const [executionTimeout, setExecutionTimeout] = useState<number>(DEFAULT_VALUES.EXECUTION_TIMEOUT);
  const [memoryLimit, setMemoryLimit] = useState<number>(DEFAULT_VALUES.MEMORY_LIMIT);
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

  const {
    startResizing,
    startResizingOutput,
    rightPanelRef
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
      } catch (error) {
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
      
      if (result.debug_info && typeof window !== 'undefined' && (window as any).terminal) {
        (window as any).terminal.updateDebugInfo({
          line: result.debug_info.currentLine,
          variables: result.debug_info.variables,
          stack: result.debug_info.stack,
          state: 'stopped'
        });
      }
      
      if (result.interactive && result.session_id) {
        setCurrentSessionId(result.session_id);
        if (typeof window !== 'undefined' && (window as any).terminal) {
          (window as any).terminal.requestInput();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code execution failed';
      addTerminalMessage(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTerminalInput = async (input: string) => {
    if (currentSessionId) {
      try {
        await sendInput(currentSessionId, input);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send input';
        addTerminalMessage(`Error: ${errorMessage}`, 'error');
      }
    } else {
      await handleTerminalCommand(input);
    }
  };

  const handleTerminalCommand = async (input: string) => {
    if (input === 'clear') {
      if (terminalRef.current) {
        terminalRef.current.clear();
      }
    } else if (input === 'help') {
      addTerminalMessage('Available commands:\n  clear - Clear terminal\n  help - Show this help\n  exit - Stop current session');
    } else if (input === 'exit' && currentSessionId) {
      try {
        await stopSession(currentSessionId);
        setCurrentSessionId(null);
        addTerminalMessage('Session stopped');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stop session';
        addTerminalMessage(`Error: ${errorMessage}`, 'error');
      }
    } else {
      try {
        addTerminalMessage(`Executing: ${input}`);
        const result = await executeTerminalCommand(input);
        
        if (result.stdout) {
          addTerminalMessage(result.stdout);
        }
        if (result.stderr) {
          addTerminalMessage(result.stderr, 'error');
        }
        if (!result.success) {
          addTerminalMessage(`Command failed with exit code ${result.exitCode}`, 'error');
        }
        if (!result.stdout && !result.stderr && result.success) {
          addTerminalMessage('Command executed successfully (no output)');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute command';
        addTerminalMessage(`Error: ${errorMessage}`, 'error');
      }
    }
  };

  const handleDebugAction = async (action: 'start' | 'stop' | 'step' | 'continue' | 'restart') => {
    try {
      switch (action) {
        case 'start':
          await handleRunCode();
          break;
        case 'stop':
          if (currentSessionId) {
            await stopSession(currentSessionId);
            setCurrentSessionId(null);
          }
          break;
        case 'restart':
          if (currentSessionId) {
            await stopSession(currentSessionId);
          }
          await handleRunCode();
          break;
        default:
          if (typeof window !== 'undefined' && (window as any).terminal) {
            (window as any).terminal.addDebug(`Debug action: ${action}`);
          }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Debug action failed';
      addTerminalMessage(`Error: ${errorMessage}`, 'error');
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
    <div ref={rightPanelRef} className="flex-1 h-full flex flex-col min-w-0">
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

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="flex-1 min-h-0 rounded-lg border border-border overflow-hidden">
          <CodeEditor
            language={selectedLanguage}
            code={code}
            onChange={setCode}
          />
        </div>
      </div>

      {!isOutputCollapsed && (
        <ResizeHandle 
          onMouseDown={startResizingOutput} 
          direction="vertical" 
        />
      )}

      <InteractiveTerminal
        ref={terminalRef}
        isCollapsed={isOutputCollapsed}
        onToggleCollapse={toggleOutputCollapse}
        activeTab={activeOutputTab}
        onTabChange={setActiveOutputTab}
        height={outputHeight}
        onInput={handleTerminalInput}
        isExecuting={isExecuting}
        onDebugAction={handleDebugAction}
      />
    </div>
  );
}
