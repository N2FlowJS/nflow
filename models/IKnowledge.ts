
export interface IKnowledge {
  id: string;
  name: string;
  description: string;
  config: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
  users?: any[];
  teams?: any[];
  files?: any[];
}
