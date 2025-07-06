import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface QuestionData {
  title?: string;
  description?: string;
  input?: {
    format?: string;
    constraints?: string[];
  };
  output?: {
    format?: string;
  };
  sample?: {
    input?: Record<string, unknown> | string;
    output?: unknown;
    explanation?: string;
  };
  sample_code?: {
    language?: string;
    code?: string;
  };
  difficulty?: string;
}

interface ProcessedQuestion {
  title: string;
  description: string;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  difficulty: string;
  sampleCode: {
    language: string;
    code: string;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const { language, topic, difficulty } = await request.json();
    
    if (!language || !topic || !difficulty) {
      return NextResponse.json(
        { error: 'Language, topic, and difficulty are required' },
        { status: 400 }
      );
    }
    
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl === 'your_n8n_webhook_url_here') {
      return NextResponse.json(
        { error: 'AI question generation service not configured. Please set up your n8n webhook URL.' },
        { status: 503 }
      );
    }

    const response = await axios.post(webhookUrl, {
      language: language.toLowerCase(),
      topic: topic.toLowerCase().replace(/\s+/g, '_'),
      difficulty: difficulty.toLowerCase()
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data;

    function processQuestionData(questionData: QuestionData): ProcessedQuestion {
      let description = '';
      
      if (questionData.title) {
        description = `# ${questionData.title}\n\n`;
      }
      
      if (questionData.description) {
        description += questionData.description + '\n\n';
      }
      
      if (questionData.input?.format) {
        description += '## Input Format\n' + questionData.input.format + '\n\n';
      }
      
      if (questionData.input?.constraints && Array.isArray(questionData.input.constraints)) {
        description += '## Constraints\n' + questionData.input.constraints
          .map((c: string) => `- ${c}`)
          .join('\n') + '\n\n';
      }
      
      if (questionData.output?.format) {
        description += '## Output Format\n' + questionData.output.format + '\n\n';
      }

      const examples = [];
      if (questionData.sample) {
        let inputStr = '';
        let outputStr = '';
        
        if (questionData.sample.input) {
          if (typeof questionData.sample.input === 'object') {
            const inputObj = questionData.sample.input as Record<string, unknown>;
            const inputLines: string[] = [];
            
            if (inputObj.N !== undefined) {
              if (inputObj.K !== undefined) {
                inputLines.push(`${inputObj.N} ${inputObj.K}`);
              } else {
                inputLines.push(`${inputObj.N}`);
              }
            }
            
            if (inputObj.A && Array.isArray(inputObj.A)) {
              inputLines.push(inputObj.A.join(' '));
            }
            
            for (const [key, value] of Object.entries(inputObj)) {
              if (key !== 'N' && key !== 'K' && key !== 'A') {
                if (Array.isArray(value)) {
                  inputLines.push(value.join(' '));
                } else {
                  inputLines.push(String(value));
                }
              }
            }
            
            inputStr = inputLines.join('\n');
          } else {
            inputStr = String(questionData.sample.input);
          }
        }
        
        if (questionData.sample.output !== undefined) {
          outputStr = String(questionData.sample.output);
        }
        
        if (inputStr || outputStr) {
          examples.push({
            input: inputStr,
            output: outputStr,
            explanation: questionData.sample.explanation || undefined
          });
        }
      }

      let sampleCode = null;
      if (questionData.sample_code) {
        sampleCode = {
          language: questionData.sample_code.language || 'python',
          code: questionData.sample_code.code || ''
        };
      }

      return {
        title: questionData.title || extractTitle(description, difficulty, topic),
        description: description,
        constraints: questionData.input?.constraints ? questionData.input.constraints.join('\n') : '',
        examples: examples,
        difficulty: questionData.difficulty || difficulty,
        sampleCode: sampleCode
      };
    }

    if (responseData && typeof responseData === 'object' && responseData.title) {
      return NextResponse.json(processQuestionData(responseData));
    }

    if (responseData && typeof responseData === 'object' && responseData.output) {
      const questionData = responseData.output;
      
      if (questionData && typeof questionData === 'object') {
        return NextResponse.json(processQuestionData(questionData));
      }
    }

    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.output) {
      const questionData = responseData[0].output;
      
      if (questionData && typeof questionData === 'object') {
        const actualQuestionData = questionData.description || questionData;
        
        if (typeof actualQuestionData === 'object' && actualQuestionData !== null) {
          return NextResponse.json(processQuestionData(actualQuestionData));
        } else {
          const parsedQuestion = {
            title: extractTitle(String(actualQuestionData), difficulty, topic),
            description: String(actualQuestionData),
            constraints: '',
            examples: [],
            difficulty,
            sampleCode: null
          };
          
          return NextResponse.json(parsedQuestion);
        }
      }
    }

    let markdownContent = '';
    if (typeof responseData === 'string') {
      markdownContent = responseData;
    } else if (responseData && (responseData.output || responseData.text)) {
      markdownContent = responseData.output || responseData.text;
    } else {
      markdownContent = JSON.stringify(responseData);
    }

    const parsedQuestion = {
      title: extractTitle(markdownContent, difficulty, topic),
      description: markdownContent,
      constraints: '',
      examples: [],
      difficulty,
      sampleCode: null
    };
    
    return NextResponse.json(parsedQuestion);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { 
            error: 'AI service request timed out. The n8n service may not be responding.',
            details: `Webhook URL: ${webhookUrl}`,
            suggestion: 'Please check if n8n is running and the webhook endpoint exists.'
          },
          { status: 408 }
        );
      } else if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            error: 'Cannot connect to AI service. Please ensure n8n is running on localhost:5678.',
            details: `Webhook URL: ${webhookUrl}`,
            suggestion: 'Start n8n service or check if the port 5678 is available.'
          },
          { status: 503 }
        );
      } else if (error.response?.status === 404) {
        return NextResponse.json(
          { 
            error: 'AI webhook endpoint not found. Please check your n8n workflow configuration.',
            details: `Webhook URL: ${webhookUrl}`,
            suggestion: 'Verify the webhook path "/webhook/learn" exists in your n8n workflow.'
          },
          { status: 404 }
        );
      } else if (error.response?.status) {
        return NextResponse.json(
          { 
            error: `AI service error: ${error.response.status} ${error.response.statusText}`,
            details: `Webhook URL: ${webhookUrl}`,
            responseData: error.response.data
          },
          { status: error.response.status }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate question. Please check your AI service configuration.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractTitle(content: string, difficulty: string, topic: string): string {
  if (!content || typeof content !== 'string') {
    return `${difficulty} ${topic} Problem`;
  }
  
  const titlePatterns = [
    /##?\s*Problem Title:\s*([^\n]+)/i,
    /##?\s*([^#\n]+(?:problem|challenge|task|exercise)[^#\n]*)/i,
    /##?\s*([^\n]+)/
  ];
  
  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return `${difficulty} ${topic} Problem`;
}
