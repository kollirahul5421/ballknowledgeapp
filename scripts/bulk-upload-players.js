const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fs = require('fs');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// NBA team mappings for realistic team assignments
const NBA_TEAMS = [
  'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
  'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
  'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
  'LA Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
  'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
  'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
  'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
  'Utah Jazz', 'Washington Wizards'
];

// Curated list of lesser-known NBA players (mix of current and recent players)
const OBSCURE_NBA_PLAYERS = [
  'Bol Bol', 'Tacko Fall', 'Carsen Edwards', 'Tremont Waters', 'Grant Williams',
  'Romeo Langford', 'Semi Ojeleye', 'Javonte Green', 'Payton Pritchard', 'Aaron Nesmith',
  'Yam Madar', 'JD Davison', 'Mfiondu Kabengele', 'Bruno Fernando', 'Admiral Schofield',
  'Jalen McDaniels', 'Isaiah Joe', 'Tyrese Maxey', 'Paul Reed', 'Charles Bassey',
  'Filip Petrusev', 'Cassius Winston', 'Mason Jones', 'Skylar Mays', 'Kenrich Williams',
  'Darius Bazley', 'Isaiah Roby', 'Aleksej Pokusevski', 'Theo Maledon', 'Vit Krejci',
  'Gabriel Deck', 'Jaylen Hoard', 'CJ Elleby', 'Keljin Blevins', 'Trendon Watford',
  'Greg Brown III', 'Keon Johnson', 'Day\'Ron Sharpe', 'Cam Thomas', 'David Duke Jr.',
  'Nic Claxton', 'Kessler Edwards', 'Marcus Zegarowski', 'Scottie Lewis', 'Jericho Sims',
  'Miles McBride', 'Quentin Grimes', 'Rokas Jokubaitis', 'Luka Samanic', 'Tre Jones',
  'Devin Vassell', 'Keldon Johnson', 'Joshua Primo', 'Joe Wieskamp', 'Malaki Branham',
  'Blake Wesley', 'Jeremy Sochan', 'Keita Bates-Diop', 'Gorgui Dieng', 'Thaddeus Young',
  'Tomas Satoransky', 'Davis Bertans', 'Montrezl Harrell', 'Kendrick Nunn', 'Gabe Vincent',
  'Max Strus', 'Caleb Martin', 'Omer Yurtseven', 'Haywood Highsmith', 'Nikola Jovic',
  'Orlando Robinson', 'Dru Smith', 'Jamal Cain', 'Scotty Pippen Jr.', 'Kennedy Chandler',
  'Jake LaRavia', 'David Roddy', 'Vince Williams Jr.', 'Kenneth Lofton Jr.', 'Ziaire Williams',
  'Xavier Tillman', 'Brandon Clarke', 'John Konchar', 'Tyus Jones', 'De\'Anthony Melton',
  'Danny Green', 'Furkan Korkmaz', 'Shake Milton', 'Georges Niang', 'Danuel House Jr.',
  'Isaiah Stewart', 'Killian Hayes', 'Saddiq Bey', 'Hamidou Diallo', 'Frank Jackson',
  'Rodney McGruder', 'Cory Joseph', 'Kelly Olynyk', 'Marvin Bagley III', 'Jalen Duren',
  'Cade Cunningham', 'Isaiah Livers', 'Luka Garza', 'Cassius Stanley', 'Braxton Key',
  'Chris Duarte', 'Isaiah Jackson', 'Duane Washington Jr.', 'Terry Taylor', 'Lance Stephenson',
  'Oshae Brissett', 'Keifer Sykes', 'Goga Bitadze', 'Jalen Smith', 'Torrey Craig',
  'Aaron Holiday', 'T.J. McConnell', 'Justin Anderson', 'Edmond Sumner', 'Naz Reid',
  'Jaylen Nowell', 'Jaden McDaniels', 'Josh Okogie', 'Taurean Prince', 'Nathan Knight',
  'McKinley Wright IV', 'Leandro Bolmaro', 'Josh Minott', 'Wendell Moore Jr.', 'Walker Kessler',
  'Ochai Agbaji', 'Collin Sexton', 'Lauri Markkanen', 'Jordan Clarkson', 'Malik Beasley',
  'Jarred Vanderbilt', 'Rudy Gay', 'Danilo Gallinari', 'Simone Fontecchio', 'Talen Horton-Tucker',
  'Udoka Azubuike', 'Nickeil Alexander-Walker', 'Kira Lewis Jr.', 'Jaxson Hayes', 'Naji Marshall',
  'Jose Alvarado', 'Garrett Temple', 'Willy Hernangomez', 'Dyson Daniels', 'E.J. Liddell'
];

