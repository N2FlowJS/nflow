import { KnowledgeFile } from './knowledge';

export type ParsingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FileParsingTask {
  id: string;
  status: ParsingStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  fileId: string;
  createdById: string;
  file?: KnowledgeFile;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface ParseFileResponse {
  success: boolean;
  message?: string;
  taskId?: string;
  task?: FileParsingTask;
}

export interface UpdateParsingStatusRequest {
  status: ParsingStatus;
  errorMessage?: string;
}
