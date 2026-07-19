import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import Page from "../components/Page";
import AccumChart from "../components/charts/AccumChart";
import { useDark } from "../hooks/useDark";
import { seriesColor } from "../lib/palette";
import { useStore } from "../lib/store";
import {
  computeHoldings, fmtEok, fmtNum, monthlyInvestMap,
} from "../lib/calc";

export default function Insights() {
  const { stocks, buys } = useStore();
  const dark = useDark();
  const holdings = computeHoldings(stocks, buys).filter((h) => h.qty > 0);
  const accent = dark ? "#3987e5" : "#2a78d6";

  // 월별 적립액
  const investMap = monthlyInvestMap(buys);
  const monthly = [...investMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([ym, amount]) => ({ ym, amount }));
  const avgMonthly = monthly.length
    ? monthly.reduce((s, m) => s + m.amount, 0) / monthly.length
    : 0;

  const maxQty = Math.max(1, ...holdings.map((h) => h.qty));
  const withPrice = holdings.filter((h) => h.stock.currentPrice && h.avgPrice > 0);
  const maxAbsPct = Math.max(
    5,
    ...withPrice.map((h) => Math.abs(((h.stock.currentPrice! - h.avgPrice) / h.avgPrice) * 100)),
  );

  if (buys.length === 0)
    return (
      <Page>
        <h1 className="mb-4 mt-2 text-lg font-extrabold">분석</h1>
        <p className="card px-5 py-10 text-center text-sm text-[var(--ink3)]">
          매수를 기록하면 여기서 차트로 볼 수 있어요 📈
        </p>
      </Page>
    );

  return (
    <Page>
      <h1 className="mb-4 mt-2 text-lg font-extrabold">분석</h1>

      {/* 요약 타일 */}
      <section className="grid grid-cols-3 gap-2">
        <div className="card px-3 py-3 text-center">
          <p className="text-[10px] text-[var(--ink3)]">총 매수 횟수</p>
          <p className="mt-0.5 text-lg font-extrabold">{buys.length}회</p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-[10px] text-[var(--ink3)]">적립한 달</p>
          <p className="mt-0.5 text-lg font-extrabold">{monthly.length}개월</p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-[10px] text-[var(--ink3)]">월평균 적립</p>
          <p className="mt-0.5 text-lg font-extrabold">{fmtEok(avgMonthly)}</p>
        </div>
      </section>

      {/* 월별 적립액 */}
      <section className="card mt-3 px-4 py-4">
        <h2 className="mb-2 text-sm font-bold">월별 적립액 📥</h2>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={monthly} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={dark ? "#2c2c2a" : "#e1e0d9"} strokeWidth={1} />
            <XAxis
              dataKey="ym"
              tickFormatter={(ym: string) => `${Number(ym.slice(5, 7))}월`}
              interval={Math.max(0, Math.ceil(monthly.length / 6) - 1)}
              tick={{ fill: "#898781", fontSize: 11 }}
              axisLine={{ stroke: dark ? "#383835" : "#c3c2b7" }}
              tickLine={false}
            />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="card px-3 py-1.5 text-xs shadow-lg">
                    {String(label).replace("-", "년 ")}월 · <b>{fmtEok(Number(payload[0].value))}</b>
                  </div>
                );
              }}
            />
            <Bar dataKey="amount" fill={accent} radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 종목별 보유수량 */}
      <section className="card mt-3 px-4 py-4">
        <h2 className="mb-3 text-sm font-bold">종목별 보유수량 🧱</h2>
        <div className="space-y-2.5">
          {holdings
            .slice()
            .sort((a, b) => b.qty - a.qty)
            .map((h) => {
              const color = seriesColor(h.stock.colorIdx, dark);
              return (
                <div key={h.stock.id}>
                  <div className="mb-1 flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="truncate text-[var(--ink2)]">{h.stock.name}</span>
                    <span className="ml-auto shrink-0 font-bold tabular-nums">{fmtNum(h.qty)}주</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--card2)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(h.qty / maxQty) * 100}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 종목별 수익률 (현재가 입력한 종목만) */}
      <section className="card mt-3 px-4 py-4">
        <h2 className="mb-1 text-sm font-bold">종목별 수익률 🎯</h2>
        {withPrice.length === 0 ? (
          <p className="py-3 text-xs text-[var(--ink3)]">
            종목 상세에서 현재가를 입력하면 평단가 대비 수익률이 보여요
          </p>
        ) : (
          <div className="mt-2 space-y-2.5">
            {withPrice
              .slice()
              .sort((a, b) => {
                const pa = (a.stock.currentPrice! - a.avgPrice) / a.avgPrice;
                const pb = (b.stock.currentPrice! - b.avgPrice) / b.avgPrice;
                return pb - pa;
              })
              .map((h) => {
                const pct = ((h.stock.currentPrice! - h.avgPrice) / h.avgPrice) * 100;
                const up = pct >= 0;
                return (
                  <div key={h.stock.id}>
                    <div className="mb-1 flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: seriesColor(h.stock.colorIdx, dark) }}
                      />
                      <span className="truncate text-[var(--ink2)]">{h.stock.name}</span>
                      <span
                        className={`ml-auto shrink-0 font-bold tabular-nums ${up ? "text-[var(--good)]" : "text-[#d03b3b]"}`}
                      >
                        {up ? "▲ +" : "▼ "}{pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-[var(--card2)]">
                      <div className="h-full w-1/2">
                        {!up && (
                          <div
                            className="ml-auto h-full rounded-l-full bg-[#d03b3b]"
                            style={{ width: `${Math.min(100, (Math.abs(pct) / maxAbsPct) * 100)}%` }}
                          />
                        )}
                      </div>
                      <div className="h-full w-1/2">
                        {up && (
                          <div
                            className="h-full rounded-r-full bg-[var(--good)]"
                            style={{ width: `${Math.min(100, (pct / maxAbsPct) * 100)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* 쌓인 원금 */}
      <section className="card mt-3 px-4 py-4">
        <h2 className="mb-2 text-sm font-bold">쌓인 원금 💰</h2>
        <AccumChart stocks={stocks} buys={buys} mode="amount" />
      </section>
    </Page>
  );
}
