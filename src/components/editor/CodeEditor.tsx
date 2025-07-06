'use client';

import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Language } from '@/types';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

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
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;
    
    // Define a theme that matches the website's design system
    monaco.editor.defineTheme('websiteTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'e5e5e5' }, // --foreground
        { token: 'comment', foreground: 'a3a3a3', fontStyle: 'italic' }, // --muted-foreground
        { token: 'keyword', foreground: '3b82f6', fontStyle: 'bold' }, // --primary
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'identifier', foreground: 'e5e5e5' }, // --foreground
        { token: 'type', foreground: '06b6d4' },
        { token: 'function', foreground: '3b82f6' }, // --primary
        { token: 'variable', foreground: 'e5e5e5' }, // --foreground
        { token: 'constant', foreground: 'f97316' },
        { token: 'delimiter', foreground: 'a3a3a3' }, // --muted-foreground
        { token: 'operator', foreground: 'ec4899' },
      ],
      colors: {
        'editor.background': '#1a1a1a', // --background
        'editor.foreground': '#e5e5e5', // --foreground
        'editor.lineHighlightBackground': '#262626', // --card
        'editor.selectionBackground': '#3b82f650', // --primary with opacity
        'editor.inactiveSelectionBackground': '#40404050', // --secondary with opacity
        'editorLineNumber.foreground': '#a3a3a3', // --muted-foreground
        'editorLineNumber.activeForeground': '#e5e5e5', // --foreground
        'editorCursor.foreground': '#3b82f6', // --primary
        'editorWhitespace.foreground': '#404040', // --secondary
        'editorIndentGuide.background': '#404040', // --secondary
        'editorIndentGuide.activeBackground': '#525252', // --accent
        'editorGutter.background': '#1a1a1a', // --background
        'scrollbarSlider.background': '#40404050', // --secondary with opacity
        'scrollbarSlider.hoverBackground': '#52525260', // --accent with opacity
        'scrollbarSlider.activeBackground': '#52525270', // --accent with opacity
        'editor.findMatchBackground': '#3b82f650', // --primary with opacity
        'editor.findMatchHighlightBackground': '#3b82f630', // --primary with opacity
        'editorWidget.background': '#262626', // --card
        'editorWidget.border': '#404040', // --border
        'editorSuggestWidget.background': '#262626', // --card
        'editorSuggestWidget.border': '#404040', // --border
        'editorSuggestWidget.foreground': '#e5e5e5', // --foreground
        'editorSuggestWidget.selectedBackground': '#525252', // --accent
        'editorHoverWidget.background': '#262626', // --card
        'editorHoverWidget.border': '#404040', // --border
        'input.background': '#262626', // --input
        'input.border': '#404040', // --border
        'input.foreground': '#e5e5e5', // --foreground
        'inputOption.activeBorder': '#3b82f6', // --primary
        'focusBorder': '#3b82f6', // --ring
      },
    });
    
    monaco.editor.setTheme('websiteTheme');

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
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Run code shortcut (placeholder)
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
        theme="websiteTheme"
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
