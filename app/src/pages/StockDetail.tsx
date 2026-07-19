import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Page from "../components/Page";
import StepChart from "../components/charts/StepChart";
import { useDark } from "../hooks/useDark";
import { seriesColor } from "../lib/palette";
import { useStore } from "../lib/store";
import { computeHoldings, fmtNum, fmtWon, qtySteps } from "../lib/calc";

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const dark = useDark();
  const { stocks, buys, updateStock, deleteStock, deleteBuy } = useStore();
  const stock = stocks.find((s) => s.id === id);
  const [priceInput, setPriceInput] = useState("");

  if (!stock) return <Page><p className="mt-10 text-center text-sm text-[var(--ink3)]">종목을 찾을 수 없어요</p></Page>;

  const h = computeHoldings([stock], buys)[0];
  const color = seriesColor(stock.colorIdx, dark);
  const steps = qtySteps(buys, stock.id);
  const myBuys = buys.filter((b) => b.stockId === stock.id).slice().reverse();
  const profit = h.value - h.invested;

  const savePrice = async () => {
    const p = Number(priceInput.replaceAll(",", ""));
    if (!p || p <= 0) return;
    await updateStock(stock.id, { currentPrice: p });
    setPriceInput("");
  };

  return (
    <Page>
      <header className="mb-4 mt-2 flex items-center gap-2">
        <button onClick={() => nav(-1)} className="press -ml-1 px-1 text-xl">‹</button>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold text-white"
          style={{ background: color }}
        >
          {stock.name.charAt(0)}
        </span>
        <h1 className="min-w-0 truncate text-base font-extrabold">{stock.name}</h1>
      </header>

      <section className="card px-5 py-5">
        <p className="text-xs text-[var(--ink3)]">평가금액</p>
        <p className="mt-0.5 text-2xl font-extrabold">{fmtWon(h.value)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[var(--card2)] py-2">
            <p className="text-[10px] text-[var(--ink3)]">보유수량</p>
            <p className="text-sm font-bold tabular-nums">{fmtNum(h.qty)}주</p>
          </div>
          <div className="rounded-xl bg-[var(--card2)] py-2">
            <p className="text-[10px] text-[var(--ink3)]">평단가</p>
            <p className="text-sm font-bold tabular-nums">{fmtNum(h.avgPrice)}</p>
          </div>
          <div className="rounded-xl bg-[var(--card2)] py-2">
            <p className="text-[10px] text-[var(--ink3)]">손익</p>
            <p className={`text-sm font-bold tabular-nums ${profit > 0 ? "text-[var(--good)]" : profit < 0 ? "text-[#d03b3b]" : ""}`}>
              {profit > 0 ? "+" : ""}{fmtNum(profit)}
            </p>
          </div>
        </div>
      </section>

      {/* 현재가 수동 갱신 */}
      <section className="card mt-3 flex items-center gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[var(--ink3)]">
            현재가 {stock.currentPrice ? `· ${fmtWon(stock.currentPrice)}` : "(미설정 — 평단가로 평가)"}
          </p>
          <input
            inputMode="numeric"
            placeholder="현재가 입력"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--ink3)]"
          />
        </div>
        <button
          onClick={savePrice}
          className="press shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"
        >
          갱신
        </button>
      </section>

      {steps.length > 0 && (
        <section className="card mt-3 px-4 py-4">
          <h2 className="mb-1 text-sm font-bold">수량 쌓기 🧱</h2>
          <StepChart data={steps} color={color} />
        </section>
      )}

      <section className="card mt-3 px-4 py-4">
        <h2 className="mb-2 text-sm font-bold">매수 이력 {myBuys.length > 0 && `(${myBuys.length}회)`}</h2>
        {myBuys.length === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--ink3)]">아직 매수 기록이 없어요</p>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {myBuys.map((b) => (
              <li key={b.id} className="flex items-center gap-2 py-2.5 text-sm">
                <span className="text-xs text-[var(--ink3)]">{b.date}</span>
                <span className="ml-auto font-bold tabular-nums">{fmtNum(b.qty)}주</span>
                <span className="text-xs text-[var(--ink2)] tabular-nums">@{fmtNum(b.price)}</span>
                <button
                  onClick={() => { if (confirm("이 매수 기록을 삭제할까요?")) deleteBuy(b.id); }}
                  className="press ml-1 text-xs text-[var(--ink3)]"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={async () => {
          if (confirm(`'${stock.name}' 종목과 모든 매수 기록을 삭제할까요?`)) {
            await deleteStock(stock.id);
            nav("/portfolio");
          }
        }}
        className="press mt-4 w-full py-3 text-center text-xs text-[#d03b3b]"
      >
        종목 삭제
      </button>
    </Page>
  );
}
