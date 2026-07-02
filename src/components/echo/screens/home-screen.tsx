"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Moon,
  Sun,
  CloudSun,
  Crown,
  Settings as SettingsIcon,
  BookOpenText,
} from "lucide-react";
import { EchoCard, EchoCardHeader } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { EchoChip } from "../ui/echo-chip";
import { SealStamp } from "../ui/seal-stamp";
import { MoodPicker } from "../ui/mood-picker";
import { useEcho, daysSince } from "@/lib/echo/store";
import type { ScreenTab } from "@/lib/echo/store";

const ECHO_PHRASES = [
  "O guerreiro que conhece a própria sombra não tropeça nela.",
  "Até o bambu mais alto já foi só um broto teimoso.",
  "Você não precisa ter razão. Precisa se ouvir.",
  "Calma não é ausência de tempestade. É onde você fica de pé dentro dela.",
  "O coração tem memória. Hoje, deixa ele falar.",
  "Quem cultiva o interior colhe o que ninguém vê — e sente o que ninguém mede.",
  "Você está mais inteiro do que ontem. Mesmo que não pareça.",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Madrugada pesada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  if (h < 22) return "Boa noite";
  return "Tarde da noite";
}

function GreetingIcon({ className }: { className?: string }) {
  const h = new Date().getHours();
  if (h < 5 || h >= 22) return <Moon className={className} />;
  if (h < 12) return <Sun className={className} />;
  if (h < 18) return <CloudSun className={className} />;
  return <Moon className={className} />;
}

export function HomeScreen() {
  const profile = useEcho((s) => s.profile);
  const diary = useEcho((s) => s.diary);
  const insights = useEcho((s) => s.insights);
  const goals = useEcho((s) => s.goals);
  const lastVisit = useEcho((s) => s.lastVisit);
  const setTab = useEcho((s) => s.setTab);
  const setOverlay = useEcho((s) => s.setOverlay);
  const setDiary = useEcho((s) => s.setDiary);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = diary[today];
  const daysAway = daysSince(lastVisit);

  const phrase = useMemo(() => {
    const idx = new Date().getDate() % ECHO_PHRASES.length;
    return ECHO_PHRASES[idx];
  }, []);

  const todaysInsight = insights.find((i) => !i.dismissed);
  const activeGoal = goals.find((g) => g.status === "ativa");

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5 flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GreetingIcon className="h-4 w-4 text-[var(--gold)]" />
            <span className="text-xs uppercase tracking-widest">{greeting()}</span>
          </div>
          <h1 className="echo-display mt-1 text-3xl font-semibold leading-tight">
            {profile.name ? profile.name : "viajante"}
            <span className="echo-brush ml-2 text-2xl text-[var(--jade)]">心</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Como você está hoje?</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOverlay("premium")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)] transition hover:bg-[var(--gold)]/20"
            aria-label="Premium"
          >
            <Crown className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOverlay("settings")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground"
            aria-label="Configurações"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* away notice */}
      {daysAway >= 2 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4"
        >
          <EchoCard glass className="flex items-center gap-3 border-[var(--copper)]/20 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-[var(--copper)]" />
            <p className="text-sm text-muted-foreground">
              {daysAway >= 7
                ? `Faz ${daysAway} dias. Senti sua falta. Bora?`
                : `Você anda sumido${daysAway === 1 ? "" : ` há ${daysAway} dias`}. Tudo bem?`}
            </p>
          </EchoCard>
        </motion.div>
      )}

      {/* mood check-in */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <EchoCard filigree glow="jade">
          <EchoCardHeader
            title="Check-in de hoje"
            subtitle={todayEntry ? "Você já registrou. Pode mudar se quiser." : "Toque no que mais combina com agora."}
            icon={<Sparkles className="h-4 w-4" />}
            accent="jade"
          />
          <MoodPicker
            value={todayEntry?.mood}
            onChange={(v) => setDiary(today, { mood: v })}
          />
          {todayEntry?.note && (
            <p className="mt-3 rounded-xl bg-white/[0.03] p-3 text-xs italic text-muted-foreground">
              "{todayEntry.note}"
            </p>
          )}
        </EchoCard>
      </motion.div>

      {/* quick chat */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4"
      >
        <EchoCard
          glass
          glow="gold"
          className="cursor-pointer overflow-hidden"
          onClick={() => setTab("chat")}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)]/25 to-[var(--copper)]/15">
              <SealStamp char="話" size={40} rotate={-4} />
            </div>
            <div className="flex-1">
              <p className="echo-display text-base font-medium text-foreground">
                Conversar com o ECHO
              </p>
              <p className="mt-0.5 text-xs italic leading-relaxed text-muted-foreground">
                "{phrase}"
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </EchoCard>
      </motion.div>

      {/* insight of the day */}
      {todaysInsight && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <EchoCard>
            <EchoCardHeader
              title="Insight do dia"
              subtitle="O ECHO esteve observando"
              icon={<TrendingUp className="h-4 w-4" />}
              accent="mist"
              right={
                <EchoChip tone="mist">
                  {todaysInsight.type === "win" ? "vitória" : todaysInsight.type === "pattern" ? "padrão" : todaysInsight.type}
                </EchoChip>
              }
            />
            <p className="echo-display text-[15px] leading-relaxed text-foreground">
              {todaysInsight.content}
            </p>
            <div className="mt-3 flex gap-2">
              <EchoButton variant="ghost" size="sm" onClick={() => setTab("insights")}>
                Ver todos
              </EchoButton>
            </div>
          </EchoCard>
        </motion.div>
      )}

      {/* current goal */}
      {activeGoal && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <EchoCard glow="copper">
            <EchoCardHeader
              title="Meta atual"
              subtitle={activeGoal.targetDate ? `até ${new Date(activeGoal.targetDate+"T00:00").toLocaleDateString("pt-BR")}` : undefined}
              icon={<Target className="h-4 w-4" />}
              accent="copper"
              right={
                <button onClick={() => setOverlay("goals")} className="text-xs text-muted-foreground hover:text-foreground">
                  editar
                </button>
              }
            />
            <p className="echo-display text-base font-medium">{activeGoal.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{activeGoal.description}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-[var(--copper)]">{activeGoal.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeGoal.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--copper)] to-[var(--gold)]"
                />
              </div>
            </div>
          </EchoCard>
        </motion.div>
      )}

      {/* secondary actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        <EchoCard glass className="cursor-pointer p-4" onClick={() => setTab("diary" as ScreenTab)}>
          <BookOpenText className="h-5 w-5 text-[var(--copper)]" />
          <p className="echo-display mt-2 text-sm font-medium">Diário</p>
          <p className="text-[11px] text-muted-foreground">{Object.keys(diary).length} registros</p>
        </EchoCard>
        <EchoCard glass className="cursor-pointer p-4" onClick={() => setOverlay("guide")}>
          <Sparkles className="h-5 w-5 text-[var(--gold)]" />
          <p className="echo-display mt-2 text-sm font-medium">Publicar</p>
          <p className="text-[11px]] text-muted-foreground">GitHub · APK</p>
        </EchoCard>
      </motion.div>

      {/* footer seal */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <SealStamp char="心" size={36} rotate={-3} />
        <p className="echo-brush text-xs text-muted-foreground/60">修心 — cultivar o coração</p>
      </div>
    </div>
  );
}

export default HomeScreen;
