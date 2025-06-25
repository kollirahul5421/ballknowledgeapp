/*
  # Create players table for NBA Head-to-Head game

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text, unique, required) - Player name
      - `team` (text, required) - Player team
      - `image_url` (text, required) - Player image URL
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `players` table
    - Add policies for public read/write access (admin functionality)

  3. Indexes
    - Index on name for quick lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  team text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow public access for admin functionality
CREATE POLICY "Allow public read access to players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to players"
  ON players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to players"
  ON players
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to players"
  ON players
  FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);
CREATE INDEX IF NOT EXISTS idx_players_updated_at ON players(updated_at);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample NBA players
INSERT INTO players (name, team, image_url) VALUES
  ('LeBron James', 'Los Angeles Lakers', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Stephen Curry', 'Golden State Warriors', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Kevin Durant', 'Phoenix Suns', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Giannis Antetokounmpo', 'Milwaukee Bucks', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Luka Dončić', 'Dallas Mavericks', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (name) DO NOTHING;