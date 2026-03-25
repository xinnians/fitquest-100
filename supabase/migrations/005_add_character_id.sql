-- Add character_id column to profiles table
-- Stores the user's selected companion character (e.g., 'flamey', 'bubbles', 'mochi')
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS character_id TEXT DEFAULT 'flamey';

-- Add comment for documentation
COMMENT ON COLUMN profiles.character_id IS 'Selected companion character ID from the 20 available mascots';
