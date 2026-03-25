-- Migration 008: XP/Coins gamification + notification enhancements
-- This migration:
--   1. Adds xp, level, coins columns to profiles
--   2. Creates grant_reward() SECURITY DEFINER function for atomic reward distribution
--   3. Enhances notification_log with user-facing columns and RLS policies

-- ============================================================
-- 1. Gamification columns on profiles
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN xp int NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN level int NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN coins int NOT NULL DEFAULT 0;

-- ============================================================
-- 2. Atomic reward granting function (SECURITY DEFINER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.grant_reward(p_user_id uuid, p_xp int, p_coins int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_xp int;
  v_new_coins int;
BEGIN
  UPDATE public.profiles
  SET xp = xp + p_xp, coins = coins + p_coins
  WHERE id = p_user_id
  RETURNING xp, coins INTO v_new_xp, v_new_coins;

  RETURN json_build_object('xp', v_new_xp, 'coins', v_new_coins);
END;
$$;

-- ============================================================
-- 3. Notification log enhancements
-- ============================================================

ALTER TABLE public.notification_log ADD COLUMN read_at timestamptz;
ALTER TABLE public.notification_log ADD COLUMN title text;
ALTER TABLE public.notification_log ADD COLUMN body text;

-- Allow users to read their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notification_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to mark notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notification_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, UPDATE ON public.notification_log TO authenticated;
