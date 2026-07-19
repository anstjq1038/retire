import { motion } from "framer-motion";
import { SERIES_LIGHT } from "../lib/palette";

/** 저장 성공 시 화면 중앙에서 터지는 가벼운 컨페티 */
export default function Confetti() {
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    color: SERIES_LIGHT[i % SERIES_LIGHT.length],
    x: (Math.random() - 0.5) * 320,
    y: -60 - Math.random() * 240,
    rot: (Math.random() - 0.5) * 540,
    delay: Math.random() * 0.12,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 40, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 0.6 }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          className="absolute h-2.5 w-2.5 rounded-sm"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}
