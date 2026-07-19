import { useEffect, useRef, useState } from "react";

/** 값이 바뀔 때 스프링처럼 굴러가는 숫자 (토스 감성) */
export default function AnimatedNumber({
  value,
  format,
  duration = 700,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * ease);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
