import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, Flame, ArrowUpRight } from "lucide-react";
import type { YieldMarket } from "@/lib/mockData";

interface HeroMarketProps {
  market: YieldMarket;
}

// Generate mock price history
const generatePriceHistory = () => {
  const points: { time: string; yes: number; no: number }[] = [];
  let yesPrice = 0.35;
  const hours = ["6:00am", "9:30am", "12:00pm", "2:30pm", "5:00pm", "7:30pm", "10:00pm"];
  hours.forEach((time) => {
    yesPrice = Math.max(0.1, Math.min(0.9, yesPrice + (Math.random() - 0.48) * 0.08));
    points.push({ time, yes: yesPrice, no: 1 - yesPrice });
  });
  // End near current market price
  points[points.length - 1].yes = 0.42;
  points[points.length - 1].no = 0.58;
  return points;
};

const recentTrades = [
  { amount: 2400, side: "YES" as const },
  { amount: 850, side: "NO" as const },
  { amount: 5100, side: "YES" as const },
  { amount: 1200, side: "NO" as const },
  { amount: 3300, side: "YES" as const },
  { amount: 720, side: "NO" as const },
  { amount: 4800, side: "YES" as const },
  { amount: 1900, side: "NO" as const },
];

export const HeroMarket = ({ market }: HeroMarketProps) => {
  const [priceHistory] = useState(generatePriceHistory);
  const [visibleTrades, setVisibleTrades] = useState<typeof recentTrades>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const tradeIndex = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  // Animate trades appearing
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = tradeIndex.current;
      if (idx < recentTrades.length) {
        tradeIndex.current = idx + 1;
        setVisibleTrades((prev) => [...prev, recentTrades[idx]]);
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // SVG chart dimensions
  const chartW = 480;
  const chartH = 160;
  const padX = 0;
  const padY = 10;

  const toX = (i: number) => padX + (i / (priceHistory.length - 1)) * (chartW - padX * 2);
  const toY = (val: number) => padY + (1 - val) * (chartH - padY * 2);

  const yesPath = priceHistory
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.yes)}`)
    .join(" ");

  const areaPath = `${yesPath} L ${toX(priceHistory.length - 1)} ${chartH} L ${toX(0)} ${chartH} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Link
        to={`/market/${market.id}`}
        className="group block overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-glow)]"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              {market.condition}
            </h2>
            <Flame className="h-3.5 w-3.5 text-warning" />
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-yes opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-yes" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-chart-yes">
              Live
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left: Market info */}
          <div className="flex-1 p-5">
            {/* Options */}
            <div className="mb-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-base">{market.assetIcon}</span>
                  <span className="text-sm font-medium text-foreground">{market.asset}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {market.currentYield.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-chart-yes/15 px-3 py-1 text-xs font-bold font-mono text-chart-yes">
                    {yesPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-base">✕</span>
                  <span className="text-sm font-medium text-foreground">Below Threshold</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    &lt;{market.threshold}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-chart-no/15 px-3 py-1 text-xs font-bold font-mono text-chart-no">
                    {noPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="mb-4 text-xs text-muted-foreground font-mono">
              ${(market.volume24h / 1000).toFixed(0)}k vol · {market.timeRemaining} remaining
            </div>

            {/* News blurb */}
            <div className="rounded-lg bg-secondary/30 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Insight
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">·</span>
              <span className="ml-1 text-[11px] leading-relaxed text-secondary-foreground">
                {market.asset} staking yield currently sits at {market.currentYield}%, 
                {market.currentYield >= market.threshold ? " above " : " below "}
                the {market.threshold}% threshold. Market participants are pricing in a{" "}
                {yesPercent}% probability of exceeding the target by settlement on{" "}
                {new Date(market.settlementDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                .
              </span>
            </div>
          </div>

          {/* Right: Chart */}
          <div className="relative flex-1 border-t border-border/30 p-5 lg:border-l lg:border-t-0">
            {/* Chart */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((v) => (
                <line
                  key={v}
                  x1={0}
                  y1={toY(v)}
                  x2={chartW}
                  y2={toY(v)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  opacity={0.4}
                />
              ))}

              {/* Y axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <text
                  key={v}
                  x={chartW - 2}
                  y={toY(v) - 4}
                  textAnchor="end"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={8}
                  opacity={0.6}
                >
                  {Math.round(v * 100)}%
                </text>
              ))}

              {/* Area fill */}
              <defs>
                <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-yes))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-yes))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <motion.path
                d={areaPath}
                fill="url(#heroAreaGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Line */}
              <motion.path
                d={yesPath}
                fill="none"
                stroke="hsl(var(--chart-yes))"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />

              {/* Interactive hover points */}
              {priceHistory.map((p, i) => (
                <g key={i}>
                  <rect
                    x={toX(i) - 20}
                    y={0}
                    width={40}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(i)}
                  />
                  {hoveredPoint === i && (
                    <>
                      <line
                        x1={toX(i)}
                        y1={0}
                        x2={toX(i)}
                        y2={chartH}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={0.5}
                        strokeDasharray="3 3"
                        opacity={0.5}
                      />
                      <circle
                        cx={toX(i)}
                        cy={toY(p.yes)}
                        r={4}
                        fill="hsl(var(--chart-yes))"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </g>
              ))}

              {/* End point dot */}
              <motion.circle
                cx={toX(priceHistory.length - 1)}
                cy={toY(priceHistory[priceHistory.length - 1].yes)}
                r={3.5}
                fill="hsl(var(--chart-yes))"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
              />

              {/* X axis labels */}
              {priceHistory.map((p, i) => (
                <text
                  key={i}
                  x={toX(i)}
                  y={chartH - 2}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={7}
                  opacity={0.5}
                >
                  {p.time}
                </text>
              ))}
            </svg>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredPoint !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-5 rounded-md bg-card border border-border/50 px-2.5 py-1.5 shadow-lg"
                >
                  <div className="text-[10px] text-muted-foreground">{priceHistory[hoveredPoint].time}</div>
                  <div className="text-xs font-mono font-bold text-chart-yes">
                    Yes {Math.round(priceHistory[hoveredPoint].yes * 100)}%
                  </div>
                  <div className="text-xs font-mono font-bold text-chart-no">
                    No {Math.round(priceHistory[hoveredPoint].no * 100)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* End labels */}
            <div className="absolute right-6 top-6 text-right">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="text-[10px] text-chart-yes font-medium">{market.asset}</div>
                <div className="text-lg font-bold font-mono text-chart-yes">{yesPercent}%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="mt-1"
              >
                <div className="text-[10px] text-chart-no font-medium">Below</div>
                <div className="text-lg font-bold font-mono text-chart-no">{noPercent}%</div>
              </motion.div>
            </div>

            {/* Trade bubbles */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <AnimatePresence>
                {visibleTrades.map((trade, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.7, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                      trade.side === "YES"
                        ? "bg-chart-yes/10 text-chart-yes"
                        : "bg-chart-no/10 text-chart-no"
                    }`}
                  >
                    + ${trade.amount.toLocaleString()}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between border-t border-border/30 px-5 py-2.5">
          <span className="text-[10px] text-muted-foreground">
            Trade this market →
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>
      </Link>
    </motion.div>
  );
};
