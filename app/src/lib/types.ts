export type Stock = {
  id: string;
  name: string;
  ticker?: string;
  code?: string; // KRX 종목코드 — 자동 시세 매칭용
  colorIdx: number;
  currentPrice?: number; // 수동 갱신 현재가 (없으면 평단가로 평가)
  live?: boolean; // 자동 시세가 반영된 상태 (저장 안 함, 런타임 전용)
  createdAt: number;
};

export type Buy = {
  id: string;
  stockId: string;
  date: string; // YYYY-MM-DD
  qty: number;
  price: number; // 1주 매수단가 (원)
  createdAt: number;
};

export type Settings = {
  goal: number; // 목표금액 (원)
  retireDate: string; // YYYY-MM-DD
  buyDay: number; // 매월 매수일
  monthlyBudget: number; // 월 적립 목표액 (시뮬레이터 기본값)
  annualReturn: number; // 연 기대수익률 %
  cashKrw: number; // 보유 현금 (원화)
  cashUsd: number; // 보유 현금 (달러)
  usdRate: number; // 달러 환산 환율 (수동)
};

export const DEFAULT_SETTINGS: Settings = {
  goal: 1_500_000_000,
  retireDate: "2044-07-01",
  buyDay: 25,
  monthlyBudget: 1_000_000,
  annualReturn: 7,
  cashKrw: 0,
  cashUsd: 0,
  usdRate: 1400,
};

export const DEFAULT_STOCKS: Array<{ name: string; code: string }> = [
  { name: "TIGER 구글밸류체인", code: "0190Y0" },
  { name: "SOL 미국양자컴퓨팅TOP10", code: "0023A0" },
  { name: "KIWOOM 미국우주데이터센터인프라", code: "0207Z0" },
  { name: "KODEX 미국나스닥100", code: "379810" },
  { name: "HANARO 미국AI메모리반도체TOP4+", code: "0181B0" },
];
