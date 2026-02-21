import { motion } from "framer-motion";
import { positions, lpPositions } from "@/lib/mockData";
import { StatCard } from "@/components/StatCard";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const Portfolio = () => {
  const totalDeposited = positions.reduce((s, p) => s + p.shares * p.avgPrice, 0) + lpPositions.reduce((s, l) => s + l.deposited, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalFees = lpPositions.reduce((s, l) => s + l.feesEarned, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Portfolio</h1>
        <p className="text-xs text-muted-foreground mb-6">Your positions, LP, and P&L overview.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard label="Total Deposited" value={`$${totalDeposited.toFixed(0)}`} />
        <StatCard label="Open P&L" value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}`} delay={0.05} />
        <StatCard label="LP Fees Earned" value={`$${totalFees.toFixed(0)}`} delay={0.1} />
        <StatCard label="Open Positions" value={`${positions.length}`} delay={0.15} />
      </div>

      {/* Positions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Open Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 text-left font-medium">Market</th>
                <th className="pb-2 text-left font-medium">Side</th>
                <th className="pb-2 text-right font-medium">Shares</th>
                <th className="pb-2 text-right font-medium">Avg Price</th>
                <th className="pb-2 text-right font-medium">Current</th>
                <th className="pb-2 text-right font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5">
                    <div className="font-medium text-foreground">{pos.asset}</div>
                    <div className="text-[10px] text-muted-foreground">{pos.condition}</div>
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      pos.side === 'YES' ? 'bg-chart-yes/15 text-chart-yes' : 'bg-chart-no/15 text-chart-no'
                    }`}>
                      {pos.side}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-foreground">{pos.shares}</td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">{pos.avgPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-mono text-foreground">{pos.currentPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right">
                    <div className={`flex items-center justify-end gap-0.5 font-mono ${pos.pnl >= 0 ? 'text-yield-up' : 'text-yield-down'}`}>
                      {pos.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      ${Math.abs(pos.pnl).toFixed(0)} ({pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%)
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* LP Positions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">LP Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 text-left font-medium">Market</th>
                <th className="pb-2 text-right font-medium">Deposited</th>
                <th className="pb-2 text-right font-medium">Current Value</th>
                <th className="pb-2 text-right font-medium">Fees Earned</th>
                <th className="pb-2 text-right font-medium">APY</th>
              </tr>
            </thead>
            <tbody>
              {lpPositions.map((lp) => (
                <tr key={lp.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{lp.asset}</td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">${lp.deposited.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono text-foreground">${lp.currentValue.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono text-yield-up">${lp.feesEarned}</td>
                  <td className="py-2.5 text-right font-mono text-primary">{lp.apy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Portfolio;
