"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  differenceInDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { useEcho, type Insight } from "@/lib/echo/store";
import { EchoCard } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { EchoChip } from "../ui/echo-chip";
import { SealStamp } from "../ui/seal-stamp";
import { useToast } from "@/hooks/use-toast";

const dateKey = (d: Date) => format(d, "yyyy-MM-dd");

type InsightTone = "gold" | "jade" | "vermillion" | "mist";

const INSIGHT_META: Record<
  Insight["type"],
  { icon: LucideIcon; tone: InsightTone; zh: string; label: string; hex: string }
> = {
  pattern: { icon: Search, tone: "gold", zh: "相", label: "Padrão", hex: "#D4B062" },
  win: { icon: Trophy, tone: "jade", zh: "勝", label: "Vitória", hex: "#4A9D7C" },
  warning: {
    icon: AlertTriangle,
    tone: "vermillion",
    zh: "警",
    label: "Alerta",
    hex: "#C84B3F",
  },
  observation: {
    icon: Eye,
    tone: "mist",
    zh: "觀",
    label: "Observação",
    hex: "#5B7BA6",
  },
};

const MOOD_COLOR = ["#C84B3F", "#C8895A", "#5B7BA6", "#D4B062", "#4A9D7C"];

const EVOLUTION_CHARTS = [
  { key: "mood", label: "Humor", zh: "心", color: "#4A9D7C", domain: [1, 5] as [number, number] },
  { key: "anxiety", label: "Ansiedade", zh: "虑", color: "#C84B3F", domain: [0, 10] as [number, number] },
  { key: "energy", label: "Energia", zh: "氣", color: "#D4B062", domain: [0, 10] as [number, number] },
  { key: "sleep", label: "Sono", zh: "息", color: "#5B7BA6", domain: [0, 10] as [number, number] },
] as const;

function relativeTime(ts: number): string {
  const d = differenceInDays(Date.now(), ts);
  if (d <= 0) return "hoje";
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  if (d < 14) return "há uma semana";
  if (d < 30) return `há ${Math.floor(d / 7)} semanas`;
  return format(ts, "d 'de' MMM", { locale: ptBR });
}

