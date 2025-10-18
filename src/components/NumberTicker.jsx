import React, { useEffect, useRef, useState } from 'react';

export default function NumberTicker({
  value = 0,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  startOnView = true,
  once = true,
  className = '',
}) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setStarted(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setStarted(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, once]);

  useEffect(() => {
    if (!started) return;
    const to = Number(value) || 0;
    const from = 0;

    if (to === 0) {
      setDisplay(0);
      setDone(true);
      return;
    }

    let raf;
    let startTs;
    let cancelled = false;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = (ts) => {
      if (cancelled) return;
      if (startTs == null) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const current = from + (to - from) * ease(progress);
      const factor = Math.pow(10, decimals);
      setDisplay(Math.round(current * factor) / factor);
      if (progress < 1) raf = requestAnimationFrame(step);
      else setDone(true);
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [started, value, duration, decimals]);

  const formatted = (() => {
    const num = started || done ? display : 0;
   
    const fixed = decimals > 0 ? Number(num.toFixed(decimals)) : Math.round(num);
    return `${prefix}${fixed.toLocaleString()}${suffix}`;
  })();

  return (
    <span ref={ref} className={className} aria-live="polite" aria-atomic="true">
      {formatted}
    </span>
  );
}
