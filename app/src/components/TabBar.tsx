import { NavLink, useNavigate } from "react-router-dom";

const tabs = [
  { to: "/", label: "홈", icon: "🏠" },
  { to: "/portfolio", label: "포트폴리오", icon: "📊" },
  { to: "__record", label: "", icon: "" }, // 가운데 + 버튼 자리
  { to: "/goal", label: "목표", icon: "⛰️" },
  { to: "/settings", label: "설정", icon: "⚙️" },
];

export default function TabBar() {
  const nav = useNavigate();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-[var(--hairline)] bg-[var(--card)]/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative grid grid-cols-5">
        {tabs.map((t) =>
          t.to === "__record" ? (
            <div key={t.to} className="relative">
              <button
                aria-label="매수 기록하기"
                onClick={() => nav("/record")}
                className="press absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] px-[18px] py-[13px] text-xl font-bold text-white shadow-lg"
              >
                +
              </button>
            </div>
          ) : (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                  isActive ? "font-bold text-[var(--ink)]" : "text-[var(--ink3)]"
                }`
              }
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  );
}
