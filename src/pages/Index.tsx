import { useState } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/MarketCard";
import { StatCard } from "@/components/StatCard";
import { markets, categoryLabels } from "@/lib/mockData";
import { Search, Filter } from "lucide-react";

const categories = ['all', 'eth-lsd', 'sol-lsd', 'restaking', 'defi-yield'] as const;

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = markets.filter((m) => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (search && !m.asset.toLowerCase().includes(search.toLowerCase()) && !m.condition.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalVolume = markets.reduce((s, m) => s + m.volume24h, 0);
  const totalLiquidity = markets.reduce((s, m) => s + m.totalLiquidity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Yield Prediction Markets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trade, hedge, and speculate on liquid staking yields.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Volume" value={`$${(totalVolume / 1e6).toFixed(2)}M`} delay={0} />
        <StatCard label="Total Liquidity" value={`$${(totalLiquidity / 1e6).toFixed(1)}M`} delay={0.05} />
        <StatCard label="Active Markets" value={`${markets.length}`} delay={0.1} />
        <StatCard label="Trending" value={`${markets.filter(m => m.trending).length}`} sub="Hot markets" delay={0.15} />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat === 'all' ? 'All Markets' : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-secondary pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 sm:w-56"
          />
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((market, i) => (
          <MarketCard key={market.id} market={market} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No markets found.
        </div>
      )}
    </div>
  );
};

export default Index;
