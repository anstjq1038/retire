import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); }), []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // 팝업이 막힌 환경(설치형 PWA 등)은 리다이렉트로 재시도
      try { await signInWithRedirect(auth, googleProvider); } catch { /* 사용자가 취소 */ }
    }
  };
  const logout = () => signOut(auth);
  return { user, ready, login, logout };
}
