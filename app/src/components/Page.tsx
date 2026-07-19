import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** 화면 전환 페이드+슬라이드 래퍼 */
export default function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
