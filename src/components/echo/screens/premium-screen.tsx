"use client";

import { motion } from "framer-motion";
import {
  X,
  Crown,
  MessagesSquare,
  BarChart3,
  FileDown,
  Mic,
  BrainCircuit,
  Check,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useEcho } from "@/lib/echo/store";
import { useToast } from "@/hooks/use-toast";
import { EchoCard } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { SealStamp } from "../ui/seal-stamp";

const BENEFITS: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: string;
}[] = [
  {
    icon: <MessagesSquare className="h-5 w-5" />,
    title: "Conversas ilimitadas",
    desc: "Sem limite de trocas com o ECHO.",
    tone: "var(--jade)",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Análises profundas",
    desc: "Padrões, gatilhos e relatórios mensais.",
    tone: "var(--copper)",
  },
  {
    icon: <FileDown className="h-5 w-5" />,
    title: "Exportação PDF",
    desc: "Seu diário emocional em arquivo, pra compartilhar com terapeuta.",
    tone: "var(--gold)",
  },
  {
    icon: <Mic className="h-5 w-5" />,
    title: "Voz premium",
    desc: "Voz natural, sem anúncios, prioridade no servidor.",
    tone: "var(--mist)",
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    title: "Memória expandida",
    desc: "O ECHO lembra de mais contexto, conversa após conversa.",
    tone: "var(--vermillion)",
  },
];

export function PremiumScreen() {
  const setProfile = useEcho((s) => s.setProfile);
  const setOverlay = useEcho((s) => s.setOverlay);
  const premium = useEcho((s) => s.profile.premium);
  const { toast } = useToast();

  const activate = (plan: "mensal" | "anual") => {
    setProfile({
      premium: true,
      premiumUntil: Date.now() + 365 * 86400000,
    });
    toast({
      title: "Bem-vindo ao cultivo completo ✦",
      description:
        plan === "anual"
          ? "Plano anual ativo. Um ano inteiro de jornada."
          : "Plano mensal ativo. Renove quando quiser.",
    });
    setOverlay(null);
  };

  return (
    <div className="fixed inset-0 z-50 echo-ink-bg overflow-y-auto echo-no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#08080F] via-[#08080F]/95 to-transparent">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-[var(--gold)]" />
            <span className="echo-display text-lg font-semibold tracking-wide text-foreground">
              Premium
            </span>
          </div>
          <EchoButton
            variant="ghost"
            size="icon"
            aria-label="Fechar"
            onClick={() => setOverlay(null)}
          >
            <X className="h-5 w-5" />
          </EchoButton>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-16 pt-2">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center pt-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 16,
            }}
          >
            <SealStamp char="✦" size={72} rotate={-3} />
          </motion.div>
          <h1 className="echo-shimmer-gold echo-display mt-5 text-3xl font-semibold">
            ECHO Premium
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Desbloqueie o cultivo completo do seu coração.
          </p>
        </motion.div>

        {/* Benefícios */}
        <div className="mt-8 space-y-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.08 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <EchoCard glass className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5"
                    style={{ color: b.tone }}
                  >
                    {b.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="echo-display text-base font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {b.desc}
                    </p>
                  </div>
                  {premium && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--jade)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--jade)]">
                      <Check className="h-3 w-3" /> Ativo
                    </span>
                  )}
                </div>
              </EchoCard>
            </motion.div>
          ))}
        </div>

        {/* Planos */}
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="echo-brush text-2xl text-[var(--gold)]/80">
              選
            </span>
            <h2 className="echo-display text-lg font-semibold text-foreground">
              Escolha seu caminho
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Mensal */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <EchoCard className="flex h-full flex-col p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Mensal
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="echo-display text-3xl font-semibold text-foreground">
                    R$ 19,90
                  </span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--jade)]" />
                    Todos os benefícios premium
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--jade)]" />
                    Cancele quando quiser
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--jade)]" />
                    Sem fidelidade
                  </li>
                </ul>
                <EchoButton
                  variant="outline"
                  size="md"
                  className="mt-5 w-full"
                  onClick={() => activate("mensal")}
                >
                  Assinar mensal
                </EchoButton>
              </EchoCard>
            </motion.div>

            {/* Anual — destacado */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <EchoCard
                filigree
                glow="gold"
                className="relative flex h-full flex-col overflow-hidden p-5"
              >
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#D4B062] to-[#C8895A] px-2.5 py-1 text-[10px] font-semibold text-[#1A1408]">
                  <Sparkles className="h-3 w-3" /> Economize 37%
                </span>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                  Anual
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="echo-display text-3xl font-semibold text-foreground">
                    R$ 149,90
                  </span>
                  <span className="text-xs text-muted-foreground">/ano</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ~R$ 12,49/mês · cobrado anual
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                    Tudo do plano mensal
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                    2 meses de cultivo grátis
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                    Selo de apoiador no perfil
                  </li>
                </ul>
                <EchoButton
                  variant="gold"
                  size="md"
                  className="mt-5 w-full"
                  onClick={() => activate("anual")}
                >
                  Assinar anual ✦
                </EchoButton>
              </EchoCard>
            </motion.div>
          </div>
        </div>

        {/* Restaurar compra */}
        <div className="mt-6 flex justify-center">
          <EchoButton
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                title: "Compra restaurada",
                description: premium
                  ? "Seu Premium já estava ativo."
                  : "Nenhuma compra anterior encontrada neste aparelho.",
              })
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar compra
          </EchoButton>
        </div>

        {/* Footer micro */}
        <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Renovação automática. Cancele quando quiser.
          <br />
          Pagamento processado pela loja.
        </p>
      </div>
    </div>
  );
}

export default PremiumScreen;
