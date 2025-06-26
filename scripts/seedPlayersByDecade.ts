import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type PlayerSeed = {
  name: string;
  team: string;
  image_url: string;
  primary_decade: '1980s' | '1990s' | '2000s' | '2010s';
};

const PLACEHOLDER_IMAGES = [
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400',
];

function getRandomImage() {
  return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
}

const PLAYERS: PlayerSeed[] = [
  // 1980s Hall of Famers, All-Stars, Notables
  { name: 'Dominique Wilkins', team: 'Atlanta Hawks', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Clyde Drexler', team: 'Portland Trail Blazers', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Mark Price', team: 'Cleveland Cavaliers', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'James Worthy', team: 'Los Angeles Lakers', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Chris Mullin', team: 'Golden State Warriors', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Terry Porter', team: 'Portland Trail Blazers', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Dennis Johnson', team: 'Boston Celtics', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Fat Lever', team: 'Denver Nuggets', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Alex English', team: 'Denver Nuggets', image_url: getRandomImage(), primary_decade: '1980s' },
  { name: 'Jack Sikma', team: 'Seattle SuperSonics', image_url: getRandomImage(), primary_decade: '1980s' },

  // 1990s Hall of Famers, All-Stars, Notables
  { name: 'Mitch Richmond', team: 'Sacramento Kings', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Detlef Schrempf', team: 'Seattle SuperSonics', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Tim Hardaway', team: 'Miami Heat', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Glen Rice', team: 'Charlotte Hornets', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Latrell Sprewell', team: 'New York Knicks', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Shawn Kemp', team: 'Seattle SuperSonics', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Dan Majerle', team: 'Phoenix Suns', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Horace Grant', team: 'Chicago Bulls', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Hersey Hawkins', team: 'Philadelphia 76ers', image_url: getRandomImage(), primary_decade: '1990s' },
  { name: 'Kenny Anderson', team: 'New Jersey Nets', image_url: getRandomImage(), primary_decade: '1990s' },

  // 2000s Role Players/Non-Superstars
  { name: 'Shane Battier', team: 'Houston Rockets', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Jared Dudley', team: 'Phoenix Suns', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'James Posey', team: 'Miami Heat', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Steve Blake', team: 'Portland Trail Blazers', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Jared Jeffries', team: 'Washington Wizards', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Eduardo Nájera', team: 'Dallas Mavericks', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Rafer Alston', team: 'Houston Rockets', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Bo Outlaw', team: 'Orlando Magic', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Desmond Mason', team: 'Milwaukee Bucks', image_url: getRandomImage(), primary_decade: '2000s' },
  { name: 'Chris Duhon', team: 'Chicago Bulls', image_url: getRandomImage(), primary_decade: '2000s' },

  // 2010s Role Players/Non-Superstars
  { name: 'CJ Miles', team: 'Indiana Pacers', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Ed Davis', team: 'Portland Trail Blazers', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Patrick Patterson', team: 'Toronto Raptors', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Wayne Ellington', team: 'Miami Heat', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Garrett Temple', team: 'Sacramento Kings', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'James Johnson', team: 'Miami Heat', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Jodie Meeks', team: 'Los Angeles Lakers', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Dorell Wright', team: 'Golden State Warriors', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Al-Farouq Aminu', team: 'Portland Trail Blazers', image_url: getRandomImage(), primary_decade: '2010s' },
  { name: 'Reggie Bullock', team: 'Detroit Pistons', image_url: getRandomImage(), primary_decade: '2010s' },
];

async function playerExists(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('players')
    .select('name')
    .eq('name', name)
    .maybeSingle();
  if (error) {
    console.error(`Error checking existence for ${name}:`, error.message);
    return false;
  }
  return !!data;
}

async function insertPlayer(player: PlayerSeed): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .insert(player);
  if (error) {
    console.error(`❌ Error adding ${player.name}:`, error.message);
    return false;
  }
  return true;
}

export async function bulkUploadPlayersByDecade() {
  for (const player of PLAYERS) {
    if (await playerExists(player.name)) {
      console.log(`⏩ Skipped ${player.name} (${player.primary_decade} - ${player.team})`);
      continue;
    }
    const success = await insertPlayer(player);
    if (success) {
      console.log(`✅ Added ${player.name} (${player.primary_decade} - ${player.team})`);
    }
    await new Promise((res) => setTimeout(res, 200));
  }
}

if (require.main === module) {
  bulkUploadPlayersByDecade().then(() => {
    console.log('🏁 Seeding complete.');
    process.exit(0);
  });
} 