import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useDark } from "../../hooks/useDark";
import { seriesColor } from "../../lib/palette";
import { fmtEok, fmtNum, monthlyCumulative } from "../../lib/calc";
import type { Buy, Stock } from "../../lib/types";

/** 월별 누적 스택 영역 차트 — mode: 투입원금(amount) | 보유수량(qty) */
export default function AccumChart({
  stocks, buys, mode = "amount",
}: {
  stocks: Stock[]; buys: Buy[]; mode?: "amount" | "qty";
}) {
  const dark = useDark();
  const fmt = mode === "qty" ? (n: number) => fmtNum(n) + "주" : fmtEok;
  const data = monthlyCumulative(stocks, buys, mode);
  if (data.length === 0) return null;
  const active = stocks.filter((s) => buys.some((b) => b.stockId === s.id));
  const tickGap = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={dark ? "#2c2c2a" : "#e1e0d9"} strokeWidth={1} />
          <XAxis
            dataKey="ym"
            tickFormatter={(ym: string) => `${Number(ym.slice(5, 7))}월`}
            interval={tickGap - 1}
            tick={{ fill: "#898781", fontSize: 11 }}
            axisLine={{ stroke: dark ? "#383835" : "#c3c2b7" }}
            tickLine={false}
          />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            cursor={{ stroke: dark ? "#383835" : "#c3c2b7", strokeWidth: 1 }}
            content={({ active: act, payload, label }) => {
              if (!act || !payload?.length) return null;
              const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
              return (
                <div className="card px-3 py-2 text-xs shadow-lg">
                  <div className="mb-1 font-bold">
                    {String(label).replace("-", "년 ")}월 · {fmt(total)}
                  </div>
                  {[...payload].reverse().map((p) => (
                    <div key={p.dataKey as string} className="flex items-center gap-1.5 text-[var(--ink2)]">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                      {stocks.find((s) => s.id === p.dataKey)?.name}
                      <span className="ml-auto pl-3 font-medium tabular-nums">{fmt(Number(p.value) || 0)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {active.map((s) => {
            const c = seriesColor(s.colorIdx, dark);
            return (
              <Area
                key={s.id}
                dataKey={s.id}
                stackId="1"
                stroke={c}
                strokeWidth={2}
                fill={c}
                fillOpacity={0.55}
                isAnimationActive={true}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {active.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-[11px] text-[var(--ink2)]">
            <span className="h-2 w-2 rounded-full" style={{ background: seriesColor(s.colorIdx, dark) }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
