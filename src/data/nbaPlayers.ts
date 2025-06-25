// NBA Players database with images from reliable sources
export interface NBAPlayer {
  id: string;
  name: string;
  team: string;
  imageUrl: string;
  alternateNames?: string[]; // For nickname/alternate spellings
}

export const NBA_PLAYERS: NBAPlayer[] = [
  {
    id: "lebron-james",
    name: "LeBron James",
    team: "Los Angeles Lakers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["LeBron", "King James", "The King"]
  },
  {
    id: "stephen-curry",
    name: "Stephen Curry",
    team: "Golden State Warriors", 
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Steph Curry", "Chef Curry", "Steph"]
  },
  {
    id: "kevin-durant",
    name: "Kevin Durant",
    team: "Phoenix Suns",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["KD", "The Slim Reaper", "Durantula"]
  },
  {
    id: "giannis-antetokounmpo",
    name: "Giannis Antetokounmpo",
    team: "Milwaukee Bucks",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Greek Freak", "Giannis"]
  },
  {
    id: "luka-doncic",
    name: "Luka Dončić",
    team: "Dallas Mavericks",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Luka Doncic", "Luka", "Wonder Boy"]
  },
  {
    id: "nikola-jokic",
    name: "Nikola Jokić",
    team: "Denver Nuggets",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Nikola Jokic", "The Joker", "Jokic"]
  },
  {
    id: "joel-embiid",
    name: "Joel Embiid",
    team: "Philadelphia 76ers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["The Process", "Embiid"]
  },
  {
    id: "jayson-tatum",
    name: "Jayson Tatum",
    team: "Boston Celtics",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["JT", "Tatum"]
  },
  {
    id: "jimmy-butler",
    name: "Jimmy Butler",
    team: "Miami Heat",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Jimmy Buckets", "Butler"]
  },
  {
    id: "kawhi-leonard",
    name: "Kawhi Leonard",
    team: "LA Clippers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["The Klaw", "Kawhi", "Board Man"]
  },
  {
    id: "paul-george",
    name: "Paul George",
    team: "LA Clippers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["PG13", "Playoff P", "PG"]
  },
  {
    id: "damian-lillard",
    name: "Damian Lillard",
    team: "Milwaukee Bucks",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Dame", "Dame Time", "Logo Lillard"]
  },
  {
    id: "anthony-davis",
    name: "Anthony Davis",
    team: "Los Angeles Lakers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["AD", "The Brow", "Davis"]
  },
  {
    id: "russell-westbrook",
    name: "Russell Westbrook",
    team: "LA Clippers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Russ", "Westbrook", "Mr. Triple Double"]
  },
  {
    id: "kyrie-irving",
    name: "Kyrie Irving",
    team: "Dallas Mavericks",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Kyrie", "Uncle Drew", "Irving"]
  },
  {
    id: "james-harden",
    name: "James Harden",
    team: "LA Clippers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["The Beard", "Harden", "Step Back King"]
  },
  {
    id: "devin-booker",
    name: "Devin Booker",
    team: "Phoenix Suns",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Book", "Booker", "D-Book"]
  },
  {
    id: "donovan-mitchell",
    name: "Donovan Mitchell",
    team: "Cleveland Cavaliers",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Spida", "Mitchell", "Donovan"]
  },
  {
    id: "trae-young",
    name: "Trae Young",
    team: "Atlanta Hawks",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Ice Trae", "Young", "Trae"]
  },
  {
    id: "zion-williamson",
    name: "Zion Williamson",
    team: "New Orleans Pelicans",
    imageUrl: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400",
    alternateNames: ["Zion", "Z-Will", "Williamson"]
  }
];

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