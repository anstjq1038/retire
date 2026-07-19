import { useState } from "react";
import Page from "../components/Page";
import { useStore } from "../lib/store";
import {
  cashTotal, computeHoldings, fmtEok, futureValue, monthlyInvestMap, monthsUntil,
} from "../lib/calc";

const MILESTONES = [1e8, 3e8, 5e8, 1e9, 1.5e9];

export default function Goal() {
  const { stocks, buys, settings } = useStore();
  const holdings = computeHoldings(stocks, buys);
  const totalValue = holdings.reduce((s, h) => s + h.value, 0) + cashTotal(settings);

  const [monthly, setMonthly] = useState(settings.monthlyBudget);
  const [ret, setRet] = useState(settings.annualReturn);
  const months = monthsUntil(settings.retireDate);
  const fv = futureValue(totalValue, monthly, ret, months);
  const reach = fv >= settings.goal;

  const investMap = monthlyInvestMap(buys);
  const years: number[] = [];
  if (buys.length > 0) {
    const first = Number(buys.map((b) => b.date).sort()[0]!.slice(0, 4));
    const cur = new Date().getFullYear();
    for (let y = first; y <= cur; y++) years.push(y);
  }
  const now = new Date();
  const curYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <Page>
      <h1 className="mb-4 mt-2 text-lg font-extrabold">목표</h1>

      {/* 마일스톤 */}
      <section className="card px-5 py-5">
        <h2 className="text-sm font-bold">15억까지의 여정 ⛰️</h2>
        <div className="mt-4 space-y-3">
          {MILESTONES.map((m, i) => {
            const done = totalValue >= m;
            const cur = !done && (i === 0 || totalValue >= MILESTONES[i - 1]);
            const pct = Math.min(100, (totalValue / m) * 100);
            return (
              <div key={m} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-[var(--accent)] text-white"
                      : cur
                        ? "border-2 border-[var(--accent)] text-[var(--accent)]"
                        : "bg-[var(--card2)] text-[var(--ink3)]"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className={done || cur ? "font-bold" : "text-[var(--ink3)]"}>{fmtEok(m)}</span>
                    {cur && <span className="font-bold text-[var(--accent)]">{pct.toFixed(1)}%</span>}
                  </div>
                  {cur && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--card2)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 시뮬레이터 */}
      <section className="card mt-3 px-5 py-5">
        <h2 className="text-sm font-bold">은퇴 시뮬레이터 🔮</h2>
        <p className="mt-1 text-[11px] text-[var(--ink3)]">
          지금 {fmtEok(totalValue)}에서 시작해 은퇴까지 {months}개월 적립하면
        </p>
        <p className={`mt-2 text-2xl font-extrabold ${reach ? "text-[var(--good)]" : ""}`}>
          약 {fmtEok(fv)}
          <span className="ml-2 text-sm font-bold">
            {reach ? "목표 달성! 🎉" : `목표까지 ${fmtEok(settings.goal - fv)} 부족`}
          </span>
        </p>
        <label className="mt-4 block text-xs text-[var(--ink2)]">
          월 적립액 <b className="text-[var(--ink)]">{fmtEok(monthly)}</b>
          <input
            type="range" min={100000} max={5000000} step={100000}
            value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="mt-3 block text-xs text-[var(--ink2)]">
          연 기대수익률 <b className="text-[var(--ink)]">{ret}%</b>
          <input
            type="range" min={0} max={50} step={0.5}
            value={ret} onChange={(e) => setRet(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--accent)]"
          />
        </label>
      </section>

      {/* 적립 잔디밭 */}
      {years.length > 0 && (
        <section className="card mt-3 px-5 py-5">
          <h2 className="mb-3 text-sm font-bold">적립 잔디밭 🌱</h2>
          <div className="space-y-2">
            {years.map((y) => (
              <div key={y} className="flex items-center gap-2">
                <span className="w-9 shrink-0 text-[11px] text-[var(--ink3)]">{y}</span>
                <div className="grid flex-1 grid-cols-12 gap-1">
                  {Array.from({ length: 12 }, (_, m) => {
                    const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
                    const invested = investMap.get(ym) ?? 0;
                    const future = ym > curYm;
                    return (
                      <div
                        key={ym}
                        title={`${y}년 ${m + 1}월${invested ? ` · ${fmtEok(invested)}` : ""}`}
                        className="aspect-square rounded-[4px]"
                        style={{
                          background: invested > 0 ? "var(--accent)" : "var(--card2)",
                          opacity: future ? 0.25 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[var(--ink3)]">한 칸 = 한 달 · 파란 칸은 적립한 달</p>
        </section>
      )}
    </Page>
  );
}