export function InsightsScreen() {
  const diary = useEcho((s) => s.diary);
  const insights = useEcho((s) => s.insights);
  const patterns = useEcho((s) => s.patterns);
  const strengths = useEcho((s) => s.strengths);
  const challenges = useEcho((s) => s.challenges);
  const conversations = useEcho((s) => s.conversations);
  const profile = useEcho((s) => s.profile);
  const addInsight = useEcho((s) => s.addInsight);
  const dismissInsight = useEcho((s) => s.dismissInsight);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const activeInsights = useMemo(
    () => insights.filter((i) => !i.dismissed),
    [insights]
  );

  // 28-day evolution series
  const evolData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const d = subDays(today, 27 - i);
      const key = dateKey(d);
      const e = diary[key];
      return {
        key,
        label: format(d, "dd/MM"),
        mood: e ? e.mood : null,
        anxiety: e ? e.anxiety : null,
        energy: e ? e.energy : null,
        sleep: e ? e.sleep : null,
      };
    });
  }, [diary]);

  // 90-day timeline
  const timeline = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 90 }, (_, i) => {
      const d = subDays(today, 89 - i);
      const key = dateKey(d);
      const e = diary[key];
      return { key, date: d, mood: e?.mood ?? null };
    });
  }, [diary]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/echo/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: profile.name || "viajante",
          diary: Object.values(diary),
          recentConversations: conversations.slice(0, 6),
          patterns,
        }),
      });
      if (!res.ok) throw new Error("Falha na requisição");
      const data = await res.json();
      const arr: { content: string; type?: Insight["type"] }[] =
        data.insights ?? [];
      arr.forEach((ins) => {
        addInsight({
          content: ins.content,
          type: (ins.type as Insight["type"]) ?? "observation",
        });
      });
      toast({
        title: arr.length ? "Novos insights chegaram" : "Nada novo por hoje",
        description: arr.length
          ? `${arr.length} observação${arr.length > 1 ? "ões" : ""} do ECHO pra você.`
          : "Continue conversando e registrando. Os padrões aparecem.",
      });
    } catch {
      toast({
        title: "Não consegui escutar agora",
        description: "Tente de novo em alguns instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
      {/* HEADER */}
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="echo-brush text-3xl leading-none text-[var(--vermillion)]">
                觀
              </span>
              <h1 className="echo-display text-3xl font-semibold leading-none text-foreground">
                Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Padrões que o ECHO enxerga por você.
            </p>
          </div>
          <SealStamp char="觀" size={44} rotate={-4} />
        </div>
        <div className="mt-4">
          <EchoButton
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
            )}
            {loading ? "Observando..." : "Gerar novos"}
          </EchoButton>
        </div>
      </header>

      {/* INSIGHTS LIST */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="echo-brush text-lg leading-none text-[var(--gold)]">察</span>
          <h2 className="echo-display text-lg font-semibold">O que tenho visto</h2>
        </div>
        {activeInsights.length === 0 ? (
          <EchoCard className="flex flex-col items-center gap-3 py-8 text-center" glass>
            <SealStamp char="靜" size={56} rotate={-3} />
            <p className="echo-display text-base text-foreground">
              Ainda te observando.
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Converse mais comigo que os padrões aparecem. Pequenos movimentos,
              lidos no tempo certo, viram mapa.
            </p>
          </EchoCard>
        ) : (
          <div className="echo-no-scrollbar max-h-[28rem] space-y-2.5 overflow-y-auto pr-1">
            {activeInsights.map((ins, i) => {
              const meta = INSIGHT_META[ins.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={ins.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <EchoCard glow={meta.tone === "vermillion" ? "vermillion" : null}>
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: `${meta.hex}1f`,
                          color: meta.hex,
                          boxShadow: `0 0 0 1px ${meta.hex}33 inset`,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: meta.hex }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {relativeTime(ins.generatedAt)}
                          </span>
                        </div>
                        <p className="echo-display text-base leading-snug text-foreground">
                          {ins.content}
                        </p>
                        <button
                          type="button"
                          onClick={() => dismissInsight(ins.id)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-[var(--vermillion)]"
                        >
                          <X className="h-3 w-3" />
                          Dispensar
                        </button>
                      </div>
                    </div>
                  </EchoCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* EVOLUTION CHARTS (2x2) */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="echo-brush text-lg leading-none text-[var(--jade)]">變</span>
          <h2 className="echo-display text-lg font-semibold">Evolução · 4 semanas</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {EVOLUTION_CHARTS.map((c) => (
            <EchoCard key={c.key} className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="echo-brush text-sm leading-none"
                  style={{ color: c.color }}
                >
                  {c.zh}
                </span>
                <span className="text-[11px] font-medium text-foreground">
                  {c.label}
                </span>
              </div>
              <div style={{ height: 90 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evolData}
                    margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis dataKey="label" hide />
                    <YAxis domain={c.domain} hide />
                    <Tooltip
                      cursor={{
                        stroke: c.color,
                        strokeWidth: 1,
                        strokeOpacity: 0.4,
                      }}
                      contentStyle={{
                        background: "#12121E",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: "#9A9AB0" }}
                      formatter={(v: number) => [v ?? "—", c.label]}
                    />
                    <Line
                      type="monotone"
                      dataKey={c.key}
                      stroke={c.color}
                      strokeWidth={1.8}
                      connectNulls
                      dot={false}
                      activeDot={{ r: 3, fill: c.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </EchoCard>
          ))}
        </div>
      </section>

      {/* PADRÕES */}
      <section className="mb-6">
        <EchoCard>
          <div className="mb-3 flex items-center gap-2">
            <span className="echo-brush text-lg leading-none text-[var(--gold)]">相</span>
            <h3 className="echo-display text-base font-semibold">Seus padrões</h3>
          </div>

          {patterns.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Padrões
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patterns.map((p) => (
                  <EchoChip key={p} tone="gold">
                    {p}
                  </EchoChip>
                ))}
              </div>
            </div>
          )}

          {strengths.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Forças
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((s) => (
                  <EchoChip key={s} tone="jade">
                    {s}
                  </EchoChip>
                ))}
              </div>
            </div>
          )}

          {challenges.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Desafios
              </div>
              <div className="flex flex-wrap gap-1.5">
                {challenges.map((c) => (
                  <EchoChip key={c} tone="vermillion">
                    {c}
                  </EchoChip>
                ))}
              </div>
            </div>
          )}

          {patterns.length === 0 &&
            strengths.length === 0 &&
            challenges.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Sem padrões registrados ainda. Converse e escreva mais no diário.
              </p>
            )}
        </EchoCard>
      </section>

      {/* LINHA DO TEMPO */}
      <section>
        <EchoCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="echo-brush text-lg leading-none text-[var(--copper)]">時</span>
              <h3 className="echo-display text-base font-semibold">Linha do tempo</h3>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              90 dias
            </span>
          </div>
          <div
            className="echo-no-scrollbar flex items-end gap-[2px] overflow-x-auto"
            style={{ height: 64 }}
          >
            {timeline.map((d) => {
              const h = d.mood ? 14 + d.mood * 10 : 4;
              const color = d.mood
                ? MOOD_COLOR[d.mood - 1]
                : "rgba(255,255,255,0.06)";
              return (
                <div
                  key={d.key}
                  title={
                    d.mood
                      ? `${format(d.date, "d 'de' MMM 'de' yyyy", { locale: ptBR })} · humor ${d.mood}/5`
                      : `${format(d.date, "d 'de' MMM 'de' yyyy", { locale: ptBR })} · sem registro`
                  }
                  className="origin-bottom shrink-0 rounded-sm transition-transform hover:scale-y-110"
                  style={{
                    width: 4,
                    height: h,
                    background: color,
                    boxShadow: d.mood ? `0 0 4px ${color}66` : undefined,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
            <span>
              {format(subDays(new Date(), 89), "d MMM", { locale: ptBR })}
            </span>
            <span>hoje</span>
          </div>
        </EchoCard>
      </section>
    </div>
  );
}

export default InsightsScreen;
