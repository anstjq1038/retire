import type { Buy, Stock } from "./types";

export const fmtWon = (n: number) => Math.round(n).toLocaleString("ko-KR") + "원";
export const fmtNum = (n: number) => Math.round(n).toLocaleString("ko-KR");

/** 1.53억 · 9,300만원 · 5,000원 식 축약 표기 */
export function fmtEok(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e8) {
    const eok = Math.round((n / 1e8) * 100) / 100;
    return eok.toLocaleString("ko-KR") + "억";
  }
  if (abs >= 1e4) return Math.round(n / 1e4).toLocaleString("ko-KR") + "만원";
  return Math.round(n).toLocaleString("ko-KR") + "원";
}

export const ymOf = (date: string) => date.slice(0, 7);
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export type Holding = {
  stock: Stock;
  qty: number;
  invested: number; // 투입 원금
  avgPrice: number;
  value: number; // 평가금액 (현재가 없으면 원금)
  lastBuyDate?: string;
};

export function computeHoldings(stocks: Stock[], buys: Buy[]): Holding[] {
  return stocks.map((stock) => {
    const mine = buys.filter((b) => b.stockId === stock.id);
    const qty = mine.reduce((s, b) => s + b.qty, 0);
    const invested = mine.reduce((s, b) => s + b.qty * b.price, 0);
    const avgPrice = qty > 0 ? invested / qty : 0;
    const value = qty > 0 ? qty * (stock.currentPrice ?? avgPrice) : 0;
    const lastBuyDate = mine.length
      ? mine.map((b) => b.date).sort().at(-1)
      : undefined;
    return { stock, qty, invested, avgPrice, value, lastBuyDate };
  });
}

/** 현금 자산 원화 환산 총액 */
export function cashTotal(s: { cashKrw?: number; cashUsd?: number; usdRate?: number }): number {
  return (s.cashKrw ?? 0) + (s.cashUsd ?? 0) * (s.usdRate ?? 1400);
}

/** 월별 종목별 누적값 (스택 영역 차트용). mode: 투입원금 | 보유수량 */
export function monthlyCumulative(
  stocks: Stock[],
  buys: Buy[],
  mode: "amount" | "qty" = "amount",
) {
  if (buys.length === 0) return [] as Array<Record<string, number | string>>;
  const months: string[] = [];
  const first = buys.map((b) => ymOf(b.date)).sort()[0];
  const now = ymOf(todayStr());
  let [y, m] = first.split("-").map(Number);
  while (true) {
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    months.push(ym);
    if (ym >= now) break;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    if (months.length > 600) break;
  }
  const cum: Record<string, number> = {};
  return months.map((ym) => {
    for (const b of buys)
      if (ymOf(b.date) === ym)
        cum[b.stockId] = (cum[b.stockId] ?? 0) + (mode === "qty" ? b.qty : b.qty * b.price);
    const row: Record<string, number | string> = { ym };
    for (const s of stocks) row[s.id] = cum[s.id] ?? 0;
    return row;
  });
}

/** 종목 하나의 수량 누적 계단 데이터 */
export function qtySteps(buys: Buy[], stockId: string) {
  const mine = buys
    .filter((b) => b.stockId === stockId)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  let cum = 0;
  return mine.map((b) => {
    cum += b.qty;
    return { date: b.date, qty: cum };
  });
}

/** 다음 매수일과 D-day */
export function nextBuyInfo(buyDay: number) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), now.getMonth(), buyDay);
  if (today.getTime() > target.getTime())
    target = new Date(now.getFullYear(), now.getMonth() + 1, buyDay);
  const dday = Math.round((target.getTime() - today.getTime()) / 86400000);
  return { target, dday };
}

export function boughtInMonth(buys: Buy[], ym: string) {
  return buys.some((b) => ymOf(b.date) === ym);
}

/** 연속 적립 개월 수 (이번 달 미매수면 지난달까지 인정) */
export function streakMonths(buys: Buy[]): number {
  if (buys.length === 0) return 0;
  const set = new Set(buys.map((b) => ymOf(b.date)));
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  const cur = `${y}-${String(m).padStart(2, "0")}`;
  if (!set.has(cur)) { m -= 1; if (m === 0) { m = 12; y -= 1; } }
  let streak = 0;
  while (set.has(`${y}-${String(m).padStart(2, "0")}`)) {
    streak += 1;
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }
  return streak;
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = new Date(dateStr + "T00:00:00");
  return Math.max(0, Math.round((t.getTime() - today.getTime()) / 86400000));
}

export function monthsUntil(dateStr: string): number {
  const now = new Date();
  const t = new Date(dateStr + "T00:00:00");
  return Math.max(0, (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth()));
}

/** 월복리 미래가치: 현재자산 P, 월적립 m, 연수익률 rPct, N개월 */
export function futureValue(P: number, m: number, rPct: number, N: number): number {
  const i = rPct / 100 / 12;
  if (i === 0) return P + m * N;
  const g = Math.pow(1 + i, N);
  return P * g + m * ((g - 1) / i);
}

/** 잔디밭: ym → 그 달 투입액 */
export function monthlyInvestMap(buys: Buy[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const b of buys) {
    const ym = ymOf(b.date);
    map.set(ym, (map.get(ym) ?? 0) + b.qty * b.price);
  }
  return map;
}
