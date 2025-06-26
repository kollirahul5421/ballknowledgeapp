import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParse from 'csv-parse/sync';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importNbaIdsFromCsv() {
  const csvPath = path.join(__dirname, '../nba_id_lookup_results.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csvParse.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const row of records) {
    const name = row.name;
    const nbaId = row.nba_player_id;
    if (!nbaId) {
      console.log(`❓ No NBA ID for ${name}, skipping`);
      continue;
    }
    const imageUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
    const { error } = await supabase
      .from('players')
      .update({ nba_player_id: nbaId, image_url: imageUrl })
      .eq('name', name);
    if (error) {
      console.error(`❌ Error updating ${name}:`, error.message);
    } else {
      console.log(`✅ Updated ${name} with NBA ID: ${nbaId} and image.`);
    }
    await new Promise((res) => setTimeout(res, 100));
  }
  console.log('🏁 Import complete.');
}

if (require.main === module) {
  importNbaIdsFromCsv();
} 