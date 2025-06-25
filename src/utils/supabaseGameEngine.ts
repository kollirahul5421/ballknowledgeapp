import { PlayerManager } from './playerManager';
import { Player as DBPlayer } from '../types/player';
import { GameRound, GameMode, Player, WINNING_SCORE } from '../types/game';

export class SupabaseGameEngine {
  private static instance: SupabaseGameEngine;
  private playerManager: PlayerManager;
  
  static getInstance(): SupabaseGameEngine {
    if (!SupabaseGameEngine.instance) {
      SupabaseGameEngine.instance = new SupabaseGameEngine();
    }
    return SupabaseGameEngine.instance;
  }

  constructor() {
    this.playerManager = PlayerManager.getInstance();
  }

  async initializeGame(gameMode: GameMode = 'all', players: Player[]): Promise<GameRound> {
    console.log('Initializing game with mode:', gameMode, 'players:', players);
    
    try {
      const firstPlayer = await this.playerManager.getRandomPlayer([], gameMode);
      
      if (!firstPlayer) {
        const errorMsg = gameMode === 'all' 
          ? 'No players available in the database' 
          : `No players available for the ${gameMode} era`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Selected first player:', firstPlayer);
      
      // Initialize scores and ready states for all players
      const scores: Record<string, number> = {};
      const readyForNext: Record<string, boolean> = {};
      const activePlayers: string[] = [];

      players.forEach(player => {
        scores[player.id] = 0;
        readyForNext[player.id] = false;
        if (player.isConnected) {
          activePlayers.push(player.id);
        }
      });

      const gameState: GameRound = {
        currentPlayer: {
          id: firstPlayer.id,
          name: firstPlayer.name,
          team: firstPlayer.team,
          imageUrl: firstPlayer.imageUrl
        },
        roundNumber: 1,
        scores,
        usedPlayerIds: [firstPlayer.id],
        roundState: 'guessing',
        guesses: {},
        guessTimestamps: {},
        readyForNext,
        activePlayers
      };

      console.log('Game state initialized successfully:', gameState);
      return gameState;
    } catch (error) {
      console.error('Error in initializeGame:', error);
      throw error;
    }
  }

  submitGuess(
    gameState: GameRound, 
    playerId: string, 
    guess: string
  ): GameRound {
    if (gameState.roundState !== 'guessing' || !gameState.activePlayers.includes(playerId)) {
      return gameState;
    }

    const timestamp = Date.now();
    const updatedGameState = { ...gameState };
    
    // Record the guess and timestamp
    updatedGameState.guesses = {
      ...updatedGameState.guesses,
      [playerId]: guess
    };
    
    updatedGameState.guessTimestamps = {
      ...updatedGameState.guessTimestamps,
      [playerId]: timestamp
    };

    // Check if guess is correct
    const isCorrect = this.isCorrectGuess(guess, gameState.currentPlayer.name);

    if (isCorrect) {
      // Player guessed correctly
      updatedGameState.correctGuesser = playerId;
      updatedGameState.roundState = 'revealed';
      
      // Update score
      updatedGameState.scores = {
        ...updatedGameState.scores,
        [playerId]: (updatedGameState.scores[playerId] || 0) + 1
      };

      // Check for game winner
      if (updatedGameState.scores[playerId] >= WINNING_SCORE) {
        updatedGameState.gameWinner = playerId;
      }
    } else {
      // Check if all active players have guessed
      const activePlayersWhoGuessed = gameState.activePlayers.filter(pid => 
        updatedGameState.guesses[pid] !== undefined
      );
      
      if (activePlayersWhoGuessed.length === gameState.activePlayers.length) {
        // All active players guessed incorrectly, reveal answer
        updatedGameState.roundState = 'revealed';
        updatedGameState.correctGuesser = null;
      }
    }

    return updatedGameState;
  }

  setPlayerReady(gameState: GameRound, playerId: string): GameRound {
    if (gameState.roundState !== 'revealed' || !gameState.activePlayers.includes(playerId)) {
      return gameState;
    }

    const updatedGameState = { ...gameState };
    updatedGameState.readyForNext = {
      ...updatedGameState.readyForNext,
      [playerId]: true
    };

    return updatedGameState;
  }

  async startNextRound(gameState: GameRound, gameMode: GameMode = 'all'): Promise<GameRound> {
    console.log('Starting next round with mode:', gameMode, 'used players:', gameState.usedPlayerIds);
    
    try {
      const nextPlayer = await this.playerManager.getRandomPlayer(gameState.usedPlayerIds, gameMode);
      
      if (!nextPlayer) {
        console.warn('No more unique players available, resetting used players list');
        const fallbackPlayer = await this.playerManager.getRandomPlayer([], gameMode);
        
        if (!fallbackPlayer) {
          const errorMsg = gameMode === 'all' 
            ? 'No players available in the database' 
            : `No players available for the ${gameMode} era`;
          throw new Error(errorMsg);
        }
        
        console.log('Using fallback player:', fallbackPlayer);
        
        // Reset ready states for all active players
        const resetReadyForNext: Record<string, boolean> = {};
        gameState.activePlayers.forEach(pid => {
          resetReadyForNext[pid] = false;
        });
        
        return {
          ...gameState,
          currentPlayer: {
            id: fallbackPlayer.id,
            name: fallbackPlayer.name,
            team: fallbackPlayer.team,
            imageUrl: fallbackPlayer.imageUrl
          },
          roundNumber: gameState.roundNumber + 1,
          usedPlayerIds: [fallbackPlayer.id],
          roundState: 'guessing',
          correctGuesser: undefined,
          guesses: {},
          guessTimestamps: {},
          readyForNext: resetReadyForNext
        };
      }

      console.log('Selected next player:', nextPlayer);
      
      // Reset ready states for all active players
      const resetReadyForNext: Record<string, boolean> = {};
      gameState.activePlayers.forEach(pid => {
        resetReadyForNext[pid] = false;
      });
      
      return {
        ...gameState,
        currentPlayer: {
          id: nextPlayer.id,
          name: nextPlayer.name,
          team: nextPlayer.team,
          imageUrl: nextPlayer.imageUrl
        },
        roundNumber: gameState.roundNumber + 1,
        usedPlayerIds: [...gameState.usedPlayerIds, nextPlayer.id],
        roundState: 'guessing',
        correctGuesser: undefined,
        guesses: {},
        guessTimestamps: {},
        readyForNext: resetReadyForNext
      };
    } catch (error) {
      console.error('Error in startNextRound:', error);
      throw error;
    }
  }

  async resetGame(gameMode: GameMode = 'all', players: Player[]): Promise<GameRound> {
    return this.initializeGame(gameMode, players);
  }

  private isCorrectGuess(guess: string, correctName: string): boolean {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedCorrect = correctName.toLowerCase().trim();
    
    // Exact match
    if (normalizedGuess === normalizedCorrect) return true;
    
    // Check if guess contains the correct name or vice versa
    if (normalizedGuess.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedGuess)) {
      return true;
    }
    
    // Simple Levenshtein distance check for typos
    return this.calculateLevenshteinDistance(normalizedGuess, normalizedCorrect) <= 1;
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}