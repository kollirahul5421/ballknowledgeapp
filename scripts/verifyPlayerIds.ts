import { allPlayers } from './playerData';

// Test a few players to verify their NBA IDs
const testPlayers = [
  "James Jones",
  "Mike Miller", 
  "Shane Battier",
  "Derek Fisher",
  "Robert Horry",
  "Gary Payton",
  "Karl Malone",
  "John Stockton"
];

console.log('Verifying NBA Player IDs...\n');

testPlayers.forEach(playerName => {
  const player = allPlayers.find(p => p.name === playerName);
  if (player) {
    console.log(`✅ ${player.name}:`);
    console.log(`   NBA ID: ${player.nbaPlayerId}`);
    console.log(`   Team: ${player.team}`);
    console.log(`   Decade: ${player.primaryDecade}`);
    console.log(`   Image URL: ${player.imageUrl}`);
    console.log('');
  } else {
    console.log(`❌ Player not found: ${playerName}`);
  }
});

console.log(`Total players in dataset: ${allPlayers.length}`);
console.log(`2000s players: ${allPlayers.filter(p => p.primaryDecade === '2000s').length}`);
console.log(`2010s players: ${allPlayers.filter(p => p.primaryDecade === '2010s').length}`);

// Check for any duplicate NBA IDs
const nbaIds = allPlayers.map(p => p.nbaPlayerId);
const uniqueIds = new Set(nbaIds);
const duplicates = nbaIds.filter((id, index) => nbaIds.indexOf(id) !== index);

if (duplicates.length > 0) {
  console.log('\n⚠️  WARNING: Duplicate NBA IDs found:');
  duplicates.forEach(id => {
    const playersWithId = allPlayers.filter(p => p.nbaPlayerId === id);
    console.log(`   NBA ID ${id}: ${playersWithId.map(p => p.name).join(', ')}`);
  });
} else {
  console.log('\n✅ No duplicate NBA IDs found');
}

// Check for any missing NBA IDs
const playersWithoutIds = allPlayers.filter(p => !p.nbaPlayerId);
if (playersWithoutIds.length > 0) {
  console.log('\n⚠️  WARNING: Players without NBA IDs:');
  playersWithoutIds.forEach(p => console.log(`   ${p.name}`));
} else {
  console.log('\n✅ All players have NBA IDs');
} 