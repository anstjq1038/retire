import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import DonutChart, { type Slice } from "../components/charts/DonutChart";
import { useDark } from "../hooks/useDark";
import { seriesColor } from "../lib/palette";
import { useStore } from "../lib/store";
import { cashTotal, computeHoldings, fmtEok, fmtNum, fmtWon } from "../lib/calc";

export default function Portfolio() {
  const { stocks, buys, settings, saveSettings, seedDefaults } = useStore();
  const dark = useDark();
  const nav = useNavigate();
  const holdings = computeHoldings(stocks, buys);
  const cash = cashTotal(settings);
  const total = holdings.reduce((s, h) => s + h.value, 0) + cash;

  // 현금 편집
  const [editingCash, setEditingCash] = useState(false);
  const [krw, setKrw] = useState("");
  const [usd, setUsd] = useState("");
  const [rate, setRate] = useState("");

  const openCashEdit = () => {
    setKrw(settings.cashKrw ? String(settings.cashKrw) : "");
    setUsd(settings.cashUsd ? String(settings.cashUsd) : "");
    setRate(String(settings.usdRate || 1400));
    setEditingCash(true);
  };
  const saveCash = async () => {
    await saveSettings({
      cashKrw: Number(krw.replaceAll(",", "")) || 0,
      cashUsd: Number(usd.replaceAll(",", "")) || 0,
      usdRate: Number(rate.replaceAll(",", "")) || 1400,
    });
    setEditingCash(false);
  };

  const cashColorKrw = dark ? "#c3c2b7" : "#52514e";
  const cashColorUsd = "#898781";
  const slices: Slice[] = [
    ...holdings.map((h) => ({
      id: h.stock.id,
      name: h.stock.name,
      value: h.value,
      color: seriesColor(h.stock.colorIdx, dark),
    })),
    { id: "__krw", name: "현금 (원화)", value: settings.cashKrw || 0, color: cashColorKrw },
    { id: "__usd", name: "현금 (달러)", value: (settings.cashUsd || 0) * (settings.usdRate || 1400), color: cashColorUsd },
  ];

  return (
    <Page>
      <div className="mb-4 mt-2 flex items-baseline justify-between">
        <h1 className="text-lg font-extrabold">포트폴리오</h1>
        <Link to="/insights" className="text-[11px] font-bold text-[var(--accent)]">분석 📈</Link>
      </div>

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
              <DonutChart slices={slices} centerLabel="총 자산" />
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
                        ? `평단 ${fmtWon(h.avgPrice)} · ${fmtEok(h.value)}`
                        : "아직 매수 전"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">{fmtNum(h.qty)}주</p>
                    {h.qty > 0 && <p className="text-xs text-[var(--ink3)]">{weight}%</p>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 현금 자산 */}
          <section className="card mt-3 px-4 py-3.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">💵 현금</p>
              <button
                onClick={() => (editingCash ? saveCash() : openCashEdit())}
                className="press text-xs font-bold text-[var(--accent)]"
              >
                {editingCash ? "저장" : "수정"}
              </button>
            </div>
            {editingCash ? (
              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-2 text-xs text-[var(--ink2)]">
                  <span className="w-14 shrink-0 font-bold">원화</span>
                  <input
                    inputMode="numeric" value={krw} onChange={(e) => setKrw(e.target.value)}
                    placeholder="0"
                    className="min-w-0 flex-1 rounded-lg bg-[var(--card2)] px-3 py-2 text-sm font-bold outline-none"
                  />
                  <span>원</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--ink2)]">
                  <span className="w-14 shrink-0 font-bold">달러</span>
                  <input
                    inputMode="decimal" value={usd} onChange={(e) => setUsd(e.target.value)}
                    placeholder="0"
                    className="min-w-0 flex-1 rounded-lg bg-[var(--card2)] px-3 py-2 text-sm font-bold outline-none"
                  />
                  <span>$</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--ink2)]">
                  <span className="w-14 shrink-0 font-bold">환율</span>
                  <input
                    inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg bg-[var(--card2)] px-3 py-2 text-sm font-bold outline-none"
                  />
                  <span>원/$</span>
                </label>
              </div>
            ) : (
              <div className="mt-2 flex items-end justify-between">
                <p className="text-xs text-[var(--ink2)]">
                  ₩ {fmtNum(settings.cashKrw || 0)}
                  {(settings.cashUsd || 0) > 0 && (
                    <> · $ {fmtNum(settings.cashUsd)} (환율 {fmtNum(settings.usdRate || 1400)})</>
                  )}
                </p>
                <p className="text-sm font-bold tabular-nums">{fmtEok(cash)}</p>
              </div>
            )}
          </section>

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
