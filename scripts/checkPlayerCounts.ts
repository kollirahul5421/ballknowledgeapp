import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayerCounts() {
  console.log('Checking player counts by decade...');
  
  try {
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error getting total count:', totalError);
      return;
    }
    
    console.log(`\n📊 TOTAL PLAYERS: ${totalCount}`);
    
    // Get count by decade
    const { data: decadeData, error: decadeError } = await supabase
      .from('players')
      .select('primary_decade');
    
    if (decadeError) {
      console.error('Error getting decade data:', decadeError);
      return;
    }
    
    // Count by decade
    const decadeCounts: { [key: string]: number } = {};
    
    decadeData?.forEach(player => {
      const decade = player.primary_decade;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    
    console.log('\n📈 PLAYERS BY DECADE:');
    console.log('=====================');
    
    Object.entries(decadeCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([decade, count]) => {
        console.log(`${decade}: ${count} players`);
      });
    
    // Get some sample players from each decade
    console.log('\n👥 SAMPLE PLAYERS BY DECADE:');
    console.log('============================');
    
    for (const decade of Object.keys(decadeCounts)) {
      const { data: samplePlayers, error: sampleError } = await supabase
        .from('players')
        .select('name, team')
        .eq('primary_decade', decade)
        .limit(5);
      
      if (sampleError) {
        console.error(`Error getting sample players for ${decade}:`, sampleError);
        continue;
      }
      
      console.log(`\n${decade} (${decadeCounts[decade]} total):`);
      samplePlayers?.forEach(player => {
        console.log(`  • ${player.name} (${player.team})`);
      });
      
      if (decadeCounts[decade] > 5) {
        console.log(`  ... and ${decadeCounts[decade] - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkPlayerCounts(); 