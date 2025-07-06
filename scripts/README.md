# NBA Players Scripts

This directory contains scripts for managing NBA players data in the Supabase database.

## Player Data Structure

The cleaned player data is now stored in `playerData.ts` with the following structure:

```typescript
interface PlayerData {
  name: string;
  team: string;
  nbaPlayerId: number;
  imageUrl: string;
  primaryDecade: string;
}
```

### Key Changes Made:
- ✅ Removed `alternateNames` field
- ✅ Added proper `nbaPlayerId` for each player
- ✅ Updated `imageUrl` to use official NBA headshots
- ✅ Maintained `name`, `team`, and `primaryDecade` fields

## Available Scripts

### Verification
```bash
npm run verify-ids
```
Verifies that all players have correct NBA IDs and checks for duplicates.

### Upload to Supabase
```bash
# Upload all players
npm run upload-players

# Upload specific decades
npm run upload-players:2000s
npm run upload-players:2010s
```

The upload scripts will:
- Check for existing players to avoid duplicates
- Upload in batches of 50 players
- Provide detailed logging of the upload process
- Handle errors gracefully

## Player Categories

### 2010s Deep Bench Players (20 players)
Players who averaged less than 15 minutes per game in the 2010s, including:
- James Jones, Mike Miller, Shane Battier
- Role players and bench contributors
- Some notable draft busts (Darko Miličić, Kwame Brown, etc.)

### 2000s Role Players (20 players)
Players who averaged less than 20 minutes per game in the 2000s, including:
- Eric Snow, Aaron McKie, Tyrone Hill
- Championship role players
- Hall of Famers in their later years (Gary Payton, Karl Malone, etc.)

## Database Schema

The Supabase `nba_players` table expects:
- `name`: Player's full name
- `team`: Current team (or "Retired")
- `nba_player_id`: Official NBA player ID
- `image_url`: URL to player's headshot
- `decade`: Primary decade (2000s or 2010s)

## Environment Variables

Make sure you have these environment variables set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Usage Example

1. First, verify the data:
```bash
cd scripts
npm run verify-ids
```

2. Upload to Supabase:
```bash
npm run upload-players
```

3. Check specific decades:
```bash
npm run upload-players:2000s
npm run upload-players:2010s
```



## Notes

- All NBA IDs have been verified and are ready for upload
- Image URLs use the official NBA CDN format
- The upload script prevents duplicates by checking both NBA ID and player name
- Players are uploaded in batches to avoid rate limiting