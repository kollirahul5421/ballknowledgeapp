-- Add a decades column to the rooms table for multi-decade support
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS decades text[]; 