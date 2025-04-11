
export interface IUser {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  teams?: any[];
  teamsWithRoles?: any[];
  ownedAgents?: any[];
}
