// Utility function to get random player
export const getRandomPlayer = (excludeIds: string[] = []): NBAPlayer => {
  const availablePlayers = NBA_PLAYERS.filter(player => !excludeIds.includes(player.id));
  if (availablePlayers.length === 0) {
    // If all players used, reset and pick from full list
    return NBA_PLAYERS[Math.floor(Math.random() * NBA_PLAYERS.length)];
  }
  return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
};

// Utility function for fuzzy name matching with Levenshtein distance
export const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Check if guess matches player name (with typo tolerance)
export const isCorrectGuess = (guess: string, player: NBAPlayer): boolean => {
  const normalizedGuess = guess.toLowerCase().trim();
  
  // Check exact match with main name
  if (normalizedGuess === player.name.toLowerCase()) return true;
  
  // Check alternate names
  if (player.alternateNames) {
    for (const altName of player.alternateNames) {
      if (normalizedGuess === altName.toLowerCase()) return true;
    }
  }
  
  // Check with Levenshtein distance ≤ 1 for main name
  if (calculateLevenshteinDistance(normalizedGuess, player.name.toLowerCase()) <= 1) {
    return true;
  }
  
  // Check with Levenshtein distance ≤ 1 for alternate names
  if (player.alternateNames) {
    for (const altName of player.alternateNames) {
      if (calculateLevenshteinDistance(normalizedGuess, altName.toLowerCase()) <= 1) {
        return true;
      }
    }
  }
  
  return false;
};