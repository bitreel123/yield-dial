import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Zap, CheckCircle2, Clock, Database, Brain, Globe, Link2,
  ChevronDown, ChevronUp, Loader2, AlertTriangle
} from "lucide-react";

interface WorkflowStep {
  step: number;
  name: string;
  type: string;
  status: string;
  duration_ms: number;
  details: Record<string, any>;
}

interface WorkflowResult {
  workflow: { name: string; execution_id: string; trigger_type: string; cre_version: string };
  execution: { timestamp: string; total_duration_ms: number; status: string; steps_completed: number };
  blockchain: { chain: string; chain_id: string; block_number: number; rpc: string };
  external_api: { source: string; url: string; total_pools: number };
  ai_agent: { model: string; markets_settled: number };
  steps: WorkflowStep[];
  settlements: any[];
}

const STEP_ICONS: Record<string, typeof Zap> = {
  trigger: Clock,
  blockchain_read: Link2,
  external_api: Globe,
  ai_agent: Brain,
  data_write: Database,
};

const STEP_COLORS: Record<string, string> = {
  trigger: "text-primary",
  blockchain_read: "text-blue-400",
  external_api: "text-orange-400",
  ai_agent: "text-purple-400",
  data_write: "text-chart-yes",
};

export default function CREWorkflow() {
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [running, setRunning] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const runWorkflow = async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("cre-workflow-simulate");
      if (error) throw error;
      setResult(data);
      toast.success(`CRE Workflow completed in ${data.execution.total_duration_ms}ms — ${data.execution.steps_completed} steps`);
    } catch (err: any) {
      toast.error("Workflow failed: " + (err?.message || "Unknown error"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">CRE Workflow</h1>
              <p className="text-xs text-muted-foreground">Chainlink Runtime Environment — Live Orchestration</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This workflow integrates <strong className="text-foreground">Ethereum blockchain</strong> with{" "}
            <strong className="text-foreground">DeFiLlama API</strong> and{" "}
            <strong className="text-foreground">Gemini AI agent</strong> to settle yield prediction markets.
            Every step uses real data — no mocks.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="glass-card p-4 mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Workflow Architecture</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { icon: Clock, label: "Cron Trigger", sub: "Every 30min", color: "text-primary" },
              { icon: Link2, label: "Blockchain", sub: "ETH Mainnet", color: "text-blue-400" },
              { icon: Globe, label: "DeFiLlama", sub: "18K+ pools", color: "text-orange-400" },
              { icon: Brain, label: "Gemini AI", sub: "Settlement", color: "text-purple-400" },
              { icon: Database, label: "On-Chain", sub: "Write report", color: "text-chart-yes" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary border border-border/50`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{step.label}</span>
                  <span className="text-[9px] text-muted-foreground">{step.sub}</span>
                </div>
                {i < 4 && <span className="text-muted-foreground/30 text-lg">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <Button
          onClick={runWorkflow}
          disabled={running}
          className="w-full mb-6 h-12 text-sm gap-2"
          size="lg"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {running ? "Executing CRE Workflow..." : "Run CRE Workflow Simulation"}
        </Button>

        {/* Running Animation */}
        {running && (
          <div className="glass-card p-6 mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-foreground">Executing workflow...</p>
                <p className="text-xs text-muted-foreground">
                  Fetching ETH block → DeFiLlama data → AI settlement → Writing results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-chart-yes" />
                  <span className="text-sm font-bold text-foreground">Workflow Completed</span>
                </div>
                <span className="text-xs font-mono text-primary">{result.execution.total_duration_ms}ms</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">ETH Block</p>
                  <p className="text-sm font-mono font-bold text-foreground">#{result.blockchain.block_number.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Pools Fetched</p>
                  <p className="text-sm font-mono font-bold text-foreground">{result.external_api.total_pools.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Markets Settled</p>
                  <p className="text-sm font-mono font-bold text-foreground">{result.ai_agent.markets_settled}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">AI Model</p>
                  <p className="text-[10px] font-mono font-bold text-foreground">{result.ai_agent.model}</p>
                </div>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Execution Timeline</h3>
              <div className="space-y-2">
                {result.steps.map((step) => {
                  const Icon = STEP_ICONS[step.type] || Zap;
                  const color = STEP_COLORS[step.type] || "text-primary";
                  const isExpanded = expandedStep === step.step;

                  return (
                    <div key={step.step} className="rounded-lg border border-border/50 overflow-hidden">
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors"
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-secondary ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-semibold text-foreground">{step.name}</p>
                          <p className="text-[10px] text-muted-foreground">{step.type} · {step.duration_ms}ms</p>
                        </div>
                        <span className={`text-[10px] font-bold ${step.status === "success" ? "text-chart-yes" : "text-chart-no"}`}>
                          {step.status === "success" ? "✓" : "✗"}
                        </span>
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3">
                              <pre className="rounded-md bg-background/80 p-3 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(step.details, null, 2)}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Settlement Results */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">AI Settlement Results</h3>
              <div className="space-y-2">
                {result.settlements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5 border border-border/30">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.asset}</p>
                      <p className="text-[10px] text-muted-foreground">
                        APY: {s.current_apy}% · Threshold: {s.threshold}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${s.outcome === "YES" ? "text-chart-yes" : "text-chart-no"}`}>
                        {s.outcome}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{(s.confidence * 100).toFixed(0)}% confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON */}
            <details className="glass-card p-4">
              <summary className="text-xs font-semibold text-foreground cursor-pointer">Raw Workflow Response</summary>
              <pre className="mt-3 rounded-md bg-background/80 p-3 text-[9px] font-mono text-muted-foreground overflow-x-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
