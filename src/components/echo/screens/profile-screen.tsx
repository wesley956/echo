"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Mountain,
  MessageCircle,
  BookOpen,
  Calendar,
  Download,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  useEcho,
  daysSince,
  type UserProfile,
  type DiaryEntry,
} from "@/lib/echo/store";
import { EchoCard, EchoCardHeader } from "@/components/echo/ui/echo-card";
import { EchoButton } from "@/components/echo/ui/echo-button";
import { EchoChip } from "@/components/echo/ui/echo-chip";
import { SealStamp } from "@/components/echo/ui/seal-stamp";
import { useToast } from "@/hooks/use-toast";

/* ---- helpers (stable per-name hashing) ---- */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function strengthValue(name: string): number {
  return 60 + (hashStr(name) % 36); // 60-95
}

function challengeFrequency(name: string): {
  label: string;
  tone: "vermillion" | "copper" | "mist";
} {
  const v = hashStr(name) % 3;
  if (v === 0) return { label: "frequente", tone: "vermillion" };
  if (v === 1) return { label: "às vezes", tone: "copper" };
  return { label: "raro", tone: "mist" };
}

function buildRadarData(
  profile: UserProfile,
  diary: Record<string, DiaryEntry>,
) {
  const entries = Object.values(diary);
  const avg = (sel: (e: DiaryEntry) => number) =>
    entries.length
      ? entries.reduce((a, e) => a + sel(e), 0) / entries.length
      : 0;

  const saude = entries.length
    ? Math.round(((avg((e) => e.sleep) + avg((e) => e.energy)) / 2) * 10)
    : 50 + (hashStr("saude-" + profile.name) % 30);
  const autoestima = entries.length
    ? Math.round(avg((e) => e.mood) * 20)
    : 50 + (hashStr("autoestima-" + profile.name) % 30);

  const hashScore = (seed: string) => 45 + (hashStr(seed + profile.name) % 40);

  return [
    { dim: "Relacionamentos", v: hashScore("rel") },
    { dim: "Família", v: hashScore("fam") },
    { dim: "Carreira", v: hashScore("carreira") },
    { dim: "Saúde", v: Math.min(100, Math.max(0, saude)) },
    { dim: "Autoestima", v: Math.min(100, Math.max(0, autoestima)) },
    { dim: "Espiritualidade", v: hashScore("esp") },
  ];
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProfileScreen() {
  const profile = useEcho((s) => s.profile);
  const strengths = useEcho((s) => s.strengths);
  const challenges = useEcho((s) => s.challenges);
  const conversations = useEcho((s) => s.conversations);
  const diary = useEcho((s) => s.diary);
  const setOverlay = useEcho((s) => s.setOverlay);
  const { toast } = useToast();

  const dias = daysSince(profile.createdAt);
  const firstName = (profile.name || "viajante").split(" ")[0];
  const initial = (firstName[0] || "E").toUpperCase();
  const radarData = buildRadarData(profile, diary);

  const onExport = () => {
    if (!profile.premium) {
      setOverlay("premium");
      toast({
        title: "Recurso Premium",
        description:
          "O relatório completo é pra quem escolhe cultivar com fôlego maior.",
      });
      return;
    }
    toast({
      title: "Relatório gerado (demo)",
      description: "Pronto pra ler com calma, num momento tranquilo.",
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <EchoCard filigree glow="gold" className="overflow-hidden">
          <div className="absolute right-3 top-3 opacity-90">
            <SealStamp char="我" size={40} rotate={-4} />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-[var(--jade)] to-[var(--copper)] p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
                <span className="echo-display text-3xl font-semibold text-foreground">
                  {initial}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="echo-display truncate text-2xl font-semibold text-foreground">
                  {firstName}
                </h2>
                {profile.premium && (
                  <EchoChip tone="gold" active>
                    ✦ Premium
                  </EchoChip>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cultivando há {dias} {dias === 1 ? "dia" : "dias"}
              </p>
            </div>
          </div>
        </EchoCard>
      </motion.div>

      {/* Fortalezas */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
      >
        <EchoCard glow="jade">
          <EchoCardHeader
            title="Fortalezas"
            subtitle="O que a tempestade ainda não levou"
            accent="jade"
            icon={<span className="echo-brush text-lg">力</span>}
          />
          <div className="space-y-3">
            {strengths.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Ainda observando o que floresce em você.
              </p>
            )}
            {strengths.map((s) => {
              const v = strengthValue(s);
              return (
                <div key={s} className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-[var(--jade)]" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-foreground">
                        {s}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {v}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[var(--jade)]"
                        style={{ width: `${v}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </EchoCard>
      </motion.div>

      {/* Desafios */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
      >
        <EchoCard glow="vermillion">
          <EchoCardHeader
            title="Desafios"
            subtitle="Onde o caminho aperta"
            accent="vermillion"
            icon={<span className="echo-brush text-lg">難</span>}
          />
          <div className="space-y-2.5">
            {challenges.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nada em destaque por enquanto.
              </p>
            )}
            {challenges.map((c) => {
              const f = challengeFrequency(c);
              return (
                <div key={c} className="flex items-center gap-3">
                  <Mountain className="h-4 w-4 shrink-0 text-[var(--vermillion)]" />
                  <span className="flex-1 text-sm text-foreground">{c}</span>
                  <EchoChip tone={f.tone}>{f.label}</EchoChip>
                </div>
              );
            })}
          </div>
        </EchoCard>
      </motion.div>

      {/* Radar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
      >
        <EchoCard>
          <EchoCardHeader
            title="Seu escudo interior"
            subtitle="Seis frentes do cultivador"
            accent="gold"
            icon={<span className="echo-brush text-lg">盾</span>}
          />
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(244,241,234,0.10)" />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="v"
                  stroke="var(--jade)"
                  fill="var(--jade)"
                  fillOpacity={0.32}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </EchoCard>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatCard
          icon={<MessageCircle className="h-4 w-4" />}
          value={conversations.length}
          label="Conversas"
          tone="jade"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          value={Object.keys(diary).length}
          label="Diário"
          tone="copper"
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          value={dias}
          label="Dias"
          tone="gold"
        />
      </motion.div>

      {/* Export */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
      >
        <EchoButton
          variant="gold"
          size="lg"
          className="w-full gap-2"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          Exportar relatório
        </EchoButton>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: "jade" | "copper" | "gold";
}) {
  const toneCls = {
    jade: "text-[var(--jade)]",
    copper: "text-[var(--copper)]",
    gold: "text-[var(--gold)]",
  };
  return (
    <EchoCard className="flex flex-col items-center gap-1 p-3 text-center">
      <div className={toneCls[tone]}>{icon}</div>
      <div className="echo-display text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </EchoCard>
  );
}

export default ProfileScreen;
