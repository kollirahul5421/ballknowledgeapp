import { createClient } from '@supabase/supabase-js';
import { allPlayers, PlayerData } from './playerData';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SupabasePlayer {
  name: string;
  team: string;
  image_url: string;
  primary_decade: string;
}

async function uploadPlayersToSupabase() {
  console.log('Starting player upload to Supabase...');
  
  try {
    // First, get existing players to avoid duplicates
    const { data: existingPlayers, error: fetchError } = await supabase
      .from('players')
      .select('name');
    
    if (fetchError) {
      console.error('Error fetching existing players:', fetchError);
      return;
    }
    
    const existingPlayerNames = new Set(existingPlayers?.map(p => p.name.toLowerCase()) || []);
    
    console.log(`Found ${existingPlayers?.length || 0} existing players`);
    
    // Filter out players that already exist
    const newPlayers = allPlayers.filter(player => {
      const alreadyExists = existingPlayerNames.has(player.name.toLowerCase());
      
      if (alreadyExists) {
        console.log(`Skipping ${player.name} - already exists`);
      }
      
      return !alreadyExists;
    });
    
    console.log(`Found ${newPlayers.length} new players to upload`);
    
    if (newPlayers.length === 0) {
      console.log('No new players to upload');
      return;
    }
    
    // Transform data to match Supabase schema
    const playersToUpload: SupabasePlayer[] = newPlayers.map(player => ({
      name: player.name,
      team: player.team,
      image_url: player.imageUrl,
      primary_decade: player.primaryDecade
    }));
    
    // Upload in batches to avoid hitting limits
    const batchSize = 50;
    for (let i = 0; i < playersToUpload.length; i += batchSize) {
      const batch = playersToUpload.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.error('Failed players:', batch.map(p => p.name));
      } else {
        console.log(`Successfully uploaded batch ${Math.floor(i / batchSize) + 1} (${batch.length} players)`);
      }
    }
    
    console.log('Player upload completed!');
    
  } catch (error) {
    console.error('Unexpected error during upload:', error);
  }
}

// Function to upload players by decade
async function uploadPlayersByDecade(decade: '1980s' | '1990s' | '2000s' | '2010s') {
  console.log(`Starting ${decade} player upload to Supabase...`);
  
  try {
    // Get players for specific decade
    const decadePlayers = decade === '1980s'
      ? require('./playerData').players1980s
      : decade === '2000s' 
      ? require('./playerData').players2000s 
      : decade === '2010s'
      ? require('./playerData').players2010s
      : require('./playerData').players1990s;
    
    // Get existing players to avoid duplicates
    const { data: existingPlayers, error: fetchError } = await supabase
      .from('players')
      .select('name');
    
    if (fetchError) {
      console.error('Error fetching existing players:', fetchError);
      return;
    }
    
    const existingPlayerNames = new Set(existingPlayers?.map(p => p.name.toLowerCase()) || []);
    
    // Filter out players that already exist
    const newPlayers = decadePlayers.filter((player: PlayerData) => {
      const alreadyExists = existingPlayerNames.has(player.name.toLowerCase());
      
      if (alreadyExists) {
        console.log(`Skipping ${player.name} - already exists`);
      }
      
      return !alreadyExists;
    });
    
    console.log(`Found ${newPlayers.length} new ${decade} players to upload`);
    
    if (newPlayers.length === 0) {
      console.log(`No new ${decade} players to upload`);
      return;
    }
    
    // Transform data to match Supabase schema
    const playersToUpload: SupabasePlayer[] = newPlayers.map((player: PlayerData) => ({
      name: player.name,
      team: player.team,
      image_url: player.imageUrl,
      primary_decade: player.primaryDecade
    }));
    
    // Upload in batches
    const batchSize = 50;
    for (let i = 0; i < playersToUpload.length; i += batchSize) {
      const batch = playersToUpload.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('players')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error uploading ${decade} batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.error('Failed players:', batch.map(p => p.name));
      } else {
        console.log(`Successfully uploaded ${decade} batch ${Math.floor(i / batchSize) + 1} (${batch.length} players)`);
      }
    }
    
    console.log(`${decade} player upload completed!`);
    
  } catch (error) {
    console.error(`Unexpected error during ${decade} upload:`, error);
  }
}

// Export functions for use
export { uploadPlayersToSupabase, uploadPlayersByDecade };

// Run if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Upload all players
    uploadPlayersToSupabase();
  } else if (args[0] === '1980s' || args[0] === '1990s' || args[0] === '2000s' || args[0] === '2010s') {
    // Upload specific decade
    uploadPlayersByDecade(args[0] as '1980s' | '1990s' | '2000s' | '2010s');
  } else {
    console.log('Usage:');
    console.log('  npm run upload-players          # Upload all players');
    console.log('  npm run upload-players 1980s    # Upload 1980s players only');
    console.log('  npm run upload-players 1990s    # Upload 1990s players only');
    console.log('  npm run upload-players 2000s    # Upload 2000s players only');
    console.log('  npm run upload-players 2010s    # Upload 2010s players only');
  }
} 