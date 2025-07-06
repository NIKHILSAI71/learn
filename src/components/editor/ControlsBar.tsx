'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Play, Loader2 } from 'lucide-react';
import { Language } from '@/types';

interface ControlsBarProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onRunCode: () => void;
  isExecuting: boolean;
  executionTimeout: number;
  setExecutionTimeout: (timeout: number) => void;
  memoryLimit: number;
  setMemoryLimit: (limit: number) => void;
  languages: Language[];
}

export default function ControlsBar({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  isExecuting,
  executionTimeout,
  setExecutionTimeout,
  memoryLimit,
  setMemoryLimit,
  languages
}: ControlsBarProps) {
  return (
    <div className="p-4 border-b border-border bg-card">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Language:</label>
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 bg-input border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {languages.map((language) => (
                <SelectItem 
                  key={language} 
                  value={language}
                  className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 text-white hover:text-gray-300 transition-colors">
                <Settings size={20} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Advanced Settings</DialogTitle>
                <DialogDescription>
                  Configure execution parameters for your code.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div>
                  <label className="text-sm font-medium">Execution Timeout (seconds)</label>
                  <input
                    type="number"
                    value={executionTimeout}
                    onChange={(e) => setExecutionTimeout(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm bg-input border border-border rounded-md"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Memory Limit (KB)</label>
                  <input
                    type="number"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-sm bg-input border border-border rounded-md"
                    min="16000"
                    max="512000"
                    step="1000"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Run Code Button */}
          <Button
            onClick={onRunCode}
            disabled={isExecuting}
            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isExecuting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
