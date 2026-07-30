/*
# Migration 011: Marketer algorithm v2 — add missing column

The redesigned marketer algorithm (85% win rate, guaranteed win-after-loss)
repurposes existing candle_players columns to avoid a schema change:

  mktr_bets_since_cluster  → consecutive wins
  mktr_losses_remaining    → pending win after loss (0 = none, 1 = pending)
  mktr_wins_until_cluster  → total bets counter
  mktr_consecutive_losses  → total wins counter  ← NEW column (was not in schema)

This migration adds the mktr_consecutive_losses column and resets all marketer
state so existing marketer users start fresh with the new algorithm.
*/

-- Add the new column used by the v2 marketer algorithm
alter table candle_players
  add column if not exists mktr_consecutive_losses integer default 0 not null;

-- Reset all marketer state columns so the new algorithm starts from a clean slate.
-- This is safe: the algorithm reconstructs win rate from the running counters,
-- and resetting prevents stale state from the old cluster-based algorithm
-- producing incorrect decisions in the new one.
update candle_players
set
  mktr_bets_since_cluster  = 0,   -- consecutive wins → 0
  mktr_losses_remaining    = 0,   -- pending win after loss → none
  mktr_wins_until_cluster  = 0,   -- total bets counter → 0
  mktr_consecutive_losses  = 0,   -- total wins counter → 0
  updated_at               = now();
