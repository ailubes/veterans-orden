-- Migration: 0025_add_badge_icons.sql
-- Update badges with icon URLs

UPDATE badges SET icon_url = '/images/badges/weekly_warrior.png' WHERE id = 'weekly_warrior';
UPDATE badges SET icon_url = '/images/badges/monthly_master.png' WHERE id = 'monthly_master';
UPDATE badges SET icon_url = '/images/badges/challenge_champion.png' WHERE id = 'challenge_champion';
UPDATE badges SET icon_url = '/images/badges/referral_star.png' WHERE id = 'referral_star';
UPDATE badges SET icon_url = '/images/badges/task_titan.png' WHERE id = 'task_titan';
UPDATE badges SET icon_url = '/images/badges/event_enthusiast.png' WHERE id = 'event_enthusiast';
UPDATE badges SET icon_url = '/images/badges/voting_voice.png' WHERE id = 'voting_voice';
UPDATE badges SET icon_url = '/images/badges/first_challenge.png' WHERE id = 'first_challenge';
UPDATE badges SET icon_url = '/images/badges/challenge_streak_3.png' WHERE id = 'challenge_streak_3';
UPDATE badges SET icon_url = '/images/badges/challenge_streak_5.png' WHERE id = 'challenge_streak_5';
