/**
 * Market price simulator using a random-walk model.
 * Provides realistic-looking live tick prices for the trading terminal.
 */

export interface Asset {
  symbol: string;
  name: string;
  category: string;
  basePrice: number;
  pipSize: number;
  spread: number; // in pips
}

export interface Tick {
  symbol: string;
  bid: number;
  ask: number;
  price: number; // mid
  change: number; // absolute change from open
  changePct: number;
  volume: number;
  timestamp: number;
}

export const ASSETS: Asset[] = [
  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", category: "forex", basePrice: 1.08742, pipSize: 0.0001, spread: 0.8 },
  { symbol: "GBP/USD", name: "Pound / US Dollar", category: "forex", basePrice: 1.27134, pipSize: 0.0001, spread: 1.0 },
  { symbol: "USD/JPY", name: "US Dollar / Yen", category: "forex", basePrice: 149.821, pipSize: 0.01, spread: 0.6 },
  { symbol: "AUD/USD", name: "Australian Dollar / USD", category: "forex", basePrice: 0.65847, pipSize: 0.0001, spread: 1.2 },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", category: "forex", basePrice: 1.36412, pipSize: 0.0001, spread: 1.5 },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", category: "forex", basePrice: 0.89743, pipSize: 0.0001, spread: 1.2 },
  { symbol: "NZD/USD", name: "New Zealand Dollar / USD", category: "forex", basePrice: 0.60281, pipSize: 0.0001, spread: 1.8 },
  // Synthetic Indices
  { symbol: "Volatility 10", name: "Volatility 10 Index", category: "synthetic", basePrice: 7842.15, pipSize: 0.01, spread: 2 },
  { symbol: "Volatility 25", name: "Volatility 25 Index", category: "synthetic", basePrice: 1293.47, pipSize: 0.01, spread: 2 },
  { symbol: "Volatility 50", name: "Volatility 50 Index", category: "synthetic", basePrice: 5471.82, pipSize: 0.01, spread: 5 },
  { symbol: "Volatility 75", name: "Volatility 75 Index", category: "synthetic", basePrice: 3892.14, pipSize: 0.01, spread: 8 },
  { symbol: "Volatility 100", name: "Volatility 100 Index", category: "synthetic", basePrice: 9213.58, pipSize: 0.01, spread: 10 },
  // Crypto
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", category: "crypto", basePrice: 67284.10, pipSize: 0.01, spread: 15 },
  { symbol: "ETH/USD", name: "Ethereum / US Dollar", category: "crypto", basePrice: 3482.75, pipSize: 0.01, spread: 5 },
  { symbol: "SOL/USD", name: "Solana / US Dollar", category: "crypto", basePrice: 184.32, pipSize: 0.01, spread: 0.5 },
  { symbol: "XRP/USD", name: "Ripple / US Dollar", category: "crypto", basePrice: 0.6234, pipSize: 0.0001, spread: 0.3 },
  // Commodities
  { symbol: "XAU/USD", name: "Gold / US Dollar", category: "commodity", basePrice: 2341.55, pipSize: 0.01, spread: 0.25 },
  { symbol: "XAG/USD", name: "Silver / US Dollar", category: "commodity", basePrice: 29.734, pipSize: 0.001, spread: 0.02 },
  { symbol: "WTI/USD", name: "Crude Oil / US Dollar", category: "commodity", basePrice: 78.423, pipSize: 0.001, spread: 0.04 },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", category: "stock", basePrice: 187.32, pipSize: 0.01, spread: 0.05 },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "stock", basePrice: 412.85, pipSize: 0.01, spread: 0.08 },
  { symbol: "TSLA", name: "Tesla Inc.", category: "stock", basePrice: 248.50, pipSize: 0.01, spread: 0.12 },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "stock", basePrice: 174.61, pipSize: 0.01, spread: 0.07 },
  // Indices
  { symbol: "US500", name: "S&P 500 Index", category: "index", basePrice: 5234.18, pipSize: 0.01, spread: 0.5 },
  { symbol: "US30", name: "Dow Jones 30", category: "index", basePrice: 38742.55, pipSize: 0.01, spread: 2 },
  { symbol: "GER40", name: "DAX 40 Index", category: "index", basePrice: 18312.47, pipSize: 0.01, spread: 1.5 },
];

// Stores current prices and daily opens
const _prices = new Map<string, number>();
const _opens = new Map<string, number>();

