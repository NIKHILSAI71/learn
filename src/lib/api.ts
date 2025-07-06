import axios from 'axios';
import { Language, Topic, Question, ExecutionResult, Difficulty } from '@/types';

export const generateQuestion = async (language: Language, topic: Topic, difficulty: Difficulty): Promise<Question> => {
  try {
    const response = await axios.post('/api/generate-question', {
      language: language.toLowerCase(),
      topic: topic.toLowerCase().replace(/\s+/g, '_'),
      difficulty: difficulty.toLowerCase()
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 408) {
        throw new Error('Request timed out');
      } else if (error.response?.status === 503) {
        throw new Error('Service unavailable');
      } else if (error.response?.status === 404) {
        throw new Error('Service not found');
      }
    }
    throw new Error('Failed to generate question');
  }
};

export const executeCodeInteractive = async (
  code: string, 
  language: Language, 
  inputData?: string, 
  debugMode?: boolean, 
  sessionId?: string
): Promise<ExecutionResult & { interactive?: boolean; session_id?: string; debug_info?: unknown }> => {
  try {
    const response = await axios.post('/api/execute-interactive', {
      source_code: code,
      language: language,
      input_data: inputData,
      debug_mode: debugMode,
      session_id: sessionId
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Code execution failed';
      throw new Error(errorMessage);
    }
    throw new Error('Failed to execute code');
  }
};

export const executeTerminalCommand = async (command: string): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  success: boolean;
}> => {
  try {
    const response = await axios.post('/api/execute-interactive', {
      terminal_command: command
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Terminal command failed';
      throw new Error(errorMessage);
    }
    throw new Error('Failed to execute terminal command');
  }
};

export const sendInput = async (sessionId: string, input: string): Promise<void> => {
  try {
    await axios.post('/api/execute-interactive', {
      session_id: sessionId,
      input_data: input
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to send input';
      throw new Error(errorMessage);
    }
    throw new Error('Failed to send input');
  }
};

export const stopSession = async (sessionId: string): Promise<void> => {
  try {
    await axios.delete('/api/execute-interactive', {
      data: { session_id: sessionId }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Failed to stop session';
      throw new Error(errorMessage);
    }
    throw new Error('Failed to stop session');
  }
};
