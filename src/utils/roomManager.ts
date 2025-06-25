import { Room, GameRound } from '../types/game';
import { GameEngine } from './gameEngine';

const ROOM_EXPIRY_WAITING = 60 * 1000; // 1 minute
const ROOM_EXPIRY_LOBBY = 5 * 60 * 1000; // 5 minutes

export class RoomManager {
  private static instance: RoomManager;
  private gameEngine: GameEngine;
  
  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  constructor() {
    this.gameEngine = GameEngine.getInstance();
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.getRoomByCode(code) !== null);
    
    return code;
  }

  createRoom(roomCode: string, player1Name: string): Room {
    const room: Room = {
      code: roomCode,
      player1: player1Name,
      status: 'waiting',
      player1Ready: false,
      player2Ready: false,
      createdAt: Date.now()
    };
    
    this.saveRoom(room);
    return room;
  }

  joinRoom(roomCode: string, player2Name: string): Room | null {
    const room = this.getRoomByCode(roomCode);
    if (!room || room.status !== 'waiting') {
      return null;
    }
    
    room.player2 = player2Name;
    room.status = 'lobby';
    room.joinedAt = Date.now();
    
    this.saveRoom(room);
    return room;
  }

  updatePlayerReady(roomCode: string, isPlayer1: boolean, ready: boolean): Room | null {
    const room = this.getRoomByCode(roomCode);
    if (!room) return null;
    
    if (isPlayer1) {
      room.player1Ready = ready;
    } else {
      room.player2Ready = ready;
    }
    
    if (room.player1Ready && room.player2Ready && room.status === 'lobby') {
      room.status = 'playing';
      room.gameState = this.gameEngine.initializeGame();
    }
    
    this.saveRoom(room);
    return room;
  }

  submitGuess(roomCode: string, playerKey: 'player1' | 'player2', guess: string): Room | null {
    const room = this.getRoomByCode(roomCode);
    if (!room || !room.gameState || room.status !== 'playing') {
      return null;
    }

    room.gameState = this.gameEngine.submitGuess(room.gameState, playerKey, guess);
    this.saveRoom(room);
    return room;
  }

  setPlayerReadyForNext(roomCode: string, playerKey: 'player1' | 'player2'): Room | null {
    const room = this.getRoomByCode(roomCode);
    if (!room || !room.gameState || room.status !== 'playing') {
      return null;
    }

    room.gameState = this.gameEngine.setPlayerReady(room.gameState, playerKey);
    
    // If game is finished, update room status
    if (room.gameState.gameWinner) {
      room.status = 'finished';
    }
    
    this.saveRoom(room);
    return room;
  }

  resetGame(roomCode: string): Room | null {
    const room = this.getRoomByCode(roomCode);
    if (!room) return null;

    room.status = 'lobby';
    room.player1Ready = false;
    room.player2Ready = false;
    room.gameState = undefined;
    
    this.saveRoom(room);
    return room;
  }

  getRoomByCode(code: string): Room | null {
    this.cleanupExpiredRooms();
    const rooms = this.getAllRooms();
    return rooms.find(room => room.code === code) || null;
  }

  private getAllRooms(): Room[] {
    const roomsData = localStorage.getItem('nba-game-rooms');
    return roomsData ? JSON.parse(roomsData) : [];
  }

  private saveRoom(room: Room): void {
    const rooms = this.getAllRooms().filter(r => r.code !== room.code);
    rooms.push(room);
    localStorage.setItem('nba-game-rooms', JSON.stringify(rooms));
  }

  private cleanupExpiredRooms(): void {
    const rooms = this.getAllRooms();
    const now = Date.now();
    
    const validRooms = rooms.filter(room => {
      if (room.status === 'waiting') {
        return now - room.createdAt < ROOM_EXPIRY_WAITING;
      } else if (room.status === 'lobby' && room.joinedAt) {
        return now - room.joinedAt < ROOM_EXPIRY_LOBBY;
      }
      return true; // Keep playing/finished rooms
    });
    
    if (validRooms.length !== rooms.length) {
      localStorage.setItem('nba-game-rooms', JSON.stringify(validRooms));
    }
  }

  deleteRoom(roomCode: string): void {
    const rooms = this.getAllRooms().filter(r => r.code !== roomCode);
    localStorage.setItem('nba-game-rooms', JSON.stringify(rooms));
  }
}