function initPrices() {
  ASSETS.forEach((a) => {
    if (!_prices.has(a.symbol)) {
      _prices.set(a.symbol, a.basePrice);
      _opens.set(a.symbol, a.basePrice * (1 + (Math.random() - 0.5) * 0.004));
    }
  });
}

initPrices();

/** Return a volatility multiplier based on category */
function volFor(category: string): number {
  switch (category) {
    case "crypto": return 0.0008;
    case "synthetic": return 0.001;
    case "stock": return 0.0003;
    case "commodity": return 0.0004;
    case "index": return 0.0002;
    default: return 0.0002; // forex
  }
}

/** Advance price by one tick using a random-walk with drift */
export function tick(asset: Asset): Tick {
  const current = _prices.get(asset.symbol) ?? asset.basePrice;
  const vol = volFor(asset.category);
  const move = current * vol * (Math.random() - 0.495); // slight upward drift
  const next = Math.max(current + move, asset.basePrice * 0.5); // floor at 50% of base
  _prices.set(asset.symbol, next);

  const open = _opens.get(asset.symbol) ?? asset.basePrice;
  const spread = (asset.spread * asset.pipSize) / 2;
  const bid = +(next - spread).toFixed(asset.pipSize < 0.01 ? 5 : asset.pipSize < 0.1 ? 3 : 2);
  const ask = +(next + spread).toFixed(asset.pipSize < 0.01 ? 5 : asset.pipSize < 0.1 ? 3 : 2);

  return {
    symbol: asset.symbol,
    bid,
    ask,
    price: +next.toFixed(asset.pipSize < 0.01 ? 5 : asset.pipSize < 0.1 ? 3 : 2),
    change: +(next - open),
    changePct: +((next - open) / open * 100),
    volume: Math.floor(Math.random() * 5000) + 100,
    timestamp: Date.now(),
  };
}

/** Get current snapshot for all assets */
export function getSnapshot(): Tick[] {
  return ASSETS.map((a) => tick(a));
}

/** Get snapshot for a subset of symbols */
export function getTicksFor(symbols: string[]): Tick[] {
  return ASSETS.filter((a) => symbols.includes(a.symbol)).map((a) => tick(a));
}

/** Get current price for a symbol */
export function getPrice(symbol: string): number {
  return _prices.get(symbol) ?? (ASSETS.find((a) => a.symbol === symbol)?.basePrice ?? 0);
}

/** Generate OHLCV candle history */
export function generateCandles(
  symbol: string,
  count: number = 200,
  intervalMs: number = 60_000, // 1min default
): Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }> {
  const asset = ASSETS.find((a) => a.symbol === symbol);
  if (!asset) return [];

  const vol = volFor(asset.category);
  const candles = [];
  let price = asset.basePrice * (1 + (Math.random() - 0.5) * 0.02);
  const now = Math.floor(Date.now() / intervalMs) * intervalMs;

  for (let i = count; i >= 0; i--) {
    const open = price;
    const ticks = Array.from({ length: 10 }, () => {
      const m = price * vol * (Math.random() - 0.495);
      price = Math.max(price + m, asset.basePrice * 0.3);
      return price;
    });
    const high = Math.max(open, ...ticks);
    const low = Math.min(open, ...ticks);
    const close = price;
    candles.push({
      time: Math.floor((now - i * intervalMs) / 1000),
      open: +open.toFixed(asset.pipSize < 0.01 ? 5 : 2),
      high: +high.toFixed(asset.pipSize < 0.01 ? 5 : 2),
      low: +low.toFixed(asset.pipSize < 0.01 ? 5 : 2),
      close: +close.toFixed(asset.pipSize < 0.01 ? 5 : 2),
      volume: Math.floor(Math.random() * 50000) + 1000,
    });
  }

  return candles;
}

/** Format a price display */
export function formatPrice(price: number, pipSize: number): string {
  const digits = pipSize < 0.001 ? 5 : pipSize < 0.1 ? 3 : 2;
  return price.toFixed(digits);
}

/** Format a lot-size based P&L in USD cents */
export function calcPnlCents(side: "buy" | "sell", entryPrice: number, currentPrice: number, lotSize: number, pipSize: number): number {
  const pips = side === "buy"
    ? (currentPrice - entryPrice) / pipSize
    : (entryPrice - currentPrice) / pipSize;
  // Standard forex: 1 lot = $10/pip for 4-digit pairs
  const pipValue = pipSize <= 0.0001 ? 10 : pipSize <= 0.01 ? 1 : 0.1;
  return Math.round(pips * pipValue * lotSize * 100);
}
