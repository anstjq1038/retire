import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import DonutChart from "../components/charts/DonutChart";
import { useDark } from "../hooks/useDark";
import { seriesColor } from "../lib/palette";
import { useStore } from "../lib/store";
import { computeHoldings, fmtEok, fmtNum, fmtWon } from "../lib/calc";

export default function Portfolio() {
  const { stocks, buys, seedDefaults } = useStore();
  const dark = useDark();
  const nav = useNavigate();
  const holdings = computeHoldings(stocks, buys);
  const total = holdings.reduce((s, h) => s + h.value, 0);

  return (
    <Page>
      <h1 className="mb-4 mt-2 text-lg font-extrabold">포트폴리오</h1>

      {stocks.length === 0 ? (
        <div className="card px-5 py-8 text-center">
          <p className="text-sm text-[var(--ink2)]">등록된 종목이 없어요</p>
          <button
            onClick={() => seedDefaults()}
            className="press mt-4 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
          >
            내 ETF 5종목 한번에 등록하기
          </button>
          <p className="mt-3 text-[11px] text-[var(--ink3)]">기록 화면에서 직접 추가할 수도 있어요</p>
        </div>
      ) : (
        <>
          {total > 0 && (
            <section className="card mb-3 px-4 py-4">
              <DonutChart holdings={holdings} />
            </section>
          )}

          <div className="space-y-2.5">
            {holdings.map((h) => {
              const color = seriesColor(h.stock.colorIdx, dark);
              const weight = total > 0 ? Math.round((h.value / total) * 100) : 0;
              return (
                <Link
                  key={h.stock.id}
                  to={`/portfolio/${h.stock.id}`}
                  className="card press flex items-center gap-3 px-4 py-3.5"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: color }}
                  >
                    {h.stock.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{h.stock.name}</p>
                    <p className="text-xs text-[var(--ink3)]">
                      {h.qty > 0
                        ? `${fmtNum(h.qty)}주 · 평단 ${fmtWon(h.avgPrice)}`
                        : "아직 매수 전"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">{fmtEok(h.value)}</p>
                    {h.qty > 0 && <p className="text-xs text-[var(--ink3)]">{weight}%</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => nav("/record?add=1")}
            className="press mt-4 w-full rounded-2xl border border-dashed border-[var(--line)] py-3.5 text-sm font-bold text-[var(--ink2)]"
          >
            + 새 종목 추가
          </button>
        </>
      )}
    </Page>
  );
}
