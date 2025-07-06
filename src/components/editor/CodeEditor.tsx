'use client';

import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Language } from '@/types';

interface CodeEditorProps {
  language: Language;
  code: string;
  onChange: (code: string) => void;
}

// Comprehensive language mapping for Monaco Editor
const languageMap: Record<Language, string> = {
  'Python': 'python',
  'Java': 'java',
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'C': 'c',
  'C++': 'cpp',
  'C#': 'csharp',
  'Go': 'go',
  'Rust': 'rust',
  'PHP': 'php',
  'Ruby': 'ruby',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'Scala': 'scala',
  'R': 'r',
  'MATLAB': 'matlab',
  'SQL': 'sql',
  'HTML': 'html',
  'CSS': 'css',
  'JSON': 'json',
  'XML': 'xml',
  'Shell': 'shell',
  'PowerShell': 'powershell',
  'Perl': 'perl',
  'Lua': 'lua',
  'Dart': 'dart',
  'Elixir': 'elixir',
};

export default function CodeEditor({ language, code, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Define a modern dark theme optimized for coding
    monaco.editor.defineTheme('modernDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'e4e4e7' },
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8b5cf6', fontStyle: 'bold' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'identifier', foreground: 'e4e4e7' },
        { token: 'type', foreground: '06b6d4' },
        { token: 'function', foreground: '3b82f6' },
        { token: 'variable', foreground: 'e4e4e7' },
        { token: 'constant', foreground: 'f97316' },
        { token: 'delimiter', foreground: 'd1d5db' },
        { token: 'operator', foreground: 'ec4899' },
      ],
      colors: {
        'editor.background': '#0f0f23',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#1e1e2e',
        'editor.selectionBackground': '#3b82f630',
        'editor.inactiveSelectionBackground': '#374151aa',
        'editorLineNumber.foreground': '#6b7280',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editorCursor.foreground': '#8b5cf6',
        'editorWhitespace.foreground': '#374151',
        'editorIndentGuide.background': '#374151',
        'editorIndentGuide.activeBackground': '#4b5563',
        'editorGutter.background': '#0f0f23',
        'scrollbarSlider.background': '#37415150',
        'scrollbarSlider.hoverBackground': '#4b556360',
        'scrollbarSlider.activeBackground': '#6b728070',
        'editor.findMatchBackground': '#8b5cf650',
        'editor.findMatchHighlightBackground': '#8b5cf630',
      },
    });
    
    monaco.editor.setTheme('modernDark');

    // Enable advanced features
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality (placeholder)
      console.log('Save shortcut pressed');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Run code shortcut (placeholder)
      console.log('Run code shortcut pressed');
    });
  };

  // Get the appropriate language for Monaco Editor
  const monacoLanguage = languageMap[language] || 'plaintext';

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme="modernDark"
        options={{
          // Core editor options
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          
          // Indentation and formatting
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          formatOnPaste: true,
          formatOnType: true,
          
          // Visual enhancements
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          
          // Code assistance
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          wordBasedSuggestions: 'currentDocument',
          bracketPairColorization: { enabled: true },
          
          // Selection and find
          find: {
            seedSearchStringFromSelection: 'selection',
            autoFindInSelection: 'never',
          },
          selectOnLineNumbers: true,
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          
          // Scrolling
          mouseWheelZoom: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
        }}
      />
    </div>
  );
}
