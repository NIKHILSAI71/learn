import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const TIMEOUT_MS = 30000;
const activeProcesses = new Map<string, ChildProcess>();

export async function POST(request: NextRequest) {
  try {
    const { source_code, language, input_data, debug_mode, session_id, terminal_command } = await request.json();

    if (terminal_command) {
      const result = await executeTerminalCommand(terminal_command);
      return NextResponse.json(result);
    }

    if (!source_code || !language) {
      return NextResponse.json(
        { error: 'Source code and language are required' },
        { status: 400 }
      );
    }

    if (session_id && input_data && activeProcesses.has(session_id)) {
      const process = activeProcesses.get(session_id);
      if (process && process.stdin) {
        try {
          process.stdin.write(input_data + '\n');
          return NextResponse.json({ status: 'input_sent' });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to send input to process' },
            { status: 500 }
          );
        }
      }
    }

    const result = await executeCode(source_code, language, input_data, debug_mode, session_id);
    return NextResponse.json(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Code execution failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function executeCode(
  code: string, 
  language: string, 
  inputData?: string, 
  debugMode?: boolean, 
  sessionId?: string
): Promise<any> {
  const tempDir = join(tmpdir(), 'code-execution');
  
  try {
    mkdirSync(tempDir, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }

  const timestamp = Date.now();
  const config = getLanguageConfig(language, code, tempDir, timestamp, debugMode);
  
  if (!config) {
    return {
      stdout: '',
      stderr: 'Unsupported language',
      status: { id: 6, description: 'Compilation Error' },
      time: '0',
      memory: 0,
      interactive: false
    };
  }

  let filePath: string | null = null;
  
  try {
    if (config.filename) {
      filePath = join(tempDir, config.filename);
      writeFileSync(filePath, code);
    }

    let result;
    if (config.runCommand) {
      result = await executeCompiledLanguage(config, tempDir, inputData, debugMode, sessionId);
    } else {
      result = await runCommand(config.command, config.args, tempDir, inputData, debugMode, sessionId);
    }
    
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      status: { 
        id: result.exitCode === 0 ? 3 : 6, 
        description: result.exitCode === 0 ? 'Accepted' : 'Runtime Error'
      },
      time: (result.executionTime / 1000).toFixed(3),
      memory: 0,
      interactive: result.interactive || false,
      session_id: result.sessionId,
      debug_info: result.debugInfo
    };

  } finally {
    if (filePath && !debugMode) {
      try {
        unlinkSync(filePath);
      } catch (e) {}
    }
    
    if (config.cleanup && !debugMode) {
      config.cleanup.forEach((file: string) => {
        try {
          unlinkSync(join(tempDir, file));
        } catch (e) {}
      });
    }
  }
}

function getLanguageConfig(language: string, code: string, tempDir: string, timestamp: number, debugMode?: boolean) {
  const configs: Record<string, any> = {
    // Interpreted Languages
    'Python': {
      command: 'python',
      args: debugMode ? ['-u', '-c', addDebugCode(code, 'python')] : ['-u', '-c', code],
      filename: null,
      interactive: true
    },
    'JavaScript': {
      command: 'node',
      args: debugMode ? ['--inspect-brk', '-e', addDebugCode(code, 'javascript')] : ['-e', code],
      filename: null,
      interactive: true
    },
    'TypeScript': {
      filename: `main_${timestamp}.ts`,
      command: 'npx',
      args: ['ts-node', `main_${timestamp}.ts`],
      cleanup: [],
      interactive: false
    },
    'PHP': {
      filename: `main_${timestamp}.php`,
      command: 'php',
      args: [`main_${timestamp}.php`],
      cleanup: [],
      interactive: false
    },
    'Ruby': {
      filename: `main_${timestamp}.rb`,
      command: 'ruby',
      args: [`main_${timestamp}.rb`],
      cleanup: [],
      interactive: false
    },
    'Perl': {
      filename: `main_${timestamp}.pl`,
      command: 'perl',
      args: [`main_${timestamp}.pl`],
      cleanup: [],
      interactive: false
    },
    'Lua': {
      filename: `main_${timestamp}.lua`,
      command: 'lua',
      args: [`main_${timestamp}.lua`],
      cleanup: [],
      interactive: false
    },
    'R': {
      filename: `main_${timestamp}.r`,
      command: 'Rscript',
      args: [`main_${timestamp}.r`],
      cleanup: [],
      interactive: false
    },
    'Shell': {
      filename: `main_${timestamp}.sh`,
      command: process.platform === 'win32' ? 'cmd' : 'bash',
      args: process.platform === 'win32' ? ['/c', `main_${timestamp}.sh`] : [`main_${timestamp}.sh`],
      cleanup: [],
      interactive: false
    },
    'PowerShell': {
      filename: `main_${timestamp}.ps1`,
      command: 'powershell',
      args: ['-ExecutionPolicy', 'Bypass', '-File', `main_${timestamp}.ps1`],
      cleanup: [],
      interactive: false
    },

    // Compiled Languages
    'Java': {
      filename: `Main_${timestamp}.java`,
      command: 'javac',
      args: [`Main_${timestamp}.java`],
      runCommand: 'java',
      runArgs: [`Main_${timestamp}`],
      cleanup: [`Main_${timestamp}.class`],
      interactive: false
    },
    'C': {
      filename: `main_${timestamp}.c`,
      command: 'gcc',
      args: debugMode ? ['-g', `main_${timestamp}.c`, '-o', `main_${timestamp}`] : [`main_${timestamp}.c`, '-o', `main_${timestamp}`],
      runCommand: `.${process.platform === 'win32' ? '\\' : '/'}main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`,
      runArgs: [],
      cleanup: [`main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`],
      interactive: false
    },
    'C++': {
      filename: `main_${timestamp}.cpp`,
      command: 'g++',
      args: debugMode ? ['-g', `main_${timestamp}.cpp`, '-o', `main_${timestamp}`] : [`main_${timestamp}.cpp`, '-o', `main_${timestamp}`],
      runCommand: `.${process.platform === 'win32' ? '\\' : '/'}main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`,
      runArgs: [],
      cleanup: [`main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`],
      interactive: false
    },
    'C#': {
      filename: `main_${timestamp}.cs`,
      command: 'csc',
      args: [`main_${timestamp}.cs`],
      runCommand: `.${process.platform === 'win32' ? '\\' : '/'}main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`,
      runArgs: [],
      cleanup: [`main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`],
      interactive: false
    },
    'Go': {
      filename: `main_${timestamp}.go`,
      command: 'go',
      args: ['run', `main_${timestamp}.go`],
      cleanup: [],
      interactive: false
    },
    'Rust': {
      filename: `main_${timestamp}.rs`,
      command: 'rustc',
      args: [`main_${timestamp}.rs`, '-o', `main_${timestamp}`],
      runCommand: `.${process.platform === 'win32' ? '\\' : '/'}main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`,
      runArgs: [],
      cleanup: [`main_${timestamp}${process.platform === 'win32' ? '.exe' : ''}`],
      interactive: false
    },
    'Swift': {
      filename: `main_${timestamp}.swift`,
      command: 'swift',
      args: [`main_${timestamp}.swift`],
      cleanup: [],
      interactive: false
    },
    'Kotlin': {
      filename: `main_${timestamp}.kt`,
      command: 'kotlinc',
      args: [`main_${timestamp}.kt`, '-include-runtime', '-d', `main_${timestamp}.jar`],
      runCommand: 'java',
      runArgs: ['-jar', `main_${timestamp}.jar`],
      cleanup: [`main_${timestamp}.jar`],
      interactive: false
    },
    'Scala': {
      filename: `main_${timestamp}.scala`,
      command: 'scala',
      args: [`main_${timestamp}.scala`],
      cleanup: [],
      interactive: false
    },
    'Dart': {
      filename: `main_${timestamp}.dart`,
      command: 'dart',
      args: ['run', `main_${timestamp}.dart`],
      cleanup: [],
      interactive: false
    },
    'Elixir': {
      filename: `main_${timestamp}.exs`,
      command: 'elixir',
      args: [`main_${timestamp}.exs`],
      cleanup: [],
      interactive: false
    },

    // Markup and Data Languages (basic execution/validation)
    'HTML': {
      filename: `main_${timestamp}.html`,
      command: 'echo',
      args: ['HTML file created successfully'],
      cleanup: [],
      interactive: false
    },
    'CSS': {
      filename: `main_${timestamp}.css`,
      command: 'echo',
      args: ['CSS file created successfully'],
      cleanup: [],
      interactive: false
    },
    'JSON': {
      command: 'node',
      args: ['-e', `try { JSON.parse(\`${code.replace(/`/g, '\\`')}\`); console.log('Valid JSON'); } catch(e) { console.error('Invalid JSON:', e.message); }`],
      filename: null,
      interactive: false
    },
    'XML': {
      filename: `main_${timestamp}.xml`,
      command: 'echo',
      args: ['XML file created successfully'],
      cleanup: [],
      interactive: false
    },
    'SQL': {
      filename: `main_${timestamp}.sql`,
      command: 'echo',
      args: ['SQL script created successfully. Connect to a database to execute.'],
      cleanup: [],
      interactive: false
    },
    'MATLAB': {
      filename: `main_${timestamp}.m`,
      command: 'octave',
      args: ['--eval', `run('main_${timestamp}.m')`],
      cleanup: [],
      interactive: false
    }
  };

  return configs[language];
}

