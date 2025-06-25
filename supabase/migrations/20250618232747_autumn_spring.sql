/*
  # Create rooms table for NBA Head-to-Head game

  1. New Tables
    - `rooms`
      - `code` (text, primary key) - 5-character room code
      - `player1` (text) - Player 1 name
      - `player2` (text, nullable) - Player 2 name
      - `status` (text) - Room status: waiting, lobby, playing, finished
      - `player1_ready` (boolean) - Player 1 ready status
      - `player2_ready` (boolean) - Player 2 ready status
      - `game_state` (jsonb, nullable) - Current game state
      - `created_at` (timestamptz) - Room creation time
      - `joined_at` (timestamptz, nullable) - When player 2 joined
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `rooms` table
    - Add policies for public read/write access (since this is a casual game)

  3. Indexes
    - Index on created_at for cleanup queries
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS rooms (
  code text PRIMARY KEY,
  player1 text NOT NULL,
  player2 text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'lobby', 'playing', 'finished')),
  player1_ready boolean NOT NULL DEFAULT false,
  player2_ready boolean NOT NULL DEFAULT false,
  game_state jsonb,
  created_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow public access for this casual game
CREATE POLICY "Allow public read access to rooms"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to rooms"
  ON rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to rooms"
  ON rooms
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to rooms"
  ON rooms
  FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();