import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Page from "../components/Page";
import Confetti from "../components/Confetti";
import { useDark } from "../hooks/useDark";
import { seriesColor } from "../lib/palette";
import { useStore } from "../lib/store";
import { fmtWon, todayStr, ymOf } from "../lib/calc";

export default function Record() {
  const { stocks, buys, addBuy, addStock, seedDefaults } = useStore();
  const dark = useDark();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const [stockId, setStockId] = useState<string>(stocks[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayStr());
  const [adding, setAdding] = useState(params.get("add") === "1");
  const [newName, setNewName] = useState("");
  const [burst, setBurst] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const monthCount = useMemo(
    () => buys.filter((b) => ymOf(b.date) === ymOf(todayStr())).length,
    [buys],
  );

  const selected = stocks.find((s) => s.id === stockId) ?? stocks[0];
  const qtyN = Number(qty.replaceAll(",", ""));
  const priceN = Number(price.replaceAll(",", "")) || 0; // 단가는 선택 입력
  const valid = !!selected && qtyN > 0 && !!date;

  const save = async () => {
    if (!valid || !selected) return;
    await addBuy({ stockId: selected.id, date, qty: qtyN, price: priceN });
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    setSavedMsg(`이번 달 ${monthCount + 1}번째 적립! 🎉`);
    setQty("");
    setPrice("");
    setTimeout(() => setBurst(false), 1400);
  };

  const createStock = async () => {
    const name = newName.trim();
    if (!name) return;
    const id = await addStock(name);
    setStockId(id);
    setNewName("");
    setAdding(false);
  };

  return (
    <Page>
      {burst && <Confetti />}
      <header className="mb-4 mt-2 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">매수 기록</h1>
        <button onClick={() => nav(-1)} className="press px-1 text-sm text-[var(--ink3)]">닫기</button>
      </header>

      {stocks.length === 0 && (
        <div className="card mb-3 px-5 py-6 text-center">
          <p className="text-sm text-[var(--ink2)]">먼저 종목을 등록해요</p>
          <button
            onClick={() => seedDefaults()}
            className="press mt-3 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
          >
            내 ETF 5종목 한번에 등록하기
          </button>
        </div>
      )}

      {/* 종목 선택 칩 */}
      <section className="mb-3">
        <p className="mb-2 text-xs font-bold text-[var(--ink2)]">종목</p>
        <div className="flex flex-wrap gap-2">
          {stocks.map((s) => {
            const on = selected?.id === s.id;
            const color = seriesColor(s.colorIdx, dark);
            return (
              <button
                key={s.id}
                onClick={() => setStockId(s.id)}
                className={`press flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold ${
                  on
                    ? "border-transparent text-white"
                    : "border-[var(--line)] bg-[var(--card)] text-[var(--ink2)]"
                }`}
                style={on ? { background: color } : undefined}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: on ? "#fff" : color }} />
                {s.name}
              </button>
            );
          })}
          <button
            onClick={() => setAdding((v) => !v)}
            className="press rounded-full border border-dashed border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink3)]"
          >
            + 추가
          </button>
        </div>
        {adding && (
          <div className="card mt-2 flex items-center gap-2 px-3 py-2.5">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="종목 이름 (예: KODEX 미국나스닥100)"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--ink3)]"
            />
            <button
              onClick={createStock}
              className="press shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white"
            >
              등록
            </button>
          </div>
        )}
      </section>

      {/* 수량 · 단가 · 날짜 */}
      <section className="card space-y-4 px-5 py-5">
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">수량 (주)</span>
          <input
            inputMode="numeric" value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className="mt-1 w-full bg-transparent text-2xl font-extrabold outline-none placeholder:text-[var(--ink3)]"
          />
        </label>
        <div className="h-px bg-[var(--hairline)]" />
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">
            1주 매수단가 (원) <span className="font-normal text-[var(--ink3)]">· 선택 — 모르면 비워두세요</span>
          </span>
          <input
            inputMode="numeric" value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="mt-1 w-full bg-transparent text-2xl font-extrabold outline-none placeholder:text-[var(--ink3)]"
          />
        </label>
        <div className="h-px bg-[var(--hairline)]" />
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">매수일</span>
          <input
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold outline-none"
          />
        </label>
      </section>

      {valid && (
        <p className="mt-3 text-center text-xs text-[var(--ink2)]">
          {selected?.name} {qtyN.toLocaleString()}주
          {priceN > 0 && <> · 총 <b>{fmtWon(qtyN * priceN)}</b></>}
        </p>
      )}

      <button
        disabled={!valid}
        onClick={save}
        className="press mt-3 w-full rounded-2xl bg-[var(--accent)] py-4 font-bold text-white disabled:opacity-35"
      >
        적립하기
      </button>

      {savedMsg && (
        <p className="mt-3 text-center text-sm font-bold text-[var(--accent)]">{savedMsg}</p>
      )}
    </Page>
  );
}