function addDebugCode(code: string, language: string): string {
  switch (language) {
    case 'python':
      return `
import sys
import traceback

# Debug wrapper for Python
class DebugWrapper:
    def __init__(self):
        self.line_number = 0
        self.variables = {}
    
    def trace_calls(self, frame, event, arg):
        if event == 'line':
            self.line_number = frame.f_lineno
            self.variables = {k: str(v) for k, v in frame.f_locals.items() if not k.startswith('__')}
            print(f"DEBUG: Line {self.line_number}, Variables: {self.variables}", file=sys.stderr)
        return self.trace_calls

debug_wrapper = DebugWrapper()
sys.settrace(debug_wrapper.trace_calls)

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    traceback.print_exc()
`;

    case 'javascript':
      return `
// Debug wrapper for JavaScript
console.error('DEBUG: Starting execution');
try {
${code.split('\n').map(line => '    ' + line).join('\n')}
} catch (error) {
    console.error('ERROR:', error.message);
    throw error;
}
console.error('DEBUG: Execution completed');
`;

    default:
      return code;
  }
}

async function runCommand(
  command: string, 
  args: string[], 
  cwd: string, 
  inputData?: string, 
  debugMode?: boolean, 
  sessionId?: string
): Promise<any> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const actualSessionId = sessionId || `session_${Date.now()}`;
    
    const child = spawn(command, args, { 
      cwd,
      shell: true,
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    if (sessionId) {
      activeProcesses.set(actualSessionId, child);
    }

    let stdout = '';
    let stderr = '';
    let isInteractive = false;

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      
      // Check if program is waiting for input
      if (output.includes('input') || output.includes('Enter') || output.includes(':')) {
        isInteractive = true;
      }
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Send input if provided
    if (inputData && child.stdin) {
      child.stdin.write(inputData + '\n');
    }

    child.on('close', (code) => {
      const executionTime = Date.now() - startTime;
      if (sessionId) {
        activeProcesses.delete(actualSessionId);
      }
      
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code || 0,
        executionTime,
        interactive: isInteractive,
        sessionId: actualSessionId,
        debugInfo: debugMode ? parseDebugInfo(stderr) : null
      });
    });

    child.on('error', (error) => {
      const executionTime = Date.now() - startTime;
      if (sessionId) {
        activeProcesses.delete(actualSessionId);
      }
      
      resolve({
        stdout: '',
        stderr: `Execution error: ${error.message}`,
        exitCode: 1,
        executionTime,
        interactive: false,
        sessionId: actualSessionId
      });
    });

    setTimeout(() => {
      child.kill();
      if (sessionId) {
        activeProcesses.delete(actualSessionId);
      }
      resolve({
        stdout: stdout.trim(),
        stderr: 'Execution timed out',
        exitCode: 124,
        executionTime: TIMEOUT_MS,
        interactive: isInteractive,
        sessionId: actualSessionId
      });
    }, TIMEOUT_MS);
  });
}

