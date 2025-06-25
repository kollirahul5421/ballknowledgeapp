import { supabase } from '../lib/supabase';
import { Room, GameRound, GameMode, Player, MAX_PLAYERS } from '../types/game';
import { SupabaseGameEngine } from './supabaseGameEngine';

const ROOM_EXPIRY_WAITING = 60 * 1000; // 1 minute
const ROOM_EXPIRY_LOBBY = 5 * 60 * 1000; // 5 minutes

export class SupabaseRoomManager {
  private static instance: SupabaseRoomManager;
  private gameEngine: SupabaseGameEngine;
  
  static getInstance(): SupabaseRoomManager {
    if (!SupabaseRoomManager.instance) {
      SupabaseRoomManager.instance = new SupabaseRoomManager();
    }
    return SupabaseRoomManager.instance;
  }

  constructor() {
    this.gameEngine = SupabaseGameEngine.getInstance();
  }

  async generateRoomCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
      
      const existing = await this.getRoomByCode(code);
      if (!existing) break;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique room code');
      }
    } while (true);
    
    return code;
  }

  generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createRoom(roomCode: string, playerName: string, gameMode: GameMode = 'all'): Promise<{ room: Room; playerId: string } | null> {
    try {
      const playerId = this.generatePlayerId();
      const player: Player = {
        id: playerId,
        name: playerName,
        isConnected: true,
        joinedAt: Date.now()
      };

      const roomData = {
        code: roomCode,
        players: [player],
        status: 'waiting' as const,
        players_ready: { [playerId]: false },
        game_state: null,
        game_mode: gameMode,
        host_player_id: playerId
      };

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code: roomCode,
          player1: playerName, // Keep for backwards compatibility
          status: 'waiting',
          player1_ready: false,
          player2_ready: false,
          game_state: JSON.stringify(roomData),
          game_mode: gameMode
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating room:', error);
        return null;
      }

      const room = this.mapSupabaseToRoom(data);
      return { room, playerId };
    } catch (error) {
      console.error('Error creating room:', error);
      return null;
    }
  }

  async joinRoom(roomCode: string, playerName: string): Promise<{ room: Room; playerId: string } | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room || room.status !== 'waiting' || room.players.length >= MAX_PLAYERS) {
        return null;
      }

      const playerId = this.generatePlayerId();
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isConnected: true,
        joinedAt: Date.now()
      };

      const updatedPlayers = [...room.players, newPlayer];
      const updatedPlayersReady = { ...room.playersReady, [playerId]: false };

      const roomData = {
        code: room.code,
        players: updatedPlayers,
        status: updatedPlayers.length >= 2 ? 'lobby' : 'waiting',
        players_ready: updatedPlayersReady,
        game_state: room.gameState,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId
      };

      // Update with backwards compatibility
      const updateData: any = {
        status: roomData.status,
        game_state: JSON.stringify(roomData)
      };

      if (updatedPlayers.length === 2) {
        updateData.player2 = playerName;
        updateData.joined_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error joining room:', error);
        return null;
      }

      const updatedRoom = this.mapSupabaseToRoom(data);
      return { room: updatedRoom, playerId };
    } catch (error) {
      console.error('Error joining room:', error);
      return null;
    }
  }

  async updatePlayerReady(roomCode: string, playerId: string, ready: boolean): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room) return null;

      const updatedPlayersReady = { ...room.playersReady, [playerId]: ready };
      const allReady = room.players.filter(p => p.isConnected).every(p => updatedPlayersReady[p.id]);

      let roomData = {
        code: room.code,
        players: room.players,
        status: room.status,
        players_ready: updatedPlayersReady,
        game_state: room.gameState,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId,
        locked_players: room.lockedPlayers
      };

      if (allReady && room.status === 'lobby' && room.players.filter(p => p.isConnected).length >= 2) {
        console.log('All players ready, initializing game with mode:', room.gameMode);
        
        try {
          const activePlayers = room.players.filter(p => p.isConnected);
          const gameState = await this.gameEngine.initializeGame(room.gameMode || 'all', activePlayers);
          roomData.status = 'playing';
          roomData.game_state = gameState;
          roomData.locked_players = activePlayers; // Lock in the players
          console.log('Game state initialized:', gameState);
        } catch (gameError) {
          console.error('Error initializing game:', gameError);
          return null;
        }
      }

      // Update backwards compatibility fields
      const updateData: any = {
        status: roomData.status,
        game_state: JSON.stringify(roomData)
      };

      if (room.players.length >= 1) {
        updateData.player1_ready = updatedPlayersReady[room.players[0].id] || false;
      }
      if (room.players.length >= 2) {
        updateData.player2_ready = updatedPlayersReady[room.players[1].id] || false;
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error updating player ready:', error);
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error updating player ready:', error);
      return null;
    }
  }

  async updatePlayerConnection(roomCode: string, playerId: string, isConnected: boolean): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room) return null;

      const updatedPlayers = room.players.map(p => 
        p.id === playerId ? { ...p, isConnected } : p
      );

      const roomData = {
        code: room.code,
        players: updatedPlayers,
        status: room.status,
        players_ready: room.playersReady,
        game_state: room.gameState,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId,
        locked_players: room.lockedPlayers
      };

      const { data, error } = await supabase
        .from('rooms')
        .update({
          game_state: JSON.stringify(roomData)
        })
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error updating player connection:', error);
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error updating player connection:', error);
      return null;
    }
  }

  async submitGuess(roomCode: string, playerId: string, guess: string): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room || !room.gameState || room.status !== 'playing') {
        return null;
      }

      const updatedGameState = this.gameEngine.submitGuess(room.gameState, playerId, guess);

      const roomData = {
        code: room.code,
        players: room.players,
        status: room.status,
        players_ready: room.playersReady,
        game_state: updatedGameState,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId,
        locked_players: room.lockedPlayers
      };

      const { data, error } = await supabase
        .from('rooms')
        .update({
          game_state: JSON.stringify(roomData)
        })
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error submitting guess:', error);
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error submitting guess:', error);
      return null;
    }
  }

  async setPlayerReadyForNext(roomCode: string, playerId: string): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room || !room.gameState || room.status !== 'playing') {
        return null;
      }

      let updatedGameState = this.gameEngine.setPlayerReady(room.gameState, playerId);
      
      // Check if all connected players are ready for next round
      const connectedPlayers = room.players.filter(p => p.isConnected);
      const allReady = connectedPlayers.every(p => updatedGameState.readyForNext[p.id]);
      
      if (allReady && !updatedGameState.gameWinner) {
        try {
          updatedGameState = await this.gameEngine.startNextRound(updatedGameState, room.gameMode || 'all');
        } catch (nextRoundError) {
          console.error('Error starting next round:', nextRoundError);
        }
      }
      
      const roomData = {
        code: room.code,
        players: room.players,
        status: room.status,
        players_ready: room.playersReady,
        game_state: updatedGameState,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId,
        locked_players: room.lockedPlayers
      };

      const updateData: any = {
        game_state: JSON.stringify(roomData)
      };

      if (updatedGameState.gameWinner) {
        updateData.status = 'finished';
        roomData.status = 'finished';
      }

      const { data, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error setting player ready for next:', error);
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error setting player ready for next:', error);
      return null;
    }
  }

  async resetGame(roomCode: string): Promise<Room | null> {
    try {
      const room = await this.getRoomByCode(roomCode);
      if (!room) return null;

      const resetPlayersReady: Record<string, boolean> = {};
      room.players.forEach(p => {
        resetPlayersReady[p.id] = false;
      });

      const roomData = {
        code: room.code,
        players: room.players,
        status: 'lobby' as const,
        players_ready: resetPlayersReady,
        game_state: null,
        game_mode: room.gameMode,
        host_player_id: room.hostPlayerId,
        locked_players: undefined
      };

      const { data, error } = await supabase
        .from('rooms')
        .update({
          status: 'lobby',
          player1_ready: false,
          player2_ready: false,
          game_state: JSON.stringify(roomData)
        })
        .eq('code', roomCode)
        .select()
        .single();

      if (error) {
        console.error('Error resetting game:', error);
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error resetting game:', error);
      return null;
    }
  }

  async getRoomByCode(code: string): Promise<Room | null> {
    try {
      await this.cleanupExpiredRooms();
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error('Error getting room:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return this.mapSupabaseToRoom(data);
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  async deleteRoom(roomCode: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('code', roomCode);

      if (error) {
        console.error('Error deleting room:', error);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  }

  private async cleanupExpiredRooms(): Promise<void> {
    try {
      const now = new Date();
      const waitingExpiry = new Date(now.getTime() - ROOM_EXPIRY_WAITING);
      const lobbyExpiry = new Date(now.getTime() - ROOM_EXPIRY_LOBBY);

      await supabase
        .from('rooms')
        .delete()
        .eq('status', 'waiting')
        .lt('created_at', waitingExpiry.toISOString());

      await supabase
        .from('rooms')
        .delete()
        .eq('status', 'lobby')
        .lt('joined_at', lobbyExpiry.toISOString());

    } catch (error) {
      console.error('Error cleaning up expired rooms:', error);
    }
  }

  private mapSupabaseToRoom(data: any): Room {
    let roomData;
    
    try {
      roomData = JSON.parse(data.game_state || '{}');
    } catch {
      roomData = {};
    }

    // Handle backwards compatibility
    if (!roomData.players) {
      const players: Player[] = [];
      
      if (data.player1) {
        players.push({
          id: 'player1',
          name: data.player1,
          isConnected: true,
          joinedAt: new Date(data.created_at).getTime()
        });
      }
      
      if (data.player2) {
        players.push({
          id: 'player2',
          name: data.player2,
          isConnected: true,
          joinedAt: data.joined_at ? new Date(data.joined_at).getTime() : Date.now()
        });
      }

      const playersReady: Record<string, boolean> = {};
      if (players.length >= 1) playersReady[players[0].id] = data.player1_ready || false;
      if (players.length >= 2) playersReady[players[1].id] = data.player2_ready || false;

      return {
        code: data.code,
        players,
        status: data.status,
        playersReady,
        createdAt: new Date(data.created_at).getTime(),
        joinedAt: data.joined_at ? new Date(data.joined_at).getTime() : undefined,
        gameState: data.game_state ? roomData.game_state : undefined,
        gameMode: data.game_mode || 'all',
        hostPlayerId: players[0]?.id
      };
    }

    return {
      code: data.code,
      players: roomData.players || [],
      status: data.status,
      playersReady: roomData.players_ready || {},
      createdAt: new Date(data.created_at).getTime(),
      joinedAt: data.joined_at ? new Date(data.joined_at).getTime() : undefined,
      gameState: roomData.game_state,
      gameMode: data.game_mode || 'all',
      hostPlayerId: roomData.host_player_id,
      lockedPlayers: roomData.locked_players
    };
  }

  subscribeToRoom(roomCode: string, callback: (room: Room | null) => void) {
    const subscription = supabase
      .channel(`room-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            callback(null);
          } else {
            callback(this.mapSupabaseToRoom(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}