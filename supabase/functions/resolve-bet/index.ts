/**
 * Supabase Edge Function: resolve-bet
 *
 * Routes to one of two algorithms based on the user's role:
 *   - TRADER  (default): house-edge algorithm — house never loses long-term
 *   - MARKETER: impressive-win algorithm — generates screenshot-worthy sessions
 *   - 85% win rate with loss→win guarantee
 *
 * Deploy:
 *   npx supabase functions deploy resolve-bet \
 *     --project-ref vdiyzbegklhngucpmkrx \
 *     --no-verify-jwt --use-api
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL             = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRADER ALGORITHM — house-edge algorithm, house never loses long-term
// ═══════════════════════════════════════════════════════════════════════════════

const SAFE_BET_CENTS            = 10000;
const DYNAMIC_T_MULTIPLIER      = 5;
const DEFAULT_T_CENTS           = 50000;
const NEAR_RECOVERY_MIN         = 0.70;
const NEAR_RECOVERY_MAX         = 0.90;
const MICRO_WIN_MIN             = 1.05;
const MICRO_WIN_MAX             = 1.08;
const WIN_MIN                   = 1.10;
const WIN_MAX                   = 1.98;
const T_FLOOR_CENTS             = 20000;
const T_CEILING_CENTS           = 10000000;
const MICRO_WIN_COOLDOWN_MIN    = 3;
const MICRO_WIN_COOLDOWN_MAX    = 6;
const MICRO_WIN_MAX_PER_CYCLE   = 4;
const DAILY_MICRO_WIN_CAP_CENTS = 10000;

function getTimeMultiplier(): number {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 0.8;
  if (h >= 12 && h < 18) return 1.0;
  if (h >= 18 && h < 23) return 1.3;
  return 1.6;
}
function getStreakMultiplier(s: number): number {
  if (s <= 3) return 1.0;
  if (s <= 6) return 0.9;
  if (s <= 9) return 0.75;
  return 0.60;
}
function getWithdrawalMultiplier(d: number, w: number): number {
  if (d === 0) return 1.0;
  const r = w / d;
  if (w === 0)   return 1.4;
  if (r < 0.3)   return 1.1;
  if (r < 0.6)   return 1.0;
  return 0.7;
}
function getDroughtMultiplier(days: number): number {
  if (days <= 1) return 1.2;
  if (days <= 3) return 1.0;
  if (days <= 5) return 0.8;
  if (days <= 7) return 0.6;
  return 0.4;
}
function getLtvMultiplier(c: number): number {
  const k = c / 100;
  if (k < 500)   return 0.8;
  if (k < 2000)  return 1.0;
  if (k < 10000) return 1.3;
  return 1.0;
}
function calcDynamicT(p: any): number {
  const baseT = p.max_single_deposit_cents === 0
    ? DEFAULT_T_CENTS
    : p.max_single_deposit_cents * DYNAMIC_T_MULTIPLIER;
  const daysSince = p.last_authorized_win_date
    ? Math.floor((Date.now() - new Date(p.last_authorized_win_date).getTime()) / 86400000)
    : 999;
  const t = baseT
    * getTimeMultiplier()
    * getStreakMultiplier(p.loss_streak_counter)
    * getWithdrawalMultiplier(p.lifetime_deposits_cents, p.lifetime_withdrawals_cents)
    * getDroughtMultiplier(daysSince)
    * getLtvMultiplier(p.lifetime_deposits_cents);
  return Math.max(T_FLOOR_CENTS, Math.min(T_CEILING_CENTS, t));
}
function calcAuthorizedWin(losses: number, bet: number): { mult: number; silentBonus: number } {
  if (losses <= 0) return { mult: rand(WIN_MIN, WIN_MAX), silentBonus: 0 };
  const target     = Math.floor(losses * rand(NEAR_RECOVERY_MIN, NEAR_RECOVERY_MAX));
  const req        = 1 + target / bet;
  const display    = Math.min(req, WIN_MAX);
  const dispProfit = Math.floor(bet * (display - 1));
  return { mult: display, silentBonus: Math.max(0, target - dispProfit) };
}
function trendingLoss(streak: number): number {
  if (streak === 1) return rand(0.63, 0.65);
  if (streak === 2) return rand(0.60, 0.62);
  if (streak === 3) return rand(0.57, 0.59);
  if (streak === 4) return rand(0.54, 0.56);
  if (streak === 5) return rand(0.51, 0.53);
  return rand(0.48, 0.50);
}
function shouldMicroWin(p: any, T: number): boolean {
  if (p.loss_streak_counter < 2)                                   return false;
  if (p.micro_win_cooldown > 0)                                    return false;
  if (p.micro_wins_this_cycle >= MICRO_WIN_MAX_PER_CYCLE)          return false;
  if (p.daily_micro_win_profit_cents >= DAILY_MICRO_WIN_CAP_CENTS) return false;
  if (p.pending_authorized_win)                                    return false;
  if (p.current_balance_cents < SAFE_BET_CENTS * 3)               return false;
  const netSpend  = p.lifetime_deposits_cents - p.lifetime_withdrawals_cents;
  const threshold = p.max_single_deposit_cents === 0
    ? DEFAULT_T_CENTS * 3
    : p.max_single_deposit_cents * 3;
  return (T - netSpend) <= threshold;
}

function resolveTraderBet(p: any, betCents: number): {
  multiplier: number; silentBonus: number; isWin: boolean; message: string;
  updates: Record<string, any>;
} {
  const todayStr = new Date().toISOString().split("T")[0];

  let sessionLosses      = p.session_losses_cents;
  let lossStreak         = p.loss_streak_counter;
  let microWinCooldown   = p.micro_win_cooldown;
  let microWinsThisCycle = p.micro_wins_this_cycle;
  let dailyMicroProfit   = p.daily_micro_win_profit_cents ?? 0;
  let pendingAuthWin     = p.pending_authorized_win;
  let firstBetToday      = p.first_bet_today;
  let lastWinDate        = p.last_authorized_win_date;

  // Midnight resets
  if (!p.last_midnight_check || p.last_midnight_check !== todayStr) {
    dailyMicroProfit = 0;
    firstBetToday    = true;
  }

  let multiplier  = 0;
  let silentBonus = 0;
  let isWin       = false;
  let message     = "";
  const currentT  = calcDynamicT(p);

  if (firstBetToday) {
    firstBetToday = false;
    if (betCents <= SAFE_BET_CENTS) {
      multiplier    = rand(WIN_MIN, WIN_MAX); isWin = true;
      sessionLosses = Math.max(0, sessionLosses - Math.floor(betCents * (multiplier - 1)));
      message       = "Morning signal confirmed.";
    } else if (betCents < 20000) {
      multiplier    = rand(0.90, 0.99); isWin = false;
      sessionLosses += betCents - Math.floor(betCents * multiplier);
      lossStreak++;  message = "Slippage on oversized entry.";
    } else {
      multiplier    = 0.00; isWin = false;
      sessionLosses += betCents; lossStreak++;
      message       = "Position liquidated.";
    }
  } else {
    const netSpend = p.lifetime_deposits_cents - p.lifetime_withdrawals_cents;
    if (pendingAuthWin) {
      pendingAuthWin = false;
      const { mult, silentBonus: sb } = calcAuthorizedWin(sessionLosses, betCents);
      multiplier = mult; silentBonus = sb; isWin = true; lastWinDate = todayStr;
      sessionLosses = 0; lossStreak = 0;
      microWinCooldown = 0; microWinsThisCycle = 0; dailyMicroProfit = 0;
      message = "Breakout confirmed.";
    } else if (netSpend >= currentT) {
      const { mult, silentBonus: sb } = calcAuthorizedWin(sessionLosses, betCents);
      multiplier = mult; silentBonus = sb; isWin = true; lastWinDate = todayStr;
      sessionLosses = 0; lossStreak = 0;
      microWinCooldown = 0; microWinsThisCycle = 0; dailyMicroProfit = 0;
      message = "Trend reversal confirmed.";
    } else if (shouldMicroWin({
      ...p,
      loss_streak_counter:          lossStreak,
      micro_win_cooldown:           microWinCooldown,
      micro_wins_this_cycle:        microWinsThisCycle,
      daily_micro_win_profit_cents: dailyMicroProfit,
      pending_authorized_win:       pendingAuthWin,
    }, currentT)) {
      const rawMult   = rand(MICRO_WIN_MIN, MICRO_WIN_MAX);
      const rawProfit = Math.floor(betCents * (rawMult - 1));
      const remaining = DAILY_MICRO_WIN_CAP_CENTS - dailyMicroProfit;
      const allowed   = Math.max(0, Math.min(rawProfit, remaining));
      multiplier      = allowed > 0 ? 1 + allowed / betCents : 1.0;
      isWin           = true;
      dailyMicroProfit  += allowed;
      microWinCooldown   = randInt(MICRO_WIN_COOLDOWN_MIN, MICRO_WIN_COOLDOWN_MAX);
      microWinsThisCycle++;
      message = "Momentum shift detected.";
    } else {
      lossStreak++;
      if (microWinCooldown > 0) microWinCooldown--;
      multiplier    = trendingLoss(lossStreak); isWin = false;
      sessionLosses += betCents - Math.floor(betCents * multiplier);
      message       = "Pullback continues.";
    }
  }

  return {
    multiplier, silentBonus, isWin, message,
    updates: {
      session_losses_cents:          sessionLosses,
      loss_streak_counter:           lossStreak,
      micro_win_cooldown:            microWinCooldown,
      micro_wins_this_cycle:         microWinsThisCycle,
      daily_micro_win_profit_cents:  dailyMicroProfit,
      pending_authorized_win:        pendingAuthWin,
      first_bet_today:               firstBetToday,
      last_midnight_check:           new Date().toISOString().split("T")[0],
      last_authorized_win_date:      lastWinDate,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETER ALGORITHM (REDESIGNED — 85% WIN RATE)
// Uses existing database fields (NO SCHEMA CHANGES)
//
// Field Mapping:
//   mktr_bets_since_cluster  → consecutive wins
//   mktr_losses_remaining    → pending win after loss (0 = none, 1 = pending)
//   mktr_wins_until_cluster  → total bets counter
//   mktr_consecutive_losses  → total wins counter  (NOTE: misnamed but reused)
//
// Rules:
//   1. Every loss MUST be followed by a win
//   2. 85% overall win rate
//   3. No consecutive losses
//   4. Pattern: L → W (loss always followed by win)
// ═══════════════════════════════════════════════════════════════════════════════

const MKT_WIN_MIN              = 3.05;
const MKT_WIN_MAX              = 4.08;
const MKT_LOSS_MIN             = 0.85;
const MKT_LOSS_MAX             = 0.92;
const MKT_BIG_LOSS_MIN         = 0.72;
const MKT_BIG_LOSS_MAX         = 0.80;
const MKT_BIG_LOSS_CHANCE      = 0.15;   // 15% of losses are "big"
const MKT_TARGET_WIN_RATE      = 0.85;   // 85% win rate
const MKT_LOSS_CHANCE_BASE     = 0.15;   // 15% base loss chance
const MKT_MIN_WINS_BEFORE_LOSS = 2;      // Minimum wins before a loss can occur
const MKT_MAX_CONSECUTIVE_WINS = 15;     // Safety cap (rarely reached)

function resolveMarketerBet(p: any, betCents: number): {
  multiplier: number; silentBonus: number; isWin: boolean; message: string;
  updates: Record<string, any>;
} {
  // ── Extract state from existing fields ──────────────────────────────────────
  // mktr_bets_since_cluster  → consecutive wins
  let consecutiveWins     = p.mktr_bets_since_cluster ?? 0;
  // mktr_losses_remaining    → pending win after loss (0 = no pending, 1 = pending)
  let pendingWinAfterLoss = (p.mktr_losses_remaining ?? 0) === 1;
  // mktr_wins_until_cluster  → total bets counter
  let totalBets           = p.mktr_wins_until_cluster ?? 0;
  // mktr_consecutive_losses  → total wins counter (field repurposed)
  let totalWins           = p.mktr_consecutive_losses ?? 0;

  let betsSinceLastLoss = consecutiveWins > 0 ? consecutiveWins : 0;

  let isWin      = false;
  let isBigLoss  = false;
  let multiplier = 0;
  let message    = "";

  const buildWinMultiplier = () => {
    const base = rand(MKT_WIN_MIN, MKT_WIN_MAX);
    let m = Math.random() < 0.90
      ? Math.round(base * 100) / 100
      : Math.round((base + rand(-0.005, 0.005)) * 1000) / 1000;
    m = Math.max(MKT_WIN_MIN, Math.min(MKT_WIN_MAX, m));
    return Math.round(m * 100) / 100;
  };

  const buildLossMultiplier = (big: boolean) => {
    const range = big
      ? { min: MKT_BIG_LOSS_MIN, max: MKT_BIG_LOSS_MAX }
      : { min: MKT_LOSS_MIN,     max: MKT_LOSS_MAX     };
    return Math.round(rand(range.min, range.max) * 100) / 100;
  };

  const buildUpdates = () => ({
    mktr_bets_since_cluster:  consecutiveWins,
    mktr_losses_remaining:    pendingWinAfterLoss ? 1 : 0,
    mktr_wins_until_cluster:  totalBets,
    mktr_consecutive_losses:  totalWins,
  });

  // ── Rule 1: Pending win after loss — force a win ────────────────────────────
  if (pendingWinAfterLoss) {
    isWin = true; pendingWinAfterLoss = false;
    consecutiveWins++; totalWins++; totalBets++;
    multiplier = buildWinMultiplier();
    const msgs = [
      "Recovery confirmed! 🚀", "Bounce back! 📈",
      "Strong comeback! 💪",    "Loss recovered! ✅",
      "Reversal confirmed! 🔄",
    ];
    message = msgs[Math.floor(Math.random() * msgs.length)];
    return { multiplier, silentBonus: 0, isWin, message, updates: buildUpdates() };
  }

  // ── Rule 2: Safety cap — force a loss if streak is too long ─────────────────
  if (consecutiveWins >= MKT_MAX_CONSECUTIVE_WINS) {
    isWin = false;
    isBigLoss = Math.random() < MKT_BIG_LOSS_CHANCE;
    pendingWinAfterLoss = true;
    consecutiveWins = 0; totalBets++;
    multiplier = buildLossMultiplier(isBigLoss);
    message = "Extended win streak. Healthy correction.";
    return { multiplier, silentBonus: 0, isWin, message, updates: buildUpdates() };
  }

  // ── Rule 3: Force win to maintain 85% rate ──────────────────────────────────
  const currentWinRate = totalBets > 0 ? totalWins / totalBets : 0;
  if (totalBets > 0 && currentWinRate < MKT_TARGET_WIN_RATE) {
    isWin = true;
    consecutiveWins++; totalWins++; totalBets++;
    multiplier = buildWinMultiplier();
    message = "Maintaining momentum! 📈";
    return { multiplier, silentBonus: 0, isWin, message, updates: buildUpdates() };
  }

  // ── Rule 4: Minimum wins before a loss can occur ────────────────────────────
  if (consecutiveWins < MKT_MIN_WINS_BEFORE_LOSS) {
    isWin = true;
    consecutiveWins++; totalWins++; totalBets++;
    multiplier = buildWinMultiplier();
    message = "Building momentum! 📊";
    return { multiplier, silentBonus: 0, isWin, message, updates: buildUpdates() };
  }

  // ── Rule 5: Normal 85/15 probabilistic decision ─────────────────────────────
  let lossChance = MKT_LOSS_CHANCE_BASE;
  if      (betsSinceLastLoss > 10) lossChance = 0.18;
  else if (betsSinceLastLoss >  5) lossChance = 0.16;
  else if (betsSinceLastLoss <  2) lossChance = 0.14;

  const shouldLose = Math.random() < lossChance;

  if (shouldLose) {
    isWin = false;
    isBigLoss = Math.random() < MKT_BIG_LOSS_CHANCE;
    pendingWinAfterLoss = true;
    consecutiveWins = 0; totalBets++;
    multiplier = buildLossMultiplier(isBigLoss);
    const lossMessages = isBigLoss
      ? [
          "Minor correction. Setup for next move! 📉",
          "Healthy retracement. Opportunity ahead! 🔄",
          "Taking profits. Re-entry imminent! 💼",
          "Short-term dip. Uptrend intact! 📊",
        ]
      : [
          "Tight stop. Next signal loading! ⏳",
          "Small retracement. Holding pattern! 📈",
          "Shakeout. Buyers stepping in! 🛒",
          "Pullback. Resistance ahead! 🎯",
        ];
    message = lossMessages[Math.floor(Math.random() * lossMessages.length)];
  } else {
    isWin = true;
    consecutiveWins++; totalWins++; totalBets++;
    multiplier = buildWinMultiplier();
    const winMessages = [
      "Bullish breakout! 🚀",        "Long signal confirmed! ✅",
      "Resistance broken! 💥",        "Momentum surge! 📈",
      "Volume spike detected! 🔊",    "Pattern breakout! 🎯",
      "Whale accumulation! 🐋",       "Breakout confirmed! 🎉",
      "Strong trend continuation! 📊","Support held strong! 🛡️",
    ];
    if      (consecutiveWins >= 5) message = "🔥 " + winMessages[Math.floor(Math.random() * 3)]  + " Running hot!";
    else if (consecutiveWins >= 3) message = "⚡ " + winMessages[Math.floor(Math.random() * 4)]  + " Streak continues!";
    else                           message = winMessages[Math.floor(Math.random() * winMessages.length)];
  }

  return { multiplier, silentBonus: 0, isWin, message, updates: buildUpdates() };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return new Response("Method not allowed", { status: 405 });

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonKey    = req.headers.get("apikey") ?? "";
    const userClient = createClient(SUPABASE_URL, anonKey || SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body       = await req.json();
    const betCents: number   = Math.round(Number(body.bet_amount_cents));
    const prediction: string = body.prediction;

    if (!betCents || betCents <= 0)
      return new Response(JSON.stringify({ error: "Invalid bet amount" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    if (prediction !== "up" && prediction !== "down")
      return new Response(JSON.stringify({ error: "prediction must be 'up' or 'down'" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    // ── Check user role ────────────────────────────────────────────────────────
    const { data: roleRow } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["marketer", "admin"])
      .maybeSingle();
    const isMarketer = roleRow?.role === "marketer";

    // ── Ensure player row exists ──────────────────────────────────────────────
    await db.from("candle_players").upsert(
      { user_id: user.id },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    // ── Load player state ──────────────────────────────────────────────────────
    const { data: p, error: pErr } = await db
      .from("candle_players")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (pErr || !p)
      return new Response(JSON.stringify({ error: "Player profile not found" }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });

    // ── Load wallet ────────────────────────────────────────────────────────────
    const { data: wallet } = await db
      .from("wallets")
      .select("id, balance_cents")
      .eq("user_id", user.id)
      .eq("wallet_type", "main")
      .single();
    if (!wallet || wallet.balance_cents < betCents)
      return new Response(
        JSON.stringify({ error: "Insufficient balance. Please deposit funds first." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );

    // ── Run the correct algorithm ─────────────────────────────────────────────
    const result = isMarketer
      ? resolveMarketerBet(p, betCents)
      : resolveTraderBet(p, betCents);

    const { multiplier, silentBonus, isWin, message, updates } = result;

    // ── Calculate final returns ───────────────────────────────────────────────
    const grossReturn = Math.floor(betCents * multiplier) + silentBonus;
    const netProfit   = grossReturn - betCents;
    const newBalance  = wallet.balance_cents - betCents + grossReturn;

    // ── Persist all changes atomically ────────────────────────────────────────
    await Promise.all([
      db.from("wallets").update({
        balance_cents: newBalance,
        updated_at:    new Date().toISOString(),
      }).eq("id", wallet.id),

      db.from("candle_players").update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id),

      db.from("candle_bets").insert({
        user_id:            user.id,
        bet_amount_cents:   betCents,
        prediction,
        outcome:            isWin ? "win" : "loss",
        multiplier:         Math.round(multiplier * 100) / 100,
        gross_return_cents: grossReturn,
        net_profit_cents:   netProfit,
        silent_bonus_cents: silentBonus,
        message,
      }),

      db.from("transactions").insert({
        user_id:      user.id,
        wallet_id:    wallet.id,
        type:         netProfit >= 0 ? "trade_profit" : "trade_loss",
        amount_cents: netProfit,
        currency:     "KES",
        description:  `Candle ${isWin ? "win" : "loss"} — ${multiplier.toFixed(2)}x`,
        metadata:     { game: "candle", multiplier, prediction, mode: isMarketer ? "marketer" : "trader" },
      }),
    ]);

    return new Response(JSON.stringify({
      multiplier:         Math.round(multiplier * 100) / 100,
      silent_bonus_cents: silentBonus,
      gross_return_cents: grossReturn,
      net_profit_cents:   netProfit,
      is_win:             isWin,
      message,
      new_balance_cents:  newBalance,
      outcome_candle:     isWin
        ? (prediction === "up" ? "green" : "red")
        : (prediction === "up" ? "red"   : "green"),
      mode: isMarketer ? "marketer" : "trader",
    }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[resolve-bet]", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
