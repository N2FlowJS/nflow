
export interface IUser {
  id: string;
  name: string;
  email: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  teams?: any[];
  teamsWithRoles?: any[];
  ownedAgents?: any[];
  lastLoginAt?: string;
}
