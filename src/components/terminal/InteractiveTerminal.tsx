'use client';

import { useState, useRef, useEffect, KeyboardEvent, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Terminal, Copy, Download, Trash2, 
  ChevronUp, ChevronDown, Maximize2, Minimize2, Play
} from 'lucide-react';

interface TerminalLine {
  type: 'output' | 'input' | 'error' | 'success' | 'warning' | 'info';
  content: string;
  timestamp: number;
  id: string;
}

interface InteractiveTerminalProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  height: number;
  onInput?: (input: string) => void;
  isExecuting: boolean;
}

export interface TerminalRef {
  addOutput: (content: string) => void;
  addError: (content: string) => void;
  addSuccess: (content: string) => void;
  addWarning: (content: string) => void;
  addInfo: (content: string) => void;
  clear: () => void;
  requestInput: () => void;
}

const InteractiveTerminal = forwardRef<TerminalRef, InteractiveTerminalProps>(({
  isCollapsed,
  onToggleCollapse,
  height,
  onInput,
  isExecuting
}, ref) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isClient, setIsClient] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    setLines([{
      type: 'info', 
      content: 'Terminal ready',
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current && !isExecuting) {
      inputRef.current.focus();
    }
  }, [isExecuting, isWaitingForInput]);

  // Expose terminal methods through ref
  useImperativeHandle(ref, () => ({
    addOutput: (content: string) => {
      if (typeof content === 'string') {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line || lines.length === 1 || index === 0 || index === lines.length - 1) {
            addLine({ type: 'output', content: line });
          }
        });
      }
    },
    addError: (content: string) => {
      if (typeof content === 'string' && content.trim()) {
        addLine({ type: 'error', content: content });
      }
    },
    addSuccess: (content: string) => {
      if (typeof content === 'string' && content.trim()) {
        addLine({ type: 'success', content: content });
      }
    },
    addWarning: (content: string) => {
      if (typeof content === 'string' && content.trim()) {
        addLine({ type: 'warning', content: content });
      }
    },
    addInfo: (content: string) => {
      if (typeof content === 'string' && content.trim()) {
        addLine({ type: 'info', content: content });
      }
    },
    clear: clearTerminal,
    requestInput: () => {
      setIsWaitingForInput(true);
      addLine({ type: 'info', content: 'Waiting for input...' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLine = useCallback((line: Omit<TerminalLine, 'timestamp' | 'id'>) => {
    const newLine: TerminalLine = {
      ...line,
      timestamp: Date.now(),
      id: generateId()
    };
    setLines(prev => [...prev, newLine]);
  }, []);

  const clearTerminal = useCallback(() => {
    setLines([]);
    addLine({ type: 'info', content: 'Terminal cleared' });
  }, [addLine]);

  const handleInputSubmit = () => {
    if (!currentInput.trim()) return;

    // Add command to terminal with system-like formatting
    addLine({ 
      type: 'input', 
      content: `${currentInput.trim()}` 
    });
    
    // Add to history
    setCommandHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== currentInput.trim()) {
        newHistory.push(currentInput.trim());
        if (newHistory.length > 100) {
          newHistory.shift();
        }
      }
      return newHistory;
    });
    setHistoryIndex(-1);

    // Execute command
    if (onInput) {
      onInput(currentInput.trim());
    }

    setCurrentInput('');
    setIsWaitingForInput(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setCurrentInput('');
      addLine({ type: 'warning', content: 'Process interrupted (Ctrl+C)' });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete for common commands
      const commonCommands = ['clear', 'help', 'exit', 'ls', 'pwd', 'echo'];
      const matches = commonCommands.filter(cmd => cmd.startsWith(currentInput));
      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      }
    }
  };

  const copyTerminalContent = () => {
    const content = lines.map(line => line.content).join('\n');
    navigator.clipboard.writeText(content);
    addLine({ type: 'success', content: 'Terminal content copied to clipboard' });
  };

  const downloadTerminalLog = () => {
    const content = lines.map(line => 
      `[${new Date(line.timestamp).toISOString()}] ${line.type.toUpperCase()}: ${line.content}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLine({ type: 'success', content: 'Terminal log downloaded' });
  };

  const getLineIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return '✗';
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      case 'input': return '$';
      default: return '';
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return 'text-destructive';
      case 'success': return 'text-primary';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-400';
      case 'input': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Enhanced global terminal methods (for backward compatibility)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      (window as unknown as { terminal?: unknown }).terminal = {
        addOutput: (content: string) => {
          if (typeof content === 'string') {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line || lines.length === 1 || index === 0 || index === lines.length - 1) {
                addLine({ type: 'output', content: line });
              }
            });
          }
        },
        addError: (content: string) => {
          if (typeof content === 'string' && content.trim()) {
            addLine({ type: 'error', content: content });
          }
        },
        addSuccess: (content: string) => {
          if (typeof content === 'string' && content.trim()) {
            addLine({ type: 'success', content: content });
          }
        },
        addWarning: (content: string) => {
          if (typeof content === 'string' && content.trim()) {
            addLine({ type: 'warning', content: content });
          }
        },
        addInfo: (content: string) => {
          if (typeof content === 'string' && content.trim()) {
            addLine({ type: 'info', content: content });
          }
        },
        clear: clearTerminal,
        requestInput: () => {
          setIsWaitingForInput(true);
          addLine({ type: 'info', content: 'Waiting for input...' });
        }
      };
    }
  }, [isClient, addLine, clearTerminal]);

  if (isCollapsed) {
    return (
      <div className="border-t border-border bg-background">
        <button
          onClick={onToggleCollapse}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-primary" />
            <span className="text-primary text-sm font-medium">Terminal</span>
            {lines.length > 0 && (
              <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
                {lines.length} lines
              </span>
            )}
          </div>
          <ChevronUp size={16} className="text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`border-t border-border bg-background text-foreground font-mono transition-all duration-300 ${
        isMaximized ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ height: isMaximized ? '100vh' : `${height}px` }}
    >
      {/* Modern header bar */}
      <div className="px-4 py-2 border-b border-border bg-card backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              <span className="text-primary font-medium text-sm">Terminal</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-1 rounded">{lines.length} lines</span>
              <span className="bg-muted px-2 py-1 rounded">{commandHistory.length} history</span>
              {isExecuting && (
                <div className="flex items-center gap-1 bg-destructive/20 px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-destructive">Running</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Decrease font size"
            >
              -
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{fontSize}px</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Increase font size"
            >
              +
            </Button>
            
            <div className="w-px h-4 bg-border mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={copyTerminalContent}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Copy content"
            >
              <Copy size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTerminalLog}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Download log"
            >
              <Download size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Clear terminal"
            >
              <Trash2 size={12} />
            </Button>
            
            <div className="w-px h-4 bg-border mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Collapse"
            >
              <ChevronDown size={12} />
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex-1 flex flex-col" style={{ height: isMaximized ? 'calc(100vh - 45px)' : `${height - 45}px` }}>
        {/* Terminal output area */}
        <div 
          ref={terminalRef}
          className="flex-1 p-3 overflow-y-auto bg-background scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground"
          style={{ 
            fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
            fontSize: `${fontSize}px`,
            lineHeight: 1.4
          }}
        >
          {lines.length === 0 && (
            <div className="text-muted-foreground text-center py-12">
              <Terminal size={48} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm font-medium">Terminal Ready</div>
              <div className="text-xs mt-1 opacity-70">Type commands below or run code to see output</div>
            </div>
          )}
          
          {lines.map((line) => (
            <div 
              key={line.id} 
              className="group hover:bg-accent/50 px-2 py-0.5 rounded transition-colors cursor-text"
            >
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground text-xs w-16 select-none shrink-0 font-mono">
                  {formatTimestamp(line.timestamp)}
                </span>
                <span className="w-5 text-center shrink-0 text-xs">
                  {getLineIcon(line.type)}
                </span>
                <span className={`flex-1 ${getLineColor(line.type)} break-words whitespace-pre-wrap`}>
                  {line.content}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input area - sticky at bottom */}
        <div className="bg-card border-t border-border p-3">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs w-16 select-none shrink-0 font-mono">
              {formatTimestamp(Date.now())}
            </span>
            <span className="w-5 text-center text-primary shrink-0 text-sm font-bold">$</span>
            <div className="flex-1 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-primary outline-none border-none placeholder:text-muted-foreground"
                placeholder={isWaitingForInput ? "Waiting for input..." : "Type command and press Enter..."}
                disabled={isExecuting && !isWaitingForInput}
                style={{ 
                  fontFamily: 'inherit',
                  fontSize: `${fontSize}px`
                }}
              />
              {currentInput && (
                <Button
                  onClick={handleInputSubmit}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs h-6 rounded"
                  disabled={isExecuting && !isWaitingForInput}
                  title="Execute command"
                >
                  <Play size={10} className="mr-1" />
                  Run
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="px-3 py-1.5 bg-muted border-t border-border text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <span>↵ Execute</span>
              <span>↑↓ History</span>
              <span>⇥ Complete</span>
              <span>^L Clear</span>
              <span>^C Cancel</span>
            </div>
            <div className="flex gap-3">
              <span>Font: {fontSize}px</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                isExecuting 
                  ? 'bg-destructive/20 text-destructive' 
                  : 'bg-primary/20 text-primary'
              }`}>
                {isExecuting ? 'BUSY' : 'READY'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InteractiveTerminal.displayName = 'InteractiveTerminal';

export default InteractiveTerminal;
