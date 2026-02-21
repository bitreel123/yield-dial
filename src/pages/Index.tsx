import { useState } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/MarketCard";
import { HeroMarket } from "@/components/HeroMarket";
import { markets, categoryLabels } from "@/lib/mockData";
import { Search } from "lucide-react";

const categories = ['all', 'eth-lsd', 'sol-lsd', 'restaking', 'defi-yield'] as const;

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = markets.filter((m) => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (search && !m.asset.toLowerCase().includes(search.toLowerCase()) && !m.condition.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Pick the first trending market as the featured hero
  const featuredMarket = markets.find((m) => m.trending) || markets[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero Featured Market */}
      <HeroMarket market={featuredMarket} />

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
