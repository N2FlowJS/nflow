/**
 * Types for Code Editor Node
 */

export interface CodeEditorForm {
  code: string;
  language: 'javascript' | 'typescript';
}

export interface CodeExecutionContext {
  inputs: Record<string, any>;
  flowState: any;
  node: any;
  config: CodeEditorForm;
  language: string;
  log: (message: any) => void;
  error: (message: any) => void;
}

export interface CodeExecutionResult {
  output: any;
  success: boolean;
  error?: string;
  executionTime?: number;
}
