export interface Question {
  title: string;
  description: string;
  constraints: string;
  examples: Example[];
  difficulty?: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  solutionTemplate?: string;
  sampleCode?: {
    language: string;
    code: string;
  } | null;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
  interactive?: boolean;
  session_id?: string;
  debug_info?: DebugInfo;
}

export interface DebugInfo {
  currentLine: number;
  variables: Record<string, unknown>;
  stack: string[];
  state?: 'running' | 'paused' | 'stopped';
}

export type Language = 
  | 'Python' | 'Java' | 'JavaScript' | 'TypeScript' | 'C' | 'C++' | 'C#'
  | 'Go' | 'Rust' | 'PHP' | 'Ruby' | 'Swift' | 'Kotlin' | 'Scala'
  | 'R' | 'MATLAB' | 'SQL' | 'HTML' | 'CSS' | 'JSON' | 'XML'
  | 'Shell' | 'PowerShell' | 'Perl' | 'Lua' | 'Dart' | 'Elixir';

export type Topic = 'Arrays' | 'Strings' | 'Dynamic Programming' | 'Graphs' | 'Trees' | 'Sorting' | 'Searching' | 'Hash Tables' | 'Linked Lists' | 'Stack and Queue' | 'Custom';

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface CodeEditorProps {
  language: Language;
  code: string;
  onChange: (code: string) => void;
}

export interface QuestionPanelProps {
  question: Question | null;
  onGenerateQuestion: (topic: Topic, difficulty: Difficulty) => void;
  isLoading: boolean;
}