// Function to get a random team
function getRandomTeam() {
  return NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];
}

// Function to generate NBA headshot URL (using NBA CDN format)
function generateNBAImageUrl(playerName) {
  // For demo purposes, we'll use a mix of placeholder images and NBA CDN format
  const imageOptions = [
    `https://cdn.nba.com/headshots/nba/latest/1040x760/${Math.floor(Math.random() * 1000000)}.png`,
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];
  
  return imageOptions[Math.floor(Math.random() * imageOptions.length)];
}

// Function to check if player already exists
async function playerExists(playerName) {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id')
      .eq('name', playerName)
      .maybeSingle();

    if (error) {
      console.error(`Error checking if player exists: ${error.message}`);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error(`Error checking player existence: ${error.message}`);
    return false;
  }
}

// Function to insert a single player
async function insertPlayer(playerData) {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log(`⚠️  Player "${playerData.name}" already exists, skipping...`);
        return { success: true, skipped: true };
      }
      console.error(`❌ Error inserting player "${playerData.name}": ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`✅ Successfully added: ${playerData.name} (${playerData.team})`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Unexpected error inserting player "${playerData.name}": ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Main function to bulk upload players
async function bulkUploadPlayers(targetCount = 100) {
  console.log(`🏀 Starting bulk upload of ${targetCount} NBA players...`);
  console.log('📊 Checking existing players in database...\n');

  const shuffledPlayers = shuffleArray(OBSCURE_NBA_PLAYERS);
  const playersToAdd = [];
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Prepare players data
  for (let i = 0; i < Math.min(targetCount, shuffledPlayers.length); i++) {
    const playerName = shuffledPlayers[i];
    
    // Check if player already exists
    const exists = await playerExists(playerName);
    if (exists) {
      console.log(`⚠️  Player "${playerName}" already exists, skipping...`);
      skippedCount++;
      continue;
    }

    const playerData = {
      name: playerName,
      team: getRandomTeam(),
      image_url: generateNBAImageUrl(playerName)
    };

    playersToAdd.push(playerData);
  }

  console.log(`\n📝 Prepared ${playersToAdd.length} new players to add...`);
  console.log('🚀 Starting upload process...\n');

  // Insert players one by one to handle duplicates gracefully
  for (const playerData of playersToAdd) {
    const result = await insertPlayer(playerData);
    
    if (result.success) {
      if (result.skipped) {
        skippedCount++;
      } else {
        addedCount++;
      }
    } else {
      errorCount++;
    }

    // Add small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // If we need more players and have exhausted our list, generate some variations
  if (addedCount < targetCount && playersToAdd.length < targetCount) {
    console.log('\n🔄 Generating additional player variations...');
    
    const additionalNeeded = targetCount - addedCount - skippedCount;
    for (let i = 0; i < additionalNeeded; i++) {
      const baseName = shuffledPlayers[i % shuffledPlayers.length];
      const variations = [
        `${baseName} Jr.`,
        `${baseName} II`,
        `${baseName} III`,
        `${baseName.split(' ')[0]} ${baseName.split(' ')[1] || 'Smith'}son`,
      ];
      
      const variantName = variations[i % variations.length];
      const exists = await playerExists(variantName);
      
      if (!exists) {
        const playerData = {
          name: variantName,
          team: getRandomTeam(),
          image_url: generateNBAImageUrl(variantName)
        };

        const result = await insertPlayer(playerData);
        if (result.success && !result.skipped) {
          addedCount++;
        } else if (result.skipped) {
          skippedCount++;
        } else {
          errorCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('🏀 BULK UPLOAD COMPLETE!');
  console.log('='.repeat(50));
  console.log(`✅ Successfully added: ${addedCount} players`);
  console.log(`⚠️  Skipped (duplicates): ${skippedCount} players`);
  console.log(`❌ Errors: ${errorCount} players`);
  console.log(`📊 Total processed: ${addedCount + skippedCount + errorCount} players`);
  console.log('='.repeat(50));

  if (addedCount > 0) {
    console.log('\n🎉 Your NBA guessing game now has more players to challenge users!');
  }
}

// Run the script
if (require.main === module) {
  const targetCount = process.argv[2] ? parseInt(process.argv[2]) : 100;
  
  if (isNaN(targetCount) || targetCount <= 0) {
    console.error('❌ Please provide a valid number of players to add');
    console.log('Usage: node bulk-upload-players.js [number_of_players]');
    process.exit(1);
  }

  bulkUploadPlayers(targetCount)
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { bulkUploadPlayers };