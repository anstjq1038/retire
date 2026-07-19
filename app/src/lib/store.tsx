import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import {
  collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import {
  DEFAULT_SETTINGS, DEFAULT_STOCKS,
  type Buy, type Settings, type Stock,
} from "./types";

// GitHub Actions가 30분마다 갱신하는 시세 파일 (raw는 CORS 허용)
const PRICES_URL = "https://raw.githubusercontent.com/anstjq1038/retire/master/prices.json";
const normName = (s: string) => s.replaceAll(" ", "").toLowerCase();

type LivePrices = {
  byCode: Map<string, number>;
  byName: Map<string, number>;
  updatedAt?: string;
};

type Store = {
  ready: boolean;
  stocks: Stock[];
  buys: Buy[];
  settings: Settings;
  pricesUpdatedAt?: string;
  addStock: (name: string, ticker?: string) => Promise<string>;
  updateStock: (id: string, patch: Partial<Stock>) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  addBuy: (b: Omit<Buy, "id" | "createdAt">) => Promise<void>;
  updateBuy: (id: string, patch: Partial<Buy>) => Promise<void>;
  deleteBuy: (id: string) => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  seedDefaults: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
};

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function StoreProvider({ user, children }: { user: User; children: ReactNode }) {
  const uid = user.uid;
  const base = `retirement/${uid}`;
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [buys, setBuys] = useState<Buy[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [readyCount, setReadyCount] = useState(0);
  const [live, setLive] = useState<LivePrices>({ byCode: new Map(), byName: new Map() });

  useEffect(() => {
    fetch(PRICES_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.items) return;
        const byCode = new Map<string, number>();
        const byName = new Map<string, number>();
        for (const it of d.items) {
          byCode.set(String(it.code), Number(it.price));
          byName.set(normName(String(it.name)), Number(it.price));
        }
        setLive({ byCode, byName, updatedAt: d.updatedAt });
      })
      .catch(() => { /* 시세 실패 시 수동 현재가로 동작 */ });
  }, []);

  useEffect(() => {
    const un1 = onSnapshot(collection(db, `${base}/stocks`), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Stock);
      arr.sort((a, b) => a.colorIdx - b.colorIdx || a.createdAt - b.createdAt);
      setStocks(arr);
      setReadyCount((c) => (c < 1 ? 1 : c));
    });
    const un2 = onSnapshot(collection(db, `${base}/buys`), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Buy);
      arr.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt));
      setBuys(arr);
      setReadyCount((c) => (c < 2 ? 2 : c));
    });
    const un3 = onSnapshot(doc(db, base), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as Settings);
      setReadyCount((c) => (c < 3 ? 3 : c));
    });
    return () => { un1(); un2(); un3(); };
  }, [base]);

  // 자동 시세를 종목에 병합 (코드 우선, 이름 매칭 보조) — 수동 현재가는 백업
  const mergedStocks = useMemo(
    () =>
      stocks.map((s) => {
        const p = (s.code && live.byCode.get(s.code)) || live.byName.get(normName(s.name));
        return p ? { ...s, currentPrice: p, live: true } : s;
      }),
    [stocks, live],
  );

  const store = useMemo<Store>(() => ({
    ready: readyCount >= 3,
    stocks: mergedStocks, buys, settings,
    pricesUpdatedAt: live.updatedAt,
    async addStock(name, ticker) {
      const id = newId();
      const used = new Set(stocks.map((s) => s.colorIdx));
      let colorIdx = 0;
      while (used.has(colorIdx)) colorIdx += 1;
      const stock: Omit<Stock, "id"> = {
        name, colorIdx, createdAt: Date.now(),
        ...(ticker ? { ticker } : {}),
      };
      await setDoc(doc(db, `${base}/stocks/${id}`), stock);
      return id;
    },
    async updateStock(id, patch) {
      await updateDoc(doc(db, `${base}/stocks/${id}`), patch as Record<string, unknown>);
    },
    async deleteStock(id) {
      for (const b of buys.filter((x) => x.stockId === id))
        await deleteDoc(doc(db, `${base}/buys/${b.id}`));
      await deleteDoc(doc(db, `${base}/stocks/${id}`));
    },
    async addBuy(b) {
      const id = newId();
      await setDoc(doc(db, `${base}/buys/${id}`), { ...b, createdAt: Date.now() });
    },
    async updateBuy(id, patch) {
      await updateDoc(doc(db, `${base}/buys/${id}`), patch as Record<string, unknown>);
    },
    async deleteBuy(id) {
      await deleteDoc(doc(db, `${base}/buys/${id}`));
    },
    async saveSettings(patch) {
      await setDoc(doc(db, base), { ...settings, ...patch }, { merge: true });
    },
    async seedDefaults() {
      for (let i = 0; i < DEFAULT_STOCKS.length; i++) {
        await setDoc(doc(db, `${base}/stocks/${newId()}`), {
          name: DEFAULT_STOCKS[i].name, code: DEFAULT_STOCKS[i].code,
          colorIdx: i, createdAt: Date.now() + i,
        });
      }
    },
  }), [base, stocks, mergedStocks, buys, settings, readyCount, live.updatedAt]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
