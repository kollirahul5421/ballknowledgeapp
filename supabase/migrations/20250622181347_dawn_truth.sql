/*
  # Add decade support to players table

  1. Schema Changes
    - Add `primary_decade` column to players table
    - Set default values for existing players
    - Add check constraint for valid decades

  2. Data Migration
    - Update existing players with appropriate decades based on their era
*/

-- Add primary_decade column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'primary_decade'
  ) THEN
    ALTER TABLE players ADD COLUMN primary_decade text;
  END IF;
END $$;

-- Add check constraint for valid decades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'players_primary_decade_check'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_primary_decade_check 
    CHECK (primary_decade IN ('1980s', '1990s', '2000s', '2010s', '2020s'));
  END IF;
END $$;

-- Update existing players with appropriate decades
UPDATE players SET primary_decade = '2010s' WHERE primary_decade IS NULL AND name IN (
  'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo', 'Luka Dončić'
);

-- Set default for any remaining null values
UPDATE players SET primary_decade = '2020s' WHERE primary_decade IS NULL;

-- Make the column required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'primary_decade' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE players ALTER COLUMN primary_decade SET NOT NULL;
  END IF;
END $$;

-- Add index for decade filtering
CREATE INDEX IF NOT EXISTS idx_players_primary_decade ON players(primary_decade);