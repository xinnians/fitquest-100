-- Migration 009: Achievements, Mini-games tracking, Reward shop
-- This migration:
--   1. Creates user_achievements table for tracking unlocked achievements
--   2. Adds mini-game tracking columns to profiles
--   3. Creates purchases table for the reward shop

-- ============================================================
-- 1. User Achievements
-- ============================================================

CREATE TABLE public.user_achievements (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Challenge peers can view each other's achievements
CREATE POLICY "Peers can view achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT public.get_my_challenge_peer_ids()));

GRANT SELECT ON public.user_achievements TO authenticated;

-- ============================================================
-- 2. Mini-game tracking on profiles
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN last_wheel_date date;
ALTER TABLE public.profiles ADD COLUMN last_quiz_date date;
ALTER TABLE public.profiles ADD COLUMN wheel_exercise_type text;

-- ============================================================
-- 3. Purchases (reward shop)
-- ============================================================

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  coins_spent int NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchases_user ON public.purchases (user_id, purchased_at DESC);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.purchases TO authenticated;
