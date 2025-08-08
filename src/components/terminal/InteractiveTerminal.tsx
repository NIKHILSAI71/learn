'use client';

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Terminal, Trash2, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

interface TerminalLine {
  type: 'output' | 'input' | 'error' | 'success' | 'warning' | 'info';
  content: string;
  timestamp: number;
  id: string;
}

interface InteractiveTerminalProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isExecuting: boolean;
}

export interface TerminalRef {
  addOutput: (content: string) => void;
  addError: (content: string) => void;
  addSuccess: (content: string) => void;
  addWarning: (content: string) => void;
  addInfo: (content: string) => void;
  clear: () => void;
}

const InteractiveTerminal = forwardRef<TerminalRef, InteractiveTerminalProps>(({
  isCollapsed,
  onToggleCollapse,
  isExecuting
}, ref) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isClient, setIsClient] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setLines([{ type: 'info', content: 'Terminal ready', timestamp: Date.now(), id: Math.random().toString(36).substr(2, 9) }]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

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
    clear: clearTerminal
  }), [addLine, clearTerminal]);

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
      default: return 'text-white';
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
        clear: clearTerminal
      };
    }
  }, [isClient, addLine, clearTerminal]);

  if (isCollapsed) {
    return (
      <div className="border-t border-border bg-card text-foreground">
        <button
          onClick={onToggleCollapse}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors text-foreground"
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
          <PanelLeftOpen size={16} strokeWidth={2} className="text-foreground transform -rotate-90" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-background text-foreground font-mono flex flex-col h-full">
      {/* Simple header */}
      <div className="px-4 py-2 border-b border-border bg-card backdrop-blur flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-primary" />
            <span className="text-primary font-medium text-sm">Terminal</span>
            {isExecuting && (
              <div className="flex items-center gap-1 bg-destructive/20 px-2 py-1 rounded">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-destructive text-xs">Running</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={clearTerminal}
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-1 rounded"
              title="Clear terminal"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onToggleCollapse}
              className="text-foreground hover:bg-accent p-1 rounded"
              title="Collapse terminal"
            >
              <PanelLeftClose size={16} strokeWidth={2} className="text-foreground transform -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal output area */}
      <div 
        ref={terminalRef}
        className="flex-1 p-3 overflow-y-auto bg-background scrollbar-custom min-h-0"
        style={{ 
          fontFamily: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
          fontSize: '14px',
          lineHeight: 1.4
        }}
      >
        {lines.length === 0 && (
          <div className="text-muted-foreground text-center py-12">
            <Terminal size={48} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm font-medium">Output Ready</div>
            <div className="text-xs mt-1 opacity-70">Run code to see output here</div>
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
    </div>
  );
});

InteractiveTerminal.displayName = 'InteractiveTerminal';
export default InteractiveTerminal;