import { Language } from '@/types';

export const LANGUAGES: Language[] = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#',
  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala',
  'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'JSON', 'XML',
  'Shell', 'PowerShell', 'Perl', 'Lua', 'Dart', 'Elixir'
];

export const DEFAULT_VALUES = {
  SIDEBAR_WIDTH: 400,
  OUTPUT_HEIGHT: 192,
  EXECUTION_TIMEOUT: 10,
  MEMORY_LIMIT: 128000,
} as const;
