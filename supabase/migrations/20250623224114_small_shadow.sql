/*
  # Add game_mode column to rooms table

  1. Schema Changes
    - Add `game_mode` column to rooms table to support decade-based game modes
    - Set default value to 'all' for existing rooms
    - Add check constraint for valid game modes

  2. Data Migration
    - Update existing rooms with default 'all' game mode
*/

-- Add game_mode column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'game_mode'
  ) THEN
    ALTER TABLE rooms ADD COLUMN game_mode text DEFAULT 'all';
  END IF;
END $$;

-- Add check constraint for valid game modes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'rooms_game_mode_check'
  ) THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_game_mode_check 
    CHECK (game_mode IN ('all', '1980s', '1990s', '2000s', '2010s', '2020s'));
  END IF;
END $$;

-- Update existing rooms with default game mode
UPDATE rooms SET game_mode = 'all' WHERE game_mode IS NULL;

-- Make the column required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'game_mode' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE rooms ALTER COLUMN game_mode SET NOT NULL;
  END IF;
END $$;

-- Add index for game mode filtering
CREATE INDEX IF NOT EXISTS idx_rooms_game_mode ON rooms(game_mode);