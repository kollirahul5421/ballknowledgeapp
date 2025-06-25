export interface Room {
  code: string;
  players: Player[];
  status: 'waiting' | 'lobby' | 'playing' | 'finished';
  playersReady: Record<string, boolean>;
  createdAt: number;
  joinedAt?: number;
  gameState?: GameRound;
  gameMode?: GameMode;
  hostPlayerId?: string;
  lockedPlayers?: Player[]; // Players locked in when game starts
}

export interface Player {
  id: string;
  name: string;
  isConnected: boolean;
  joinedAt: number;
}

export interface GameState {
  currentView: 'home' | 'create' | 'join' | 'lobby' | 'game' | 'admin';
  playerName: string;
  playerId?: string;
  roomCode?: string;
  room?: Room;
}

export interface GameRound {
  currentPlayer: {
    id: string;
    name: string;
    team: string;
    imageUrl: string;
  };
  roundNumber: number;
  scores: Record<string, number>; // playerId -> score
  usedPlayerIds: string[];
  roundState: 'guessing' | 'revealed' | 'waiting-next';
  winner?: string | null;
  correctGuesser?: string | null;
  guesses: Record<string, string>; // playerId -> guess
  guessTimestamps: Record<string, number>; // playerId -> timestamp
  readyForNext: Record<string, boolean>; // playerId -> ready
  gameWinner?: string | null;
  activePlayers: string[]; // List of player IDs still in the game
}

export type GameMode = 'all' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'all', label: 'All Players' },
  { value: '1980s', label: '1980s Era' },
  { value: '1990s', label: '1990s Era' },
  { value: '2000s', label: '2000s Era' },
  { value: '2010s', label: '2010s Era' },
  { value: '2020s', label: '2020s Era' }
];

export const MAX_PLAYERS = 4;
export const WINNING_SCORE = 7;