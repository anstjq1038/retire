import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import AnimatedNumber from "../components/AnimatedNumber";
import AccumChart from "../components/charts/AccumChart";
import { useStore } from "../lib/store";
import {
  boughtInMonth, cashTotal, computeHoldings, daysUntil, fmtEok, fmtNum,
  fmtWon, nextBuyInfo, streakMonths, todayStr, ymOf,
} from "../lib/calc";

export default function Home() {
  const { stocks, buys, settings } = useStore();
  const nav = useNavigate();
  const holdings = computeHoldings(stocks, buys);
  const stockValue = holdings.reduce((s, h) => s + h.value, 0);
  const cash = cashTotal(settings);
  const totalValue = stockValue + cash;
  const totalQty = holdings.reduce((s, h) => s + h.qty, 0);
  const pct = Math.min(100, (totalValue / settings.goal) * 100);

  const curYm = ymOf(todayStr());
  const done = boughtInMonth(buys, curYm);
  const { dday } = nextBuyInfo(settings.buyDay);
  const streak = streakMonths(buys);
  const retireDays = daysUntil(settings.retireDate);

  return (
    <Page>
      <header className="mb-4 mt-2 flex items-center justify-between">
        <h1 className="text-lg font-extrabold">🌱 적립</h1>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[var(--ink3)]">은퇴까지 {retireDays.toLocaleString()}일</span>
          <Link to="/settings" aria-label="설정" className="press text-base">⚙️</Link>
        </div>
      </header>

      {/* 총 자산 히어로 */}
      <section className="card px-5 py-6">
        <p className="text-xs text-[var(--ink3)]">총 자산</p>
        <p className="mt-1 text-[34px] font-extrabold leading-tight tracking-tight">
          <AnimatedNumber value={totalValue} format={fmtWon} />
        </p>
        <p className="mt-1 text-xs text-[var(--ink2)]">
          주식 {fmtEok(stockValue)}
          {cash > 0 && <> · 현금 {fmtEok(cash)}</>}
        </p>
        {/* 목표 진행률 */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-[var(--ink3)]">
            <span>목표 {fmtEok(settings.goal)}</span>
            <span className="font-bold text-[var(--accent)]">{pct.toFixed(1)}%</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--card2)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${Math.max(pct, 0.5)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 이번 달 매수 카드 */}
      <section
        className={`card press mt-3 cursor-pointer px-5 py-4 ${
          !done && dday === 0 ? "border-[var(--accent)] bg-[var(--accent-soft)]" : ""
        }`}
        onClick={() => !done && nav("/record")}
      >
        {done ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">이번 달 적립 완료 ✅</p>
              <p className="mt-0.5 text-xs text-[var(--ink2)]">
                다음 매수일은 다음 달 {settings.buyDay}일이에요
              </p>
            </div>
            {streak > 1 && <span className="text-sm font-bold text-[var(--accent)]">🔥 {streak}개월 연속</span>}
          </div>
        ) : dday === 0 ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--accent)]">오늘은 매수일이에요! 🗓️</p>
              <p className="mt-0.5 text-xs text-[var(--ink2)]">탭해서 오늘 매수를 기록해요</p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">
                매수일까지 <span className="text-[var(--accent)]">D-{dday}</span>
              </p>
              <p className="mt-0.5 text-xs text-[var(--ink2)]">
                매월 {settings.buyDay}일 · 미리 기록해도 좋아요
              </p>
            </div>
            {streak > 0 && <span className="text-sm font-bold text-[var(--ink2)]">🔥 {streak}개월</span>}
          </div>
        )}
      </section>

      {/* 보유 현황 카드 */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="card px-4 py-3.5">
          <p className="text-[11px] text-[var(--ink3)]">총 보유수량</p>
          <p className="mt-0.5 text-xl font-extrabold">{fmtNum(totalQty)}주</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-[11px] text-[var(--ink3)]">보유 종목</p>
          <p className="mt-0.5 text-xl font-extrabold">
            {holdings.filter((h) => h.qty > 0).length}개
          </p>
        </div>
      </section>

      {/* 수량 누적 차트 */}
      <section className="card mt-3 px-4 py-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-bold">쌓인 수량 🧱</h2>
          <Link to="/insights" className="text-[11px] text-[var(--accent)]">분석 →</Link>
        </div>
        {buys.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--ink3)]">
            아직 기록이 없어요.
            <button onClick={() => nav("/record")} className="ml-1 font-bold text-[var(--accent)]">
              첫 매수 기록하기
            </button>
          </div>
        ) : (
          <AccumChart stocks={stocks} buys={buys} mode="qty" />
        )}
      </section>
    </Page>
  );
}
