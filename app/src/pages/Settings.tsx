import { useState } from "react";
import { signOut } from "firebase/auth";
import Page from "../components/Page";
import { auth } from "../lib/firebase";
import { useStore } from "../lib/store";

export default function SettingsPage() {
  const { settings, saveSettings, stocks, buys } = useStore();
  const [goalEok, setGoalEok] = useState(String(settings.goal / 1e8));
  const [retireDate, setRetireDate] = useState(settings.retireDate);
  const [buyDay, setBuyDay] = useState(String(settings.buyDay));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await saveSettings({
      goal: Math.round(Number(goalEok) * 1e8) || settings.goal,
      retireDate,
      buyDay: Math.min(28, Math.max(1, Number(buyDay) || 25)),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ settings, stocks, buys, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `적립-백업-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Page>
      <h1 className="mb-4 mt-2 text-lg font-extrabold">설정</h1>

      <section className="card space-y-4 px-5 py-5">
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">목표금액 (억원)</span>
          <input
            inputMode="decimal" value={goalEok}
            onChange={(e) => setGoalEok(e.target.value)}
            className="mt-1 w-full bg-transparent text-xl font-extrabold outline-none"
          />
        </label>
        <div className="h-px bg-[var(--hairline)]" />
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">은퇴 목표일</span>
          <input
            type="date" value={retireDate}
            onChange={(e) => setRetireDate(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold outline-none"
          />
        </label>
        <div className="h-px bg-[var(--hairline)]" />
        <label className="block">
          <span className="text-xs font-bold text-[var(--ink2)]">매월 매수일 (1–28)</span>
          <input
            inputMode="numeric" value={buyDay}
            onChange={(e) => setBuyDay(e.target.value)}
            className="mt-1 w-full bg-transparent text-xl font-extrabold outline-none"
          />
        </label>
      </section>

      <button
        onClick={save}
        className="press mt-3 w-full rounded-2xl bg-[var(--accent)] py-4 font-bold text-white"
      >
        {saved ? "저장됐어요 ✓" : "저장"}
      </button>

      <section className="card mt-4 divide-y divide-[var(--hairline)]">
        <button onClick={exportJson} className="press w-full px-5 py-4 text-left text-sm font-bold">
          데이터 백업 (JSON 내려받기)
        </button>
        <button
          onClick={() => signOut(auth)}
          className="press w-full px-5 py-4 text-left text-sm font-bold text-[#d03b3b]"
        >
          로그아웃
        </button>
      </section>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--ink3)]">
        적립 v1.0 · 데이터는 내 Google 계정 전용 공간(Firestore)에 저장돼요
        <br />
        홈 화면에 추가하면 앱처럼 쓸 수 있어요
      </p>
    </Page>
  );
}