async function executeCompiledLanguage(
  config: any, 
  tempDir: string, 
  inputData?: string, 
  debugMode?: boolean, 
  sessionId?: string
): Promise<any> {
  const compileResult = await runCommand(config.command, config.args, tempDir);
  
  if (compileResult.exitCode !== 0) {
    return {
      stdout: '',
      stderr: compileResult.stderr || 'Compilation failed',
      exitCode: compileResult.exitCode,
      executionTime: compileResult.executionTime,
      interactive: false,
      sessionId: sessionId || `session_${Date.now()}`
    };
  }

  return await runCommand(config.runCommand, config.runArgs, tempDir, inputData, debugMode, sessionId);
}

function parseDebugInfo(stderr: string) {
  const debugLines = stderr.split('\n').filter(line => line.includes('DEBUG:'));
  const lastDebugLine = debugLines[debugLines.length - 1];
  
  if (lastDebugLine) {
    const lineMatch = lastDebugLine.match(/Line (\d+)/);
    const variablesMatch = lastDebugLine.match(/Variables: ({.*})/);
    
    return {
      currentLine: lineMatch ? parseInt(lineMatch[1]) : 0,
      variables: variablesMatch ? JSON.parse(variablesMatch[1].replace(/'/g, '"')) : {},
      stack: ['main()']
    };
  }
  
  return null;
}

async function executeTerminalCommand(command: string): Promise<any> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Split command and arguments
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    
    const child = spawn(cmd, args, { 
      shell: true,
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const executionTime = Date.now() - startTime;
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code || 0,
        executionTime,
        success: code === 0
      });
    });

    child.on('error', (error) => {
      const executionTime = Date.now() - startTime;
      resolve({
        stdout: '',
        stderr: `Command error: ${error.message}`,
        exitCode: 1,
        executionTime,
        success: false
      });
    });

    setTimeout(() => {
      child.kill();
      resolve({
        stdout: stdout.trim(),
        stderr: 'Command timed out',
        exitCode: 124,
        executionTime: TIMEOUT_MS,
        success: false
      });
    }, TIMEOUT_MS);
  });
}

// Cleanup endpoint
export async function DELETE(request: NextRequest) {
  const { session_id } = await request.json();
  
  if (session_id && activeProcesses.has(session_id)) {
    const process = activeProcesses.get(session_id);
    if (process) {
      process.kill();
      activeProcesses.delete(session_id);
    }
  }
  
  return NextResponse.json({ status: 'cleaned_up' });
}
