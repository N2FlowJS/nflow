export interface IAgent {
  id: string;
  name: string;
  description: string;
  flowConfig: string;
  isActive: boolean;
  ownerType: 'user' | 'team';
  userId: string | null;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
}
