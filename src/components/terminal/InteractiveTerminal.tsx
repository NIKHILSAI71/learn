'use client';

import { useState, useRef, useEffect, KeyboardEvent, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Terminal, Copy, Download, Trash2, 
  ChevronUp, ChevronDown, Maximize2 
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
  activeTab: 'terminal' | 'debug';
  onTabChange: (tab: 'terminal' | 'debug') => void;
  height: number;
  onInput?: (input: string) => void;
  isExecuting: boolean;
  onDebugAction?: (action: 'start' | 'stop' | 'step' | 'continue' | 'restart') => void;
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
  activeTab,
  onTabChange,
  height,
  onInput,
  isExecuting,
  onDebugAction
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
    // Initialize with welcome message
    addLine({ 
      type: 'success', 
      content: 'Terminal initialized - Ready for code execution' 
    });
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
  }), []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLine = (line: Omit<TerminalLine, 'timestamp' | 'id'>) => {
    const newLine: TerminalLine = {
      ...line,
      timestamp: Date.now(),
      id: generateId()
    };
    setLines(prev => [...prev, newLine]);
  };

  const handleInputSubmit = () => {
    if (!currentInput.trim()) return;

    // Add command to terminal with proper formatting
    addLine({ 
      type: 'input', 
      content: `> ${currentInput.trim()}` 
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

  const clearTerminal = () => {
    setLines([]);
    addLine({ type: 'info', content: 'Terminal cleared' });
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
      case 'error': return '!';
      case 'success': return '+';
      case 'warning': return '?';
      case 'info': return 'i';
      case 'input': return '>';
      default: return ' ';
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'input': return 'text-cyan-400';
      default: return 'text-gray-300';
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
      (window as any).terminal = {
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
  }, [isClient]);

  if (isCollapsed) {
    return (
      <div className="border-t border-gray-700 bg-black">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-mono">Terminal</span>
            {lines.length > 0 && (
              <span className="text-gray-500 text-xs">({lines.length} lines)</span>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border-t border-gray-700 bg-gradient-to-b from-gray-900 to-black text-green-400 font-mono transition-all duration-300 ${
        isMaximized ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ height: isMaximized ? '100vh' : `${height}px` }}
    >
      {/* Advanced header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-green-400" />
              <span className="text-green-400 font-semibold">Advanced Terminal</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>Lines: {lines.length}</span>
              <span>History: {commandHistory.length}</span>
              {isExecuting && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400">Running</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Decrease font size"
            >
              -
            </Button>
            <span className="text-xs text-gray-500 w-8 text-center">{fontSize}px</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Increase font size"
            >
              +
            </Button>
            
            <div className="w-px h-6 bg-gray-600 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={copyTerminalContent}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Copy content"
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTerminalLog}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Download log"
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Clear terminal"
            >
              <Trash2 size={14} />
            </Button>
            
            <div className="w-px h-6 bg-gray-600 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              <Maximize2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              title="Collapse"
            >
              <ChevronDown size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex-1 flex flex-col" style={{ height: isMaximized ? 'calc(100vh - 65px)' : `${height - 65}px` }}>
        {/* Terminal output area */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto bg-black/80 backdrop-blur-sm"
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
            fontSize: `${fontSize}px`,
            lineHeight: 1.5
          }}
        >
          {lines.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              <Terminal size={48} className="mx-auto mb-2 opacity-50" />
              <div>Terminal is ready</div>
              <div className="text-sm mt-1">Type commands below or run code to see output</div>
            </div>
          )}
          
          {lines.map((line) => (
            <div 
              key={line.id} 
              className="mb-1 flex items-start gap-3 group hover:bg-gray-800/20 px-2 py-1 rounded transition-colors"
            >
              <span className="text-gray-500 text-xs w-20 select-none shrink-0">
                {formatTimestamp(line.timestamp)}
              </span>
              <span className="w-6 text-center shrink-0">
                {getLineIcon(line.type)}
              </span>
              <span className={`flex-1 ${getLineColor(line.type)} break-words whitespace-pre-wrap`}>
                {line.content}
              </span>
            </div>
          ))}
          
          {/* Current input line */}
          <div className="flex items-start gap-3 px-2 py-1 bg-gray-800/30 rounded sticky bottom-0">
            <span className="text-gray-500 text-xs w-20 select-none shrink-0">
              {formatTimestamp(Date.now())}
            </span>
            <span className="w-6 text-center text-green-400 shrink-0">{'>'}</span>
            <div className="flex-1 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-green-400 outline-none border-none"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs h-6"
                  disabled={isExecuting && !isWaitingForInput}
                >
                  Execute
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-700 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <span>Enter: Execute</span>
              <span>↑↓: History</span>
              <span>Tab: Autocomplete</span>
              <span>Ctrl+L: Clear</span>
              <span>Ctrl+C: Interrupt</span>
            </div>
            <div className="flex gap-4">
              <span>Font: {fontSize}px</span>
              <span className={isExecuting ? 'text-yellow-400' : 'text-green-400'}>
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
