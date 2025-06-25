# NBA Players Bulk Upload Script

This script bulk uploads NBA players to your Supabase database for the NBA Head-to-Head guessing game.

## Features

- ✅ Uploads 100 obscure NBA players (avoiding superstars)
- ✅ Handles duplicates gracefully (skips existing players)
- ✅ Uses realistic team assignments
- ✅ Provides valid image URLs
- ✅ Reusable - can run multiple times safely
- ✅ Progress tracking and detailed reporting

## Setup Instructions

### 1. Navigate to Scripts Directory
```bash
cd scripts
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Make sure your `.env` file in the root directory contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The script will automatically read these from your existing `.env` file.

## Usage

### Basic Usage (100 players)
```bash
npm run upload
```

### Custom Number of Players
```bash
# Upload 50 players
npm run upload:50

# Upload specific number
node bulk-upload-players.js 25
```

### Direct Node.js Execution
```bash
# Upload 100 players (default)
node bulk-upload-players.js

# Upload custom number
node bulk-upload-players.js 75
```

## What the Script Does

1. **Connects to Supabase** using your existing environment variables
2. **Checks for duplicates** before inserting each player
3. **Assigns random teams** from current NBA teams
4. **Generates image URLs** using a mix of NBA CDN format and placeholder images
5. **Provides detailed progress** with colored console output
6. **Handles errors gracefully** and continues processing
7. **Reports final statistics** showing added, skipped, and failed insertions

## Sample Output

```
🏀 Starting bulk upload of 100 NBA players...
📊 Checking existing players in database...

⚠️  Player "Bol Bol" already exists, skipping...
✅ Successfully added: Tacko Fall (Boston Celtics)
✅ Successfully added: Carsen Edwards (Miami Heat)
...

==================================================
🏀 BULK UPLOAD COMPLETE!
==================================================
✅ Successfully added: 87 players
⚠️  Skipped (duplicates): 13 players
❌ Errors: 0 players
📊 Total processed: 100 players
==================================================

🎉 Your NBA guessing game now has more players to challenge users!
```

## Player Selection Strategy

The script focuses on **obscure players** to make the guessing game more challenging:

- Current NBA bench players
- Recent draft picks
- Role players and specialists
- International players
- G-League call-ups
- Rookie and sophomore players

This avoids superstars like LeBron, Curry, Durant, etc., making the game more interesting for NBA fans.

## Error Handling

- **Duplicate names**: Automatically skipped with warning
- **Network errors**: Logged and script continues
- **Invalid data**: Logged with details
- **Missing environment variables**: Script exits with clear error message

## Customization

You can modify the script to:

- Add your own player list in the `OBSCURE_NBA_PLAYERS` array
- Change team assignments in the `NBA_TEAMS` array
- Modify image URL generation in `generateNBAImageUrl()`
- Adjust the delay between insertions (currently 100ms)

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure your `.env` file exists in the root directory
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### "Error inserting player"
- Check your Supabase RLS policies allow public insert
- Verify your database connection
- Ensure the `players` table exists with correct schema

### Script runs but no players added
- Check if all players already exist in your database
- Try running with a higher number: `node bulk-upload-players.js 200`

## Database Schema

The script expects this table structure:
```sql
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  team text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

This matches your existing database schema.