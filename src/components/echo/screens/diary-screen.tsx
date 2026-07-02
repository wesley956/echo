"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useEcho } from "@/lib/echo/store";
import { EchoCard } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { EchoChip } from "../ui/echo-chip";
import { MoodPicker, MOODS } from "../ui/mood-picker";
import { SealStamp } from "../ui/seal-stamp";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const dateKey = (d: Date) => format(d, "yyyy-MM-dd");
const moodMeta = (v?: number) => MOODS.find((m) => m.value === v);

const DIMENSIONS = [
  { key: "anxiety", label: "Ansiedade", zh: "虑", hex: "#C84B3F" },
  { key: "energy", label: "Energia", zh: "氣", hex: "#D4B062" },
  { key: "sleep", label: "Sono", zh: "息", hex: "#5B7BA6" },
  { key: "stress", label: "Estresse", zh: "緊", hex: "#C8895A" },
  { key: "motivation", label: "Motivação", zh: "志", hex: "#4A9D7C" },
] as const;

type DimKey = (typeof DIMENSIONS)[number]["key"];

interface DayFormState {
  mood: number;
  anxiety: number;
  energy: number;
  sleep: number;
  stress: number;
  motivation: number;
  note: string;
}

const emptyForm: DayFormState = {
  mood: 3,
  anxiety: 5,
  energy: 5,
  sleep: 5,
  stress: 5,
  motivation: 5,
  note: "",
};

