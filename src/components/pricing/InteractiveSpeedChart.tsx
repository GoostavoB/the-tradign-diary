import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

// Interactive, animated chart comparing Manual vs AI Upload
// Data points are Gustavo's real timings (Oct 2025):
// - Manual 1 trade: 140s | Upload 1 trade: 10s
// - 10 trades (1 image): Manual 1,400s | Upload: 15s
// - 100 trades (10 images): Manual 14,000s | Upload: 20s

const SCENARIOS = [
  {
    id: "1",
    label: "1 trade",
    manualSeconds: 140,
    uploadSeconds: 10,
    images: 1,
    trades: 1,
  },
  {
    id: "10",
    label: "10 trades (1 image)",
    manualSeconds: 1400,
    uploadSeconds: 15,
    images: 1,
    trades: 10,
  },
  {
    id: "100",
    label: "100 trades (10 images)",
    manualSeconds: 14000,
    uploadSeconds: 20,
    images: 10,
    trades: 100,
  },
];

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function useCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(target * p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return Math.round(value * 10) / 10;
}

export default function InteractiveSpeedChart() {
  const [scenarioId, setScenarioId] = useState("10");
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId)!,
    [scenarioId]
  );

  const speedup = useMemo(
    () => scenario.manualSeconds / scenario.uploadSeconds,
    [scenario]
  );

  // Animated counters
  const speedupAnim = useCounter(speedup, 900);
  const manualAnim = useCounter(scenario.manualSeconds, 700);
  const uploadAnim = useCounter(scenario.uploadSeconds, 700);
  const savedAnim = useCounter(
    scenario.manualSeconds - scenario.uploadSeconds,
    900
  );

  // Bar widths are proportional to sqrt of time to avoid extreme aspect ratios
  const maxRef = Math.max(...SCENARIOS.map((s) => s.manualSeconds));
  const scale = (v: number) => Math.sqrt(v / maxRef) * 100;

  const bars = [
    {
      key: "manual",
      label: "Manual entry",
      seconds: scenario.manualSeconds,
      tone: "bg-muted",
      glow: "shadow-[0_0_40px_hsl(var(--muted)/0.35)]",
    },
    {
      key: "upload",
      label: "AI Upload",
      seconds: scenario.uploadSeconds,
      tone: "bg-primary",
      glow: "shadow-[0_0_50px_hsl(var(--primary)/0.55)]",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Trade Upload Speed – Real-World Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on measured timings: manual journaling vs AI image upload.
          </p>
        </div>
        <div className="flex gap-2 bg-muted/30 p-1 rounded-xl">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                scenarioId === s.id
                  ? "bg-background shadow"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={b.key} className="">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{b.label}</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={scenarioId + b.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs tabular-nums text-muted-foreground"
                >
                  {formatHMS(b.seconds)}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="h-4 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                key={scenarioId + b.key + "bar"}
                initial={{ width: 0 }}
                animate={{ width: `${scale(b.seconds)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${b.tone} ${b.glow}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-2xl border bg-card backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Speed gain</div>
          <div className="text-3xl font-semibold mt-1 tabular-nums">{speedupAnim}x</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5" />
            <span>Calculated as manual time divided by AI upload time.</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border bg-card backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Manual time</div>
          <div className="text-3xl font-semibold mt-1 tabular-nums">{formatHMS(manualAnim)}</div>
          <div className="text-xs text-muted-foreground mt-2">Based on measured workflow.</div>
        </div>
        <div className="p-4 rounded-2xl border bg-card backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">AI upload time</div>
          <div className="text-3xl font-semibold mt-1 tabular-nums">{formatHMS(uploadAnim)}</div>
          <div className="text-xs text-muted-foreground mt-2">Single image recognition.</div>
        </div>
      </div>

      {/* Time saved */}
      <div className="mt-6 p-5 rounded-2xl bg-primary/10 border border-primary/20">
        <div className="text-sm text-primary">Time saved</div>
        <div className="text-2xl md:text-3xl font-semibold tabular-nums mt-1">
          {formatHMS(savedAnim)} saved
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Scenario: {scenario.label}. Manual {formatHMS(scenario.manualSeconds)} vs AI {formatHMS(scenario.uploadSeconds)}.
        </p>
      </div>

      {/* Footnote */}
      <p className="text-xs text-muted-foreground mt-6">
        Methodology: manual journaling measured at 2m20s per trade; AI upload measured at 10s for a single trade, 15s for 10 trades (1 image), and 20s for 100 trades (10 images). Results based on timed tests.
      </p>
    </div>
  );
}
