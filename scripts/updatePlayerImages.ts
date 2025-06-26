import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PLACEHOLDER_IMAGES = [
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400',
];

function getRandomImage() {
  return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
}

type BalldontlieResponse = {
  data: {
    first_name: string;
    last_name: string;
    nba_player_id: number | null;
  }[];
};

async function fetchNbaPlayerId(name: string): Promise<number | null> {
  // balldontlie API: https://www.balldontlie.io/api/v1/players?search=NAME
  const url = `https://www.balldontlie.io/api/v1/players?search=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: BalldontlieResponse = await res.json();
    if (json.data && json.data.length > 0) {
      // Try to find the best match (case-insensitive, full name)
      const match = json.data.find((p: any) => p.first_name && p.last_name && `${p.first_name} ${p.last_name}`.toLowerCase() === name.toLowerCase());
      if (match && match.nba_player_id) return match.nba_player_id;
      // fallback: use the first result if no perfect match
      if (json.data[0].nba_player_id) return json.data[0].nba_player_id;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function updateAllPlayerImages() {
  const { data: players, error } = await supabase.from('players').select('id, name, image_url');
  if (error) {
    console.error('Error fetching players:', error.message);
    return;
  }
  if (!players) {
    console.log('No players found.');
    return;
  }

  for (const player of players) {
    let newImage = getRandomImage();
    let usedNbaId = null;
    const nbaId = await fetchNbaPlayerId(player.name);
    if (nbaId) {
      newImage = `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
      usedNbaId = nbaId;
    }
    const { error: updateError } = await supabase
      .from('players')
      .update({ image_url: newImage })
      .eq('id', player.id);
    if (updateError) {
      console.error(`❌ Error updating ${player.name}:`, updateError.message);
    } else {
      if (usedNbaId) {
        console.log(`✅ Updated ${player.name} with NBA headshot (${usedNbaId})`);
      } else {
        console.log(`✅ Updated ${player.name} with placeholder image.`);
      }
    }
    await new Promise((res) => setTimeout(res, 300)); // Slightly longer delay for API
  }
  console.log('🏁 All player images updated.');
}

if (require.main === module) {
  updateAllPlayerImages();
} 