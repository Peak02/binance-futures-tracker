import React, { useEffect, useState } from "react";

export default function FuturesTopMovers() {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const priceRes = await fetch("https://fapi.binance.com/fapi/v1/ticker/price");
      const allSymbols = await priceRes.json();
      const usdtSymbols = allSymbols.filter((s) => s.symbol.endsWith("USDT"));

      const results = [];

      for (const coin of usdtSymbols.slice(0, 80)) {
        try {
          const klineRes = await fetch(
            `https://fapi.binance.com/fapi/v1/klines?symbol=${coin.symbol}&interval=1m&limit=10`
          );
          const klines = await klineRes.json();

          if (!klines || klines.length < 2) continue;

          const open = parseFloat(klines[0][1]);
          const close = parseFloat(klines[klines.length - 1][4]);
          const change = ((close - open) / open) * 100;

          // Зөвхөн 1%-иас их хөдөлсөн coin-ууд
          if (Math.abs(change) >= 1) {
            results.push({ symbol: coin.symbol, change });
          }
        } catch (err) {
          // нэг coin дээр алдаа гарвал алгасана
        }
      }

      const sorted = results.sort((a, b) => b.change - a.change);
      setTopGainers(sorted.slice(0, 10));
      setTopLosers(sorted.slice(-10).reverse());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 сек тутамд
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Binance Futures 10min Movers</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">📈 Top Gainers</h2>
            {topGainers.map((coin) => (
              <div
                key={coin.symbol}
                className="bg-green-500 text-white rounded-xl p-3 mb-2 shadow-md"
              >
                {coin.symbol} &nbsp; +{coin.change.toFixed(2)}%
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">📉 Top Losers</h2>
            {topLosers.map((coin) => (
              <div
                key={coin.symbol}
                className="bg-red-500 text-white rounded-xl p-3 mb-2 shadow-md"
              >
                {coin.symbol} &nbsp; {coin.change.toFixed(2)}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
