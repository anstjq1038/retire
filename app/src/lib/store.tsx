import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import {
  collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import {
  DEFAULT_SETTINGS, DEFAULT_STOCK_NAMES,
  type Buy, type Settings, type Stock,
} from "./types";

type Store = {
  ready: boolean;
  stocks: Stock[];
  buys: Buy[];
  settings: Settings;
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

  const store = useMemo<Store>(() => ({
    ready: readyCount >= 3,
    stocks, buys, settings,
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
      for (let i = 0; i < DEFAULT_STOCK_NAMES.length; i++) {
        await setDoc(doc(db, `${base}/stocks/${newId()}`), {
          name: DEFAULT_STOCK_NAMES[i], colorIdx: i, createdAt: Date.now() + i,
        });
      }
    },
  }), [base, stocks, buys, settings, readyCount]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
