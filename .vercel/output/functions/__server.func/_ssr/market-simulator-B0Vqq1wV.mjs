//#region node_modules/.nitro/vite/services/ssr/assets/market-simulator-B0Vqq1wV.js
var ASSETS = [
	{
		symbol: "EUR/USD",
		name: "Euro / US Dollar",
		category: "forex",
		basePrice: 1.08742,
		pipSize: 1e-4,
		spread: .8
	},
	{
		symbol: "GBP/USD",
		name: "Pound / US Dollar",
		category: "forex",
		basePrice: 1.27134,
		pipSize: 1e-4,
		spread: 1
	},
	{
		symbol: "USD/JPY",
		name: "US Dollar / Yen",
		category: "forex",
		basePrice: 149.821,
		pipSize: .01,
		spread: .6
	},
	{
		symbol: "AUD/USD",
		name: "Australian Dollar / USD",
		category: "forex",
		basePrice: .65847,
		pipSize: 1e-4,
		spread: 1.2
	},
	{
		symbol: "USD/CAD",
		name: "US Dollar / Canadian Dollar",
		category: "forex",
		basePrice: 1.36412,
		pipSize: 1e-4,
		spread: 1.5
	},
	{
		symbol: "USD/CHF",
		name: "US Dollar / Swiss Franc",
		category: "forex",
		basePrice: .89743,
		pipSize: 1e-4,
		spread: 1.2
	},
	{
		symbol: "NZD/USD",
		name: "New Zealand Dollar / USD",
		category: "forex",
		basePrice: .60281,
		pipSize: 1e-4,
		spread: 1.8
	},
	{
		symbol: "Volatility 10",
		name: "Volatility 10 Index",
		category: "synthetic",
		basePrice: 7842.15,
		pipSize: .01,
		spread: 2
	},
	{
		symbol: "Volatility 25",
		name: "Volatility 25 Index",
		category: "synthetic",
		basePrice: 1293.47,
		pipSize: .01,
		spread: 2
	},
	{
		symbol: "Volatility 50",
		name: "Volatility 50 Index",
		category: "synthetic",
		basePrice: 5471.82,
		pipSize: .01,
		spread: 5
	},
	{
		symbol: "Volatility 75",
		name: "Volatility 75 Index",
		category: "synthetic",
		basePrice: 3892.14,
		pipSize: .01,
		spread: 8
	},
	{
		symbol: "Volatility 100",
		name: "Volatility 100 Index",
		category: "synthetic",
		basePrice: 9213.58,
		pipSize: .01,
		spread: 10
	},
	{
		symbol: "BTC/USD",
		name: "Bitcoin / US Dollar",
		category: "crypto",
		basePrice: 67284.1,
		pipSize: .01,
		spread: 15
	},
	{
		symbol: "ETH/USD",
		name: "Ethereum / US Dollar",
		category: "crypto",
		basePrice: 3482.75,
		pipSize: .01,
		spread: 5
	},
	{
		symbol: "SOL/USD",
		name: "Solana / US Dollar",
		category: "crypto",
		basePrice: 184.32,
		pipSize: .01,
		spread: .5
	},
	{
		symbol: "XRP/USD",
		name: "Ripple / US Dollar",
		category: "crypto",
		basePrice: .6234,
		pipSize: 1e-4,
		spread: .3
	},
	{
		symbol: "XAU/USD",
		name: "Gold / US Dollar",
		category: "commodity",
		basePrice: 2341.55,
		pipSize: .01,
		spread: .25
	},
	{
		symbol: "XAG/USD",
		name: "Silver / US Dollar",
		category: "commodity",
		basePrice: 29.734,
		pipSize: .001,
		spread: .02
	},
	{
		symbol: "WTI/USD",
		name: "Crude Oil / US Dollar",
		category: "commodity",
		basePrice: 78.423,
		pipSize: .001,
		spread: .04
	},
	{
		symbol: "AAPL",
		name: "Apple Inc.",
		category: "stock",
		basePrice: 187.32,
		pipSize: .01,
		spread: .05
	},
	{
		symbol: "MSFT",
		name: "Microsoft Corp.",
		category: "stock",
		basePrice: 412.85,
		pipSize: .01,
		spread: .08
	},
	{
		symbol: "TSLA",
		name: "Tesla Inc.",
		category: "stock",
		basePrice: 248.5,
		pipSize: .01,
		spread: .12
	},
	{
		symbol: "GOOGL",
		name: "Alphabet Inc.",
		category: "stock",
		basePrice: 174.61,
		pipSize: .01,
		spread: .07
	},
	{
		symbol: "US500",
		name: "S&P 500 Index",
		category: "index",
		basePrice: 5234.18,
		pipSize: .01,
		spread: .5
	},
	{
		symbol: "US30",
		name: "Dow Jones 30",
		category: "index",
		basePrice: 38742.55,
		pipSize: .01,
		spread: 2
	},
	{
		symbol: "GER40",
		name: "DAX 40 Index",
		category: "index",
		basePrice: 18312.47,
		pipSize: .01,
		spread: 1.5
	}
];
var _prices = /* @__PURE__ */ new Map();
var _opens = /* @__PURE__ */ new Map();
function initPrices() {
	ASSETS.forEach((a) => {
		if (!_prices.has(a.symbol)) {
			_prices.set(a.symbol, a.basePrice);
			_opens.set(a.symbol, a.basePrice * (1 + (Math.random() - .5) * .004));
		}
	});
}
initPrices();
/** Return a volatility multiplier based on category */
function volFor(category) {
	switch (category) {
		case "crypto": return 8e-4;
		case "synthetic": return .001;
		case "stock": return 3e-4;
		case "commodity": return 4e-4;
		case "index": return 2e-4;
		default: return 2e-4;
	}
}
/** Advance price by one tick using a random-walk with drift */
function tick(asset) {
	const current = _prices.get(asset.symbol) ?? asset.basePrice;
	const move = current * volFor(asset.category) * (Math.random() - .495);
	const next = Math.max(current + move, asset.basePrice * .5);
	_prices.set(asset.symbol, next);
	const open = _opens.get(asset.symbol) ?? asset.basePrice;
	const spread = asset.spread * asset.pipSize / 2;
	const bid = +(next - spread).toFixed(asset.pipSize < .01 ? 5 : asset.pipSize < .1 ? 3 : 2);
	const ask = +(next + spread).toFixed(asset.pipSize < .01 ? 5 : asset.pipSize < .1 ? 3 : 2);
	return {
		symbol: asset.symbol,
		bid,
		ask,
		price: +next.toFixed(asset.pipSize < .01 ? 5 : asset.pipSize < .1 ? 3 : 2),
		change: +(next - open),
		changePct: +((next - open) / open * 100),
		volume: Math.floor(Math.random() * 5e3) + 100,
		timestamp: Date.now()
	};
}
/** Generate OHLCV candle history */
function generateCandles(symbol, count = 200, intervalMs = 6e4) {
	const asset = ASSETS.find((a) => a.symbol === symbol);
	if (!asset) return [];
	const vol = volFor(asset.category);
	const candles = [];
	let price = asset.basePrice * (1 + (Math.random() - .5) * .02);
	const now = Math.floor(Date.now() / intervalMs) * intervalMs;
	for (let i = count; i >= 0; i--) {
		const open = price;
		const ticks = Array.from({ length: 10 }, () => {
			const m = price * vol * (Math.random() - .495);
			price = Math.max(price + m, asset.basePrice * .3);
			return price;
		});
		const high = Math.max(open, ...ticks);
		const low = Math.min(open, ...ticks);
		const close = price;
		candles.push({
			time: Math.floor((now - i * intervalMs) / 1e3),
			open: +open.toFixed(asset.pipSize < .01 ? 5 : 2),
			high: +high.toFixed(asset.pipSize < .01 ? 5 : 2),
			low: +low.toFixed(asset.pipSize < .01 ? 5 : 2),
			close: +close.toFixed(asset.pipSize < .01 ? 5 : 2),
			volume: Math.floor(Math.random() * 5e4) + 1e3
		});
	}
	return candles;
}
/** Format a price display */
function formatPrice(price, pipSize) {
	const digits = pipSize < .001 ? 5 : pipSize < .1 ? 3 : 2;
	return price.toFixed(digits);
}
/** Format a lot-size based P&L in USD cents */
function calcPnlCents(side, entryPrice, currentPrice, lotSize, pipSize) {
	const pips = side === "buy" ? (currentPrice - entryPrice) / pipSize : (entryPrice - currentPrice) / pipSize;
	return Math.round(pips * (pipSize <= 1e-4 ? 10 : pipSize <= .01 ? 1 : .1) * lotSize * 100);
}
//#endregion
export { tick as a, generateCandles as i, calcPnlCents as n, formatPrice as r, ASSETS as t };
