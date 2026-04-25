import { DSATopic } from './learner';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  topic: DSATopic;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  hints: [string, string, string];
  solution: string;
  time_complexity: string;
  space_complexity: string;
  companies: string[];
  constraints?: string[];
}

export type ProgrammingLanguage = 'python' | 'java' | 'cpp' | 'javascript';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface ExecutionResult {
  passed: boolean;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  status: string;
}
