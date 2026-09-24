import type { Level, NotionId } from '../curriculum/notions';
export type Value = string | number | boolean | null | { ref: string };
export type EventType = 'line' | 'call' | 'return' | 'output' | 'error' | 'end';
export interface HeapObject {
  id: string;
  type: string;
  attributes?: Record<string, Value>;
  items?: Value[];
}
export interface Frame {
  id: string;
  name: string;
  line: number;
  parameters: string[];
  locals: Record<string, Value>;
}
export interface Step {
  line: number;
  event: EventType;
  stack: Frame[];
  globals: Record<string, Value>;
  objects: Record<string, HeapObject>;
  references: { source: string; target: string }[];
  stdout: string;
  returnValue?: Value;
  functionName?: string;
  callLine?: number;
  resumeLine?: number;
  error?: string;
  explanation?: string;
}
export interface Trace {
  steps: Step[];
  error?: string;
}
export interface Exercise {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  themes: string[];
  recommendedLevel: Level;
  notions: NotionId[];
  prerequisites: NotionId[];
  objective: string;
  difficulty: 1 | 2 | 3;
  questionSpecs?: QuestionSpec[];
  freeCode?: boolean;
  instruction: string;
  code: string;
  initial: Record<string, string | number | boolean | number[]>;
  variants?: { id: string; title: string; initial: Exercise['initial'] }[];
  visualization: 'recursion' | 'search' | 'objects' | 'combined';
  search?: {
    list: string;
    target: string;
    left: string;
    right: string;
    middle: string;
    result: string;
    rightExclusive?: boolean;
  };
  explanations?: { event?: EventType; line?: number; functionName?: string; text: string }[];
  questions?: {
    line: number;
    prompt: string;
    choices: string[];
    answer: number;
    explanation: string;
  }[];
}

/** Resolved only against successful real traces; absent selectors yield no question. */
export interface QuestionSpec {
  id: string;
  event: EventType;
  functionName?: string;
  selfName?: string;
  occurrence?: number;
  prompt: string;
  read: 'self' | 'caller' | 'return' | 'depth' | 'global';
  variable?: string;
  explanation: string;
}
export interface VerifiedQuestion {
  id: string;
  stepIndex: number;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}
