import { PlayerManager } from './playerManager';
import { Player as DBPlayer } from '../types/player';
import { GameRound, GameMode, Player, WINNING_SCORE } from '../types/game';
import { Decade } from '../types/game';

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

  async initializeGame(decades: Decade[] | 'all', players: Player[]): Promise<GameRound> {
    console.log('Initializing game with decades:', decades, 'players:', players);
    
    try {
      const decadeSelection = decades === 'all' ? { all: true, decades: [] } : { all: false, decades };
      const firstPlayer = await this.playerManager.getRandomPlayer([], decadeSelection);
      
      if (!firstPlayer) {
        const errorMsg = decades === 'all' 
          ? 'No players available in the database' 
          : `No players available for the selected decades`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Selected first player:', firstPlayer);
      
      // Initialize scores and ready states for all players
      const scores: Record<string, number> = {};
      const readyForNext: Record<string, boolean> = {};
      const skipVotes: Record<string, boolean> = {};
      const activePlayers: string[] = [];

      players.forEach(player => {
        scores[player.id] = 0;
        readyForNext[player.id] = false;
        skipVotes[player.id] = false;
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
        roundState: 'round-transition',
        roundTransitionTimestamp: Date.now(),
        guesses: {},
        guessTimestamps: {},
        readyForNext,
        skipVotes,
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
    
    // Check if guess is correct
    const isCorrect = this.isCorrectGuess(guess, gameState.currentPlayer.name);

    if (isCorrect) {
      // Player guessed correctly - record the guess and end the round
      updatedGameState.guesses = {
        ...updatedGameState.guesses,
        [playerId]: guess
      };
      
      updatedGameState.guessTimestamps = {
        ...updatedGameState.guessTimestamps,
        [playerId]: timestamp
      };

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
      // Incorrect guess - don't record it, just return the same state
      // This allows the player to try again without advancing the round
      return gameState;
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

  async startNextRound(gameState: GameRound, decades: Decade[] | 'all' = 'all'): Promise<GameRound> {
    console.log('Starting next round with decades:', decades, 'used players:', gameState.usedPlayerIds);
    
    try {
      const decadeSelection = decades === 'all' ? { all: true, decades: [] } : { all: false, decades };
      const nextPlayer = await this.playerManager.getRandomPlayer(gameState.usedPlayerIds, decadeSelection);
      
      if (!nextPlayer) {
        console.warn('No more unique players available, resetting used players list');
        const fallbackPlayer = await this.playerManager.getRandomPlayer([], decadeSelection);
        
        if (!fallbackPlayer) {
          const errorMsg = decades === 'all' 
            ? 'No players available in the database' 
            : `No players available for the selected decades`;
          throw new Error(errorMsg);
        }
        
        console.log('Using fallback player:', fallbackPlayer);
        
        // Reset ready states for all active players
        const resetReadyForNext: Record<string, boolean> = {};
        const resetSkipVotes: Record<string, boolean> = {};
        gameState.activePlayers.forEach(pid => {
          resetReadyForNext[pid] = false;
          resetSkipVotes[pid] = false;
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
          roundState: 'round-transition',
          roundTransitionTimestamp: Date.now(),
          correctGuesser: undefined,
          guesses: {},
          guessTimestamps: {},
          readyForNext: resetReadyForNext,
          skipVotes: resetSkipVotes
        };
      }

      console.log('Selected next player:', nextPlayer);
      
      // Reset ready states for all active players
      const resetReadyForNext: Record<string, boolean> = {};
      const resetSkipVotes: Record<string, boolean> = {};
      gameState.activePlayers.forEach(pid => {
        resetReadyForNext[pid] = false;
        resetSkipVotes[pid] = false;
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
        roundState: 'round-transition',
        roundTransitionTimestamp: Date.now(),
        correctGuesser: undefined,
        guesses: {},
        guessTimestamps: {},
        readyForNext: resetReadyForNext,
        skipVotes: resetSkipVotes
      };
    } catch (error) {
      console.error('Error in startNextRound:', error);
      throw error;
    }
  }

  skipRound(gameState: GameRound): GameRound {
    if (gameState.roundState !== 'guessing') {
      return gameState;
    }

    // Skip works the same as both players guessing incorrectly
    return {
      ...gameState,
      roundState: 'revealed',
      correctGuesser: null
    };
  }

  voteToSkip(gameState: GameRound, playerId: string): GameRound {
    if (gameState.roundState !== 'guessing' || !gameState.activePlayers.includes(playerId)) {
      return gameState;
    }

    const updatedGameState = { ...gameState };
    updatedGameState.skipVotes = {
      ...updatedGameState.skipVotes,
      [playerId]: true
    };

    // Check if all active players have voted to skip
    const allPlayersVotedToSkip = gameState.activePlayers.every(pid => 
      updatedGameState.skipVotes[pid]
    );

    if (allPlayersVotedToSkip) {
      // All players voted to skip, reveal the answer
      updatedGameState.roundState = 'revealed';
      updatedGameState.correctGuesser = null;
    }

    return updatedGameState;
  }

  /**
   * Transition from round-transition to guessing state after a synchronized delay
   */
  transitionToGuessing(gameState: GameRound): GameRound {
    if (gameState.roundState !== 'round-transition') {
      return gameState;
    }

    const transitionDelay = 2000; // 2 seconds
    const now = Date.now();
    const transitionStart = gameState.roundTransitionTimestamp || now;
    
    // Only transition if enough time has passed
    if (now - transitionStart >= transitionDelay) {
      return {
        ...gameState,
        roundState: 'guessing',
        roundTransitionTimestamp: undefined
      };
    }

    return gameState;
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
    
    // Simple Levenshtein distance check for typos (allow 1-2 character differences)
    return this.calculateLevenshteinDistance(normalizedGuess, normalizedCorrect) <= 2;
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