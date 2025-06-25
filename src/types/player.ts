export interface Player {
  id: string;
  name: string;
  team: string;
  imageUrl: string;
  primaryDecade: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  name: string;
  team: string;
  imageUrl: string;
  primaryDecade: string;
}

export interface UpdatePlayerRequest {
  id: string;
  name: string;
  team: string;
  imageUrl: string;
  primaryDecade: string;
}

export const DECADES = [
  '1980s',
  '1990s', 
  '2000s',
  '2010s',
  '2020s'
] as const;

export type Decade = typeof DECADES[number];