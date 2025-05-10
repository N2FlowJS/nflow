
export interface IKnowledge {
  id: string;
  name: string;
  description: string;
  config: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
    permission?: string;
  };
  users?: any[];
  teams?: any[];
  files?: any[];
}
