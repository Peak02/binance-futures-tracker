import React, { useEffect, useState } from "react";

export default function BinanceFuturesTracker() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://fapi.binance.com/fapi/v1/ticker/price"
        );
        const allSymbols = await res.json();

        const usdtSymbols = allSymbols.filter((s) =>
          s.symbol.endsWith("USDT")
        );

        const coinData = await Promise.all(
          usdtSymbols.map(async (s) => {
            const klineRes = await fetch(
              `https://fapi.binance.com/fapi/v1/klines?symbol=${s.symbol}&interval=1m&limit=5`
            );
            const klineData = await klineRes.json();

            const open = parseFloat(klineData[0][1]);
            const close = parseFloat(klineData[4][4]);
            const change = ((close - open) / open) * 100;

            return {
              symbol: s.symbol,
              open,
              close,
              change,
            };
          })
        );

        setCoins(
          coinData.sort((a, b) => b.change - a.change)
        );
      } catch (err) {
        console.error("Error fetching Binance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Binance Futures 5-Min Change Tracker</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coins.map((coin) => (
            <div
              key={coin.symbol}
              className={\`rounded-xl p-4 shadow-md text-white font-semibold text-center \${coin.change > 0 ? "bg-green-500" : "bg-red-500"}\`}
            >
              <div className="text-lg">{coin.symbol}</div>
              <div>
                {coin.change > 0 ? "+" : ""}
                {coin.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
