export interface KnowledgeFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
  parsingStatus?: string; // "pending", "completed", "failed", null
}

export interface Knowledge {
  id: string;
  name: string;
  config?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
    permission?: string;
  };
  users: { id: string; name: string }[] | any[];
  teams: { id: string; name: string }[] | any[];
  files: KnowledgeFile[];
}
