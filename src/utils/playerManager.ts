import { supabase } from '../lib/supabase';
import { Player, CreatePlayerRequest, UpdatePlayerRequest } from '../types/player';
import { GameMode } from '../types/game';

export class PlayerManager {
  private static instance: PlayerManager;
  
  static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  async getAllPlayers(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        return [];
      }

      return data.map(this.mapSupabaseToPlayer);
    } catch (error) {
      console.error('Error fetching players:', error);
      return [];
    }
  }

  async createPlayer(playerData: CreatePlayerRequest): Promise<Player | null> {
    try {
      // Validate image URL
      if (!this.isValidUrl(playerData.imageUrl)) {
        throw new Error('Invalid image URL');
      }

      const { data, error } = await supabase
        .from('players')
        .insert({
          name: playerData.name.trim(),
          team: playerData.team.trim(),
          image_url: playerData.imageUrl.trim(),
          primary_decade: playerData.primaryDecade
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A player with this name already exists');
        }
        console.error('Error creating player:', error);
        throw new Error('Failed to create player');
      }

      return this.mapSupabaseToPlayer(data);
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async updatePlayer(playerData: UpdatePlayerRequest): Promise<Player | null> {
    try {
      // Validate image URL
      if (!this.isValidUrl(playerData.imageUrl)) {
        throw new Error('Invalid image URL');
      }

      const { data, error } = await supabase
        .from('players')
        .update({
          name: playerData.name.trim(),
          team: playerData.team.trim(),
          image_url: playerData.imageUrl.trim(),
          primary_decade: playerData.primaryDecade
        })
        .eq('id', playerData.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A player with this name already exists');
        }
        console.error('Error updating player:', error);
        throw new Error('Failed to update player');
      }

      return this.mapSupabaseToPlayer(data);
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  }

  async deletePlayer(playerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        console.error('Error deleting player:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting player:', error);
      return false;
    }
  }

  async getRandomPlayer(excludeIds: string[] = [], gameMode: GameMode = 'all'): Promise<Player | null> {
    try {
      let query = supabase.from('players').select('*');
      
      // Apply decade filter if not 'all'
      if (gameMode !== 'all') {
        query = query.eq('primary_decade', gameMode);
      }
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching random player:', error);
        return null;
      }

      if (!data || data.length === 0) {
        // If no players available (all excluded), get any random player from the decade
        let fallbackQuery = supabase.from('players').select('*');
        
        if (gameMode !== 'all') {
          fallbackQuery = fallbackQuery.eq('primary_decade', gameMode);
        }
        
        const { data: allData, error: allError } = await fallbackQuery;
        
        if (allError || !allData || allData.length === 0) {
          return null;
        }
        
        const randomIndex = Math.floor(Math.random() * allData.length);
        return this.mapSupabaseToPlayer(allData[randomIndex]);
      }

      const randomIndex = Math.floor(Math.random() * data.length);
      return this.mapSupabaseToPlayer(data[randomIndex]);
    } catch (error) {
      console.error('Error getting random player:', error);
      return null;
    }
  }

  async getPlayersByDecade(decade: string): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('primary_decade', decade)
        .order('name');

      if (error) {
        console.error('Error fetching players by decade:', error);
        return [];
      }

      return data.map(this.mapSupabaseToPlayer);
    } catch (error) {
      console.error('Error fetching players by decade:', error);
      return [];
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  private mapSupabaseToPlayer(data: any): Player {
    return {
      id: data.id,
      name: data.name,
      team: data.team,
      imageUrl: data.image_url,
      primaryDecade: data.primary_decade,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}