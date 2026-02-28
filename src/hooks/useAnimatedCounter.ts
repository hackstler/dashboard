import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevTarget.current = target;
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}
