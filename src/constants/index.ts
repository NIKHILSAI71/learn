import { Language } from '@/types';

export const LANGUAGES: Language[] = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#'
];

export const DEFAULT_VALUES = {
  SIDEBAR_WIDTH: 400,
  OUTPUT_HEIGHT: 192,
  EXECUTION_TIMEOUT: 10,
  MEMORY_LIMIT: 128000,
} as const;