export function DiaryScreen() {
  const diary = useEcho((s) => s.diary);
  const setDiary = useEcho((s) => s.setDiary);

  const [weekAnchor, setWeekAnchor] = useState<Date>(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>(dateKey(new Date()));
  const [form, setForm] = useState<DayFormState>(emptyForm);

  const weekStart = useMemo(
    () => startOfWeek(weekAnchor, { weekStartsOn: 0 }),
    [weekAnchor]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekEnd = weekDays[6];

  // 14-day chart series (today minus 13 days)
  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(today, 13 - i);
      const key = dateKey(d);
      const entry = diary[key];
      return {
        key,
        short: format(d, "dd"),
        label: format(d, "dd/MM"),
        mood: entry ? entry.mood : null,
      };
    });
  }, [diary]);

  const recentEntries = useMemo(
    () =>
      Object.values(diary).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30),
    [diary]
  );

  const openDay = (key: string) => {
    const existing = diary[key];
    setSelectedKey(key);
    setForm(
      existing
        ? {
            mood: existing.mood,
            anxiety: existing.anxiety,
            energy: existing.energy,
            sleep: existing.sleep,
            stress: existing.stress,
            motivation: existing.motivation,
            note: existing.note ?? "",
          }
        : emptyForm
    );
    setSheetOpen(true);
  };

  const save = () => {
    setDiary(selectedKey, { ...form });
    setSheetOpen(false);
  };

  const selectedDate = parseISO(selectedKey);
  const mood = moodMeta(form.mood);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
      {/* HEADER */}
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="echo-brush text-3xl leading-none text-[var(--vermillion)]">
                日
              </span>
              <h1 className="echo-display text-3xl font-semibold leading-none text-foreground">
                Diário Emocional
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              O cultivador observa o próprio clima interior.
            </p>
          </div>
          <SealStamp char="記" size={44} rotate={-4} />
        </div>

        {/* Week navigator */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-1.5">
          <EchoButton
            variant="ghost"
            size="icon"
            onClick={() => setWeekAnchor((w) => subDays(w, 7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </EchoButton>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Semana
            </div>
            <div className="echo-display text-sm font-medium text-foreground">
              {format(weekStart, "d", { locale: ptBR })}–
              {format(weekEnd, "d 'de' MMM", { locale: ptBR })}
            </div>
          </div>
          <EchoButton
            variant="ghost"
            size="icon"
            onClick={() => setWeekAnchor((w) => addDays(w, 7))}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </EchoButton>
        </div>
      </header>

      {/* MINI CALENDÁRIO DA SEMANA */}
      <div className="mb-6 grid grid-cols-7 gap-1.5">
        {weekDays.map((d) => {
          const key = dateKey(d);
          const entry = diary[key];
          const meta = entry ? moodMeta(entry.mood) : undefined;
          const isToday = isSameDay(d, new Date());
          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => openDay(key)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-2 transition-colors",
                isToday
                  ? "border-[var(--gold)]/40 bg-[var(--gold)]/8"
                  : "border-white/8 bg-white/[0.02] hover:bg-white/5"
              )}
            >
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {format(d, "EEEEE", { locale: ptBR })}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isToday ? "text-[var(--gold)]" : "text-foreground"
                )}
              >
                {format(d, "d")}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: meta?.color ?? "transparent",
                  boxShadow: meta ? `0 0 6px ${meta.color}80` : undefined,
                }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* GRÁFICO 14 DIAS */}
      <EchoCard className="mb-6" glow="jade">
        <div className="mb-3 flex items-center gap-2">
          <span className="echo-brush text-xl leading-none text-[var(--jade)]">心</span>
          <div>
            <h3 className="echo-display text-base font-semibold leading-tight">
              Humor · últimos 14 dias
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Cada ponto é um dia registrado. Buracos são dias em silêncio.
            </p>
          </div>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, bottom: 0, left: -22 }}
            >
              <defs>
                <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A9D7C" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#4A9D7C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="short"
                tick={{ fill: "#9A9AB0", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: "#9A9AB0", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ stroke: "rgba(74,157,124,0.4)", strokeWidth: 1 }}
                contentStyle={{
                  background: "#12121E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#9A9AB0" }}
                formatter={(v: number) => [`${v}/5`, "Humor"]}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#4A9D7C"
                strokeWidth={2}
                connectNulls
                fill="url(#moodFill)"
                dot={{ r: 2.5, fill: "#4A9D7C", strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "#D4B062" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </EchoCard>

      {/* ENTRADAS RECENTES */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="echo-brush text-xl leading-none text-[var(--copper)]">筆</span>
          <h3 className="echo-display text-lg font-semibold">Entradas recentes</h3>
        </div>
        {recentEntries.length === 0 ? (
          <EchoCard className="text-center text-sm text-muted-foreground">
            Ainda não há registros. Toque num dia acima para começar.
          </EchoCard>
        ) : (
          <div className="echo-no-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
            {recentEntries.map((entry) => {
              const meta = moodMeta(entry.mood);
              const d = parseISO(entry.date);
              return (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <EchoCard className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta?.emoji ?? "·"}</span>
                        <div>
                          <div className="echo-display text-sm font-medium capitalize text-foreground">
                            {format(d, "EEEE, d 'de' MMMM", { locale: ptBR })}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            {meta?.label ?? "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {entry.note && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <EchoChip tone="vermillion">Ansiedade · {entry.anxiety}</EchoChip>
                      <EchoChip tone="gold">Energia · {entry.energy}</EchoChip>
                      <EchoChip tone="mist">Sono · {entry.sleep}</EchoChip>
                    </div>
                  </EchoCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM SHEET EDITOR */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="echo-no-scrollbar mx-auto max-h-[88vh] max-w-md overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0E0E18] p-0"
        >
          <SheetHeader className="px-5 pt-5">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div>
                <SheetTitle className="echo-display text-xl font-semibold capitalize">
                  Como foi {format(selectedDate, "EEEE", { locale: ptBR })}?
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </SheetDescription>
              </div>
              <span className="text-2xl">{mood?.emoji ?? "·"}</span>
            </div>
          </SheetHeader>

          <div className="space-y-5 px-5 pb-8 pt-2">
            {/* Mood picker */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="echo-brush text-base leading-none text-[var(--vermillion)]">情</span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Humor
                </span>
              </div>
              <MoodPicker
                value={form.mood}
                onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
              />
            </div>

            {/* Sliders */}
            <div className="space-y-3.5">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="echo-brush text-sm leading-none"
                        style={{ color: dim.hex }}
                      >
                        {dim.zh}
                      </span>
                      <span className="text-xs font-medium text-foreground">{dim.label}</span>
                    </div>
                    <span
                      className="min-w-8 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums"
                      style={{
                        color: dim.hex,
                        background: `${dim.hex}1f`,
                        border: `1px solid ${dim.hex}40`,
                      }}
                    >
                      {form[dim.key]}
                    </span>
                  </div>
                  <Slider
                    value={[form[dim.key]]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, [dim.key]: v[0] }))
                    }
                    style={{ ["--dim" as string]: dim.hex } as React.CSSProperties}
                    className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[var(--dim)] [&_[data-slot=slider-thumb]]:border-[var(--dim)]"
                  />
                </div>
              ))}
            </div>

            {/* Note */}
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="echo-brush text-base leading-none text-[var(--gold)]">記</span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  O que aconteceu hoje?
                </span>
              </div>
              <Textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Escreva o que vier. Sem juízo, sem edição."
                className="min-h-24 rounded-2xl border-white/10 bg-white/[0.04] text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:border-[var(--gold)]/40"
              />
            </div>

            <EchoButton variant="jade" size="lg" className="w-full" onClick={save}>
              Salvar registro
            </EchoButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default DiaryScreen;
