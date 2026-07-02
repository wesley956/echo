"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Sparkles,
  Check,
  Pause,
  Play,
  Trash2,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEcho, type Goal } from "@/lib/echo/store";
import { EchoCard } from "@/components/echo/ui/echo-card";
import { EchoButton } from "@/components/echo/ui/echo-button";
import { EchoChip } from "@/components/echo/ui/echo-chip";
import { SealStamp } from "@/components/echo/ui/seal-stamp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SuggestedGoal {
  title: string;
  description: string;
  targetDate?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function GoalsScreen() {
  const profile = useEcho((s) => s.profile);
  const goals = useEcho((s) => s.goals);
  const patterns = useEcho((s) => s.patterns);
  const challenges = useEcho((s) => s.challenges);
  const strengths = useEcho((s) => s.strengths);
  const addGoal = useEcho((s) => s.addGoal);
  const updateGoal = useEcho((s) => s.updateGoal);
  const deleteGoal = useEcho((s) => s.deleteGoal);
  const { toast } = useToast();

  const [newOpen, setNewOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState<SuggestedGoal[]>([]);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetDate("");
  };

  const saveNew = () => {
    if (!title.trim()) {
      toast({ title: "Dá um nome pra meta primeiro." });
      return;
    }
    addGoal({
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate || undefined,
    });
    toast({
      title: "Meta plantada.",
      description: "O cultivador cumpre o que promete a si.",
    });
    resetForm();
    setNewOpen(false);
  };

  const suggest = async () => {
    setSuggestOpen(true);
    setLoading(true);
    setSuggested([]);
    setAdded(new Set());
    try {
      const res = await fetch("/api/echo/goals-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: profile.name || "viajante",
          patterns,
          challenges,
          strengths,
        }),
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as { goals?: SuggestedGoal[] };
      setSuggested(data.goals ?? []);
      if (!data.goals || data.goals.length === 0) {
        toast({
          title: "Sem sugestões dessa vez",
          description: "Tenta de novo em seguida.",
        });
      }
    } catch {
      toast({
        title: "Não consegui sugerir agora",
        description: "O ECHO volta a tentar quando você quiser.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSuggested = (g: SuggestedGoal, i: number) => {
    addGoal({
      title: g.title,
      description: g.description,
      targetDate: g.targetDate,
    });
    setAdded((prev) => new Set([...prev, i]));
    toast({ title: "Meta adicionada", description: g.title });
  };

  const bump = (g: Goal) => {
    const next = Math.min(100, g.progress + 10);
    updateGoal(g.id, {
      progress: next,
      status: next >= 100 ? "concluida" : g.status,
    });
    if (next >= 100) {
      toast({
        title: "Concluída.",
        description: "Voto cumprido. Guarda isso pra depois.",
      });
    }
  };

  const complete = (g: Goal) => {
    updateGoal(g.id, { status: "concluida", progress: 100 });
    toast({ title: "Marcada como concluída." });
  };

  const togglePause = (g: Goal) => {
    if (g.status === "pausada") {
      updateGoal(g.id, { status: "ativa" });
      toast({ title: "Meta retomada." });
    } else {
      updateGoal(g.id, { status: "pausada" });
      toast({ title: "Meta pausada." });
    }
  };

  const remove = (g: Goal) => {
    deleteGoal(g.id);
    toast({ title: "Meta removida." });
  };

  const ativas = goals.filter((g) => g.status === "ativa");
  const pausadas = goals.filter((g) => g.status === "pausada");
  const concluidas = goals.filter((g) => g.status === "concluida");
  const isEmpty = goals.length === 0;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pb-28 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative"
      >
        <div className="absolute right-0 top-0 opacity-90">
          <SealStamp char="願" size={44} rotate={-3} />
        </div>
        <h1 className="echo-display text-3xl font-semibold text-foreground">
          Metas
        </h1>
        <p className="mt-1 max-w-[80%] text-sm text-muted-foreground">
          Pequenos votos. O cultivador cumpre o que promete a si.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="flex gap-2"
      >
        <EchoButton
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={suggest}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Sugerir com IA
        </EchoButton>
        <EchoButton
          variant="jade"
          size="sm"
          className="gap-1.5"
          onClick={() => setNewOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Nova meta
        </EchoButton>
      </motion.div>

      {/* Empty state */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        >
          <EchoCard
            glass
            className="flex flex-col items-center gap-4 py-10 text-center"
          >
            <SealStamp char="空" size={64} rotate={-3} />
            <div>
              <p className="echo-display text-lg text-foreground">
                Sem metas ainda.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Que tal deixar o ECHO sugerir as primeiras?
              </p>
            </div>
            <EchoButton
              variant="gold"
              size="md"
              className="gap-2"
              onClick={suggest}
            >
              <Sparkles className="h-4 w-4" />
              Sugerir com IA
            </EchoButton>
          </EchoCard>
        </motion.div>
      )}

      {/* Ativas + Pausadas */}
      {[...ativas, ...pausadas].map((g, i) => (
        <GoalCard
          key={g.id}
          goal={g}
          index={i}
          onBump={() => bump(g)}
          onComplete={() => complete(g)}
          onTogglePause={() => togglePause(g)}
          onDelete={() => remove(g)}
        />
      ))}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="echo-display px-1 text-sm text-muted-foreground">
            Concluídas
          </p>
          {concluidas.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.04 * i }}
            >
              <EchoCard className="opacity-70">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--jade)]/15">
                    <Check className="h-4 w-4 text-[var(--jade)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="echo-display truncate text-base text-foreground line-through decoration-[var(--jade)]/40">
                      {g.title}
                    </p>
                    {g.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {g.description}
                      </p>
                    )}
                  </div>
                  <EchoChip tone="jade">feito</EchoChip>
                </div>
              </EchoCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* New goal dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="echo-display text-xl">
              Nova meta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-title" className="text-xs text-muted-foreground">
                Título
              </Label>
              <Input
                id="g-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Escrever no diário 5 dias seguidos"
                className="h-11 rounded-xl border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-desc" className="text-xs text-muted-foreground">
                Descrição
              </Label>
              <Textarea
                id="g-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uma frase curta. Por que isso importa pra você?"
                className="min-h-[80px] resize-none rounded-xl border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-date" className="text-xs text-muted-foreground">
                Data alvo (opcional)
              </Label>
              <Input
                id="g-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-white/5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <EchoButton
              variant="ghost"
              size="md"
              onClick={() => setNewOpen(false)}
            >
              Cancelar
            </EchoButton>
            <EchoButton variant="jade" size="md" onClick={saveNew}>
              Plantar meta
            </EchoButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggest dialog */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-md border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="echo-display text-xl">
              Metas sugeridas
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
              <p className="text-sm text-muted-foreground">
                O ECHO está olhando seu caminho...
              </p>
            </div>
          ) : suggested.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não veio nada dessa vez. Tenta de novo?
              </p>
              <EchoButton
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={suggest}
              >
                Tentar de novo
              </EchoButton>
            </div>
          ) : (
            <div className="space-y-3">
              {suggested.map((g, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <p className="echo-display text-base text-foreground">
                    {g.title}
                  </p>
                  {g.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {g.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {g.targetDate ? (
                      <span className="text-[11px] text-muted-foreground">
                        até{" "}
                        {format(parseISO(g.targetDate), "d 'de' MMM", {
                          locale: ptBR,
                        })}
                      </span>
                    ) : (
                      <span />
                    )}
                    <EchoButton
                      variant={added.has(i) ? "ghost" : "jade"}
                      size="sm"
                      disabled={added.has(i)}
                      onClick={() => addSuggested(g, i)}
                      className="gap-1.5"
                    >
                      {added.has(i) ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Adicionada
                        </>
                      ) : (
                        "Adicionar"
                      )}
                    </EchoButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalCard({
  goal,
  index,
  onBump,
  onComplete,
  onTogglePause,
  onDelete,
}: {
  goal: Goal;
  index: number;
  onBump: () => void;
  onComplete: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
}) {
  const paused = goal.status === "pausada";
  let daysLeft: number | null = null;
  let dateLabel = "";
  if (goal.targetDate) {
    try {
      const d = parseISO(goal.targetDate);
      daysLeft = differenceInDays(d, new Date());
      dateLabel = format(d, "d 'de' MMM", { locale: ptBR });
    } catch {
      daysLeft = null;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.05 * index }}
    >
      <EchoCard glow="copper" className={paused ? "opacity-60" : ""}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="echo-display text-lg font-semibold leading-tight text-foreground">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.description}
              </p>
            )}
          </div>
          <EchoChip tone={paused ? "mist" : "copper"}>
            {paused ? "pausada" : "ativa"}
          </EchoChip>
        </div>

        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progresso</span>
          <span className="text-[var(--gold)]">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-1.5 bg-white/5" />

        {goal.targetDate && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-[var(--copper)]" />
            <span>{dateLabel}</span>
            {daysLeft !== null && (
              <EchoChip
                tone={
                  daysLeft < 0
                    ? "vermillion"
                    : daysLeft <= 2
                      ? "gold"
                      : "mist"
                }
              >
                {daysLeft < 0
                  ? "vencida"
                  : daysLeft === 0
                    ? "hoje"
                    : `${daysLeft}d restantes`}
              </EchoChip>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1">
          <EchoButton
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onBump}
            disabled={goal.progress >= 100}
          >
            <Plus className="h-3.5 w-3.5" /> +10%
          </EchoButton>
          <EchoButton
            variant="ghost"
            size="icon"
            onClick={onComplete}
            aria-label="Concluir"
          >
            <Check className="h-4 w-4 text-[var(--jade)]" />
          </EchoButton>
          <EchoButton
            variant="ghost"
            size="icon"
            onClick={onTogglePause}
            aria-label={paused ? "Retomar" : "Pausar"}
          >
            {paused ? (
              <Play className="h-4 w-4 text-[var(--gold)]" />
            ) : (
              <Pause className="h-4 w-4 text-[var(--mist)]" />
            )}
          </EchoButton>
          <EchoButton
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Excluir"
          >
            <Trash2 className="h-4 w-4 text-[var(--vermillion)]" />
          </EchoButton>
        </div>
      </EchoCard>
    </motion.div>
  );
}

export default GoalsScreen;
