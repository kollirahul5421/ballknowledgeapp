import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load NBA player data from local file
const nbaPlayersPath = path.join(__dirname, '../nba/data/players.json');
const nbaPlayers: any[] = JSON.parse(fs.readFileSync(nbaPlayersPath, 'utf-8'));

function normalize(str: string) {
  return str.trim().toLowerCase().replace(/[^a-z\s]/g, '');
}

function splitName(fullName: string): { first: string; last: string } | null {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

async function backfillNbaPlayerIds() {
  const { data: players, error } = await supabase.from('players').select('id, name, nba_player_id, image_url');
  if (error) {
    console.error('Error fetching players:', error.message);
    return;
  }
  if (!players) {
    console.log('No players found.');
    return;
  }

  const unmatchedPlayers: string[] = [];

  for (const player of players) {
    const split = splitName(player.name);
    if (!split) {
      console.log(`❓ Could not split name for ${player.name}`);
      unmatchedPlayers.push(player.name);
      continue;
    }
    const match = nbaPlayers.find(
      p => normalize(p.firstName) === normalize(split.first) && normalize(p.lastName) === normalize(split.last)
    );
    if (match) {
      const nbaId = match.playerId;
      const imageUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
      const { error: updateError } = await supabase
        .from('players')
        .update({ nba_player_id: nbaId, image_url: imageUrl })
        .eq('id', player.id);
      if (updateError) {
        console.error(`❌ Error updating ${player.name}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${player.name} with NBA ID: ${nbaId} and image.`);
      }
    } else {
      console.log(`❓ No NBA ID found for ${player.name}`);
      unmatchedPlayers.push(player.name);
    }
    await new Promise((res) => setTimeout(res, 200));
  }

  // Export unmatched players to a file
  if (unmatchedPlayers.length > 0) {
    fs.writeFileSync('unmatched_players.txt', unmatchedPlayers.join('\n'));
    console.log(`\nExported ${unmatchedPlayers.length} unmatched players to unmatched_players.txt`);
  } else {
    console.log('\nAll players matched!');
  }

  console.log('🏁 NBA player ID and image backfill complete.');
}

if (require.main === module) {
  backfillNbaPlayerIds();
} 