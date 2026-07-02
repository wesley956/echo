"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Shield, Sparkles } from "lucide-react";
import { EchoButton } from "../ui/echo-button";
import { SealStamp } from "../ui/seal-stamp";
import { ModeSelector } from "../ui/mode-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEcho } from "@/lib/echo/store";
import type { EchoMode } from "@/lib/echo/prompts";

const SLIDES = [
  {
    zh: "心",
    title: "Sua consciência quando você não consegue ouvir a si mesmo",
    body: "O ECHO é o eco que volta. A voz que te espera quando o silêncio dentro fica alto demais. Não é um robô. É uma presença.",
    tone: "jade" as const,
  },
  {
    zh: "道",
    title: "O caminho do coração se faz andando",
    body: "Converse quando precisar. Anote no diário emocional. Deixe a IA enxergar padrões que você, no meio da tempestade, não consegue ver. Pequenos passos. Cultivo diário.",
    tone: "gold" as const,
  },
  {
    zh: "三",
    title: "Três modos. Uma só escuta.",
    body: "Apoio quando você só precisa de presença. Equilíbrio quando precisa de verdade com cuidado. Confronto quando está se enganando e alguém precisa te dizer. Você escolhe.",
    tone: "vermillion" as const,
  },
  {
    zh: "密",
    title: "O que é seu, fica seu",
    body: "Tudo fica no seu aparelho. Nada é compartilhado. Você pode apagar tudo num toque. O ECHO te conhece — mas só porque você permite.",
    tone: "mist" as const,
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<EchoMode>("equilibrio");
  const [name, setName] = useState("");
  const setProfile = useEcho((s) => s.setProfile);
  const setModeStore = useEcho((s) => s.setMode);

  const isLast = step === SLIDES.length;

  const finish = () => {
    setProfile({ name: name.trim() || "viajante" });
    setModeStore(mode);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col echo-ink-bg">
      <div className="flex flex-1 flex-col overflow-y-auto echo-no-scrollbar">
        {/* progress dots */}
        <div className="flex justify-center gap-2 pt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? "w-8 bg-[var(--gold)]" : "w-2 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <AnimatePresence mode="wait">
            {!isLast ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-w-md flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                  className="mb-8"
                >
                  <SealStamp char={SLIDES[step].zh} size={88} rotate={-3} />
                </motion.div>
                <h1 className="echo-display mb-4 text-3xl font-semibold leading-tight text-foreground">
                  {SLIDES[step].title}
                </h1>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {SLIDES[step].body}
                </p>

                {step === 2 && (
                  <div className="mt-8 w-full">
                    <ModeSelector value={mode} onChange={setMode} showTagline />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="last"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full max-w-md flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--jade)]/15 echo-glow-jade"
                >
                  <Sparkles className="h-9 w-9 text-[var(--jade)]" />
                </motion.div>
                <h1 className="echo-display mb-2 text-3xl font-semibold">Como te chamamos?</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                  O ECHO vai usar seu nome pra te encontrar de verdade.
                </p>
                <div className="w-full space-y-2 text-left">
                  <Label htmlFor="name" className="text-xs text-muted-foreground">
                    Seu nome
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Marina, Júlio, ou só um apelido"
                    className="h-12 rounded-2xl border-white/10 bg-white/5 text-base"
                    onKeyDown={(e) => e.key === "Enter" && finish()}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 pb-8 echo-safe-bottom">
          {step > 0 && !isLast && (
            <EchoButton variant="ghost" size="md" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </EchoButton>
          )}
          <div className="ml-auto flex items-center gap-2">
            {!isLast && step < 3 && (
              <EchoButton variant="ghost" size="md" onClick={() => setStep(4)}>
                Pular
              </EchoButton>
            )}
            {!isLast ? (
              <EchoButton
                variant="gold"
                size="lg"
                onClick={() => setStep((s) => s + 1)}
                className="gap-2"
              >
                {step === 2 ? "Esse modo me serve" : "Continuar"}
                <ArrowRight className="h-4 w-4" />
              </EchoButton>
            ) : (
              <EchoButton variant="jade" size="lg" onClick={finish} className="gap-2">
                <Check className="h-4 w-4" />
                Começar meu caminho
              </EchoButton>
            )}
          </div>
        </div>
      </div>

      {/* privacy footer */}
      <div className="flex items-center justify-center gap-1.5 pb-4 text-[11px] text-muted-foreground/70">
        <Shield className="h-3 w-3" />
        Seus dados ficam no seu aparelho. Você manda.
      </div>
    </div>
  );
}
