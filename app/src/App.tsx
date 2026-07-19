import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import { StoreProvider, useStore } from "./lib/store";
import TabBar from "./components/TabBar";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import StockDetail from "./pages/StockDetail";
import Record from "./pages/Record";
import Insights from "./pages/Insights";
import Goal from "./pages/Goal";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";

function Shell() {
  const { ready } = useStore();
  const location = useLocation();
  if (!ready)
    return (
      <div className="flex h-dvh items-center justify-center text-[var(--ink3)]">
        불러오는 중…
      </div>
    );
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <div className="flex-1 px-4 pb-28 pt-3">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<StockDetail />} />
            <Route path="/record" element={<Record />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/goal" element={<Goal />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      <TabBar />
    </div>
  );
}

export default function App() {
  const { user, ready, login, logout } = useAuth();
  if (!ready)
    return <div className="flex h-dvh items-center justify-center text-[var(--ink3)]">…</div>;
  if (!user) return <Login onLogin={login} />;
  return (
    <StoreProvider user={user}>
      <Shell />
    </StoreProvider>
  );
}
