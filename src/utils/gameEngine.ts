import { NBAPlayer, getRandomPlayer, isCorrectGuess } from '../data/nbaPlayers';
import { GameRound } from '../types/game';

const WINNING_SCORE = 7;

export class GameEngine {
  private static instance: GameEngine;
  
  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  initializeGame(): GameRound {
    const firstPlayer = getRandomPlayer();
    
    return {
      currentPlayer: {
        id: firstPlayer.id,
        name: firstPlayer.name,
        team: firstPlayer.team,
        imageUrl: firstPlayer.imageUrl
      },
      roundNumber: 1,
      scores: {
        player1: 0,
        player2: 0
      },
      usedPlayerIds: [firstPlayer.id],
      roundState: 'guessing',
      guesses: {},
      guessTimestamps: {},
      readyForNext: {
        player1: false,
        player2: false
      }
    };
  }

  submitGuess(
    gameState: GameRound, 
    playerKey: 'player1' | 'player2', 
    guess: string
  ): GameRound {
    if (gameState.roundState !== 'guessing') {
      return gameState;
    }

    const timestamp = Date.now();
    const updatedGameState = { ...gameState };
    
    // Record the guess and timestamp
    updatedGameState.guesses = {
      ...updatedGameState.guesses,
      [playerKey]: guess
    };
    
    updatedGameState.guessTimestamps = {
      ...updatedGameState.guessTimestamps,
      [playerKey]: timestamp
    };

    // Check if guess is correct
    const isCorrect = isCorrectGuess(guess, {
      id: gameState.currentPlayer.id,
      name: gameState.currentPlayer.name,
      team: gameState.currentPlayer.team,
      imageUrl: gameState.currentPlayer.imageUrl
    } as NBAPlayer);

    if (isCorrect) {
      // Player guessed correctly
      updatedGameState.correctGuesser = playerKey;
      updatedGameState.roundState = 'revealed';
      
      // Update score
      updatedGameState.scores = {
        ...updatedGameState.scores,
        [playerKey]: updatedGameState.scores[playerKey] + 1
      };

      // Check for game winner
      if (updatedGameState.scores[playerKey] >= WINNING_SCORE) {
        updatedGameState.gameWinner = playerKey;
      }
    } else {
      // Check if both players have guessed incorrectly
      const otherPlayerKey = playerKey === 'player1' ? 'player2' : 'player1';
      const otherPlayerGuessed = updatedGameState.guesses[otherPlayerKey] !== undefined;
      
      if (otherPlayerGuessed) {
        // Both players guessed incorrectly, reveal answer
        updatedGameState.roundState = 'revealed';
        updatedGameState.correctGuesser = null;
      }
    }

    return updatedGameState;
  }

  setPlayerReady(gameState: GameRound, playerKey: 'player1' | 'player2'): GameRound {
    if (gameState.roundState !== 'revealed') {
      return gameState;
    }

    const updatedGameState = { ...gameState };
    updatedGameState.readyForNext = {
      ...updatedGameState.readyForNext,
      [playerKey]: true
    };

    // If both players are ready and game isn't over, start next round
    if (updatedGameState.readyForNext.player1 && 
        updatedGameState.readyForNext.player2 && 
        !updatedGameState.gameWinner) {
      return this.startNextRound(updatedGameState);
    }

    return updatedGameState;
  }

  private startNextRound(gameState: GameRound): GameRound {
    const nextPlayer = getRandomPlayer(gameState.usedPlayerIds);
    
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
      readyForNext: {
        player1: false,
        player2: false
      }
    };
  }

  resetGame(): GameRound {
    return this.initializeGame();
  }
}