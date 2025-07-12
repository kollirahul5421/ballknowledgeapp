import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGameAnalytics() {
  console.log('🎮 Checking Game Analytics...\n');
  
  try {
    // Check rooms table for game activity
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*');
    
    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return;
    }
    
    console.log(`📊 TOTAL GAMES CREATED: ${rooms?.length || 0}`);
    
    if (rooms && rooms.length > 0) {
      // Analyze recent activity
      const recentRooms = rooms.filter(room => {
        const createdAt = new Date(room.created_at);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return createdAt > oneWeekAgo;
      });
      
      console.log(`📈 GAMES IN LAST 7 DAYS: ${recentRooms.length}`);
      
      // Check for active games
      const activeRooms = rooms.filter(room => room.status === 'active');
      console.log(`🎯 ACTIVE GAMES: ${activeRooms.length}`);
      
      // Check completed games
      const completedRooms = rooms.filter(room => room.status === 'completed');
      console.log(`✅ COMPLETED GAMES: ${completedRooms.length}`);
      
      // Most popular decades
      const decadeCounts: { [key: string]: number } = {};
      rooms.forEach(room => {
        const decades = room.decades || [];
        decades.forEach(decade => {
          decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
        });
      });
      
      console.log('\n🏀 MOST POPULAR DECADES:');
      Object.entries(decadeCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([decade, count]) => {
          console.log(`  ${decade}: ${count} games`);
        });
      
      // Recent activity
      console.log('\n🕒 RECENT ACTIVITY:');
      const sortedRooms = rooms
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      sortedRooms.forEach(room => {
        const date = new Date(room.created_at).toLocaleDateString();
        console.log(`  ${date}: ${room.room_code} (${room.status})`);
      });
    }
    
    // Check players table for any admin activity
    const { count: playerCount, error: playerError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
    if (!playerError) {
      console.log(`\n👥 TOTAL PLAYERS IN DATABASE: ${playerCount}`);
    }
    
  } catch (error) {
    console.error('Error checking analytics:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkGameAnalytics();
}

export { checkGameAnalytics }; 