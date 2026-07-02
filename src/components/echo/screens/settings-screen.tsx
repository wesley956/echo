"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Palette,
  Volume2,
  Bell,
  UserCog,
  Info,
  Shield,
  FileText,
  Heart,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";
import { useEcho } from "@/lib/echo/store";
import { useToast } from "@/hooks/use-toast";
import { EchoCard, EchoCardHeader } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { SealStamp } from "../ui/seal-stamp";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Section({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.05 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {desc && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {desc}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsScreen() {
  const profile = useEcho((s) => s.profile);
  const setProfile = useEcho((s) => s.setProfile);
  const resetAll = useEcho((s) => s.resetAll);
  const setOverlay = useEcho((s) => s.setOverlay);
  const { toast } = useToast();

  const [name, setName] = useState(profile.name);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState<
    null | "termos" | "privacidade" | "sobre"
  >(null);

  // local demo toggles
  const [reminder2d, setReminder2d] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  // apply theme to <html> (demo only)
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [profile.theme]);

  // commit name when changed (debounced feel via blur / enter)
  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== profile.name) {
      setProfile({ name: trimmed });
      toast({
        title: "Nome atualizado",
        description: `Agora te chamamos de ${trimmed}.`,
      });
    } else if (!trimmed) {
      setName(profile.name);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDelete = () => {
    resetAll();
    setOverlay("onboarding");
    toast({
      title: "Conta reiniciada",
      description: "Começamos do zero. Até breve, viajante.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 echo-ink-bg overflow-y-auto echo-no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#08080F] via-[#08080F]/95 to-transparent">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <SealStamp char="設" size={40} rotate={-4} />
            <div>
              <h1 className="echo-display text-2xl font-semibold leading-none text-foreground">
                Configurações
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Ajuste seu caminho
              </p>
            </div>
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

      <div className="mx-auto max-w-2xl space-y-5 px-5 pb-16 pt-2">
        {/* 1. Aparência */}
        <Section index={1}>
          <EchoCard filigree glow="gold">
            <EchoCardHeader
              title="Aparência"
              subtitle="Como o ECHO se mostra pra você"
              icon={<Palette className="h-5 w-5" />}
              accent="gold"
            />
            <div className="echo-ink-divider mb-1" />
            <Row
              title="Modo claro"
              desc="Tinta nanquim ou papel quente. Escolha sua luz."
            >
              <div className="flex items-center gap-2">
                {profile.theme === "light" ? (
                  <Sun className="h-4 w-4 text-[var(--gold)]" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={profile.theme === "light"}
                  onCheckedChange={(v) =>
                    setProfile({ theme: v ? "light" : "dark" })
                  }
                />
              </div>
            </Row>
            <div className="echo-ink-divider" />
            <div className="py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Tamanho da fonte
                </p>
                <span className="echo-display text-sm text-[var(--gold)]">
                  {profile.fontScale.toFixed(2)}×
                </span>
              </div>
              <Slider
                value={[profile.fontScale]}
                min={0.85}
                max={1.3}
                step={0.05}
                onValueChange={(v) => setProfile({ fontScale: v[0] })}
                className="text-[var(--gold)]"
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/70">
                <span>A</span>
                <span>padrão</span>
                <span className="text-base">A</span>
              </div>
            </div>
          </EchoCard>
        </Section>

        {/* 2. Voz */}
        <Section index={2}>
          <EchoCard glow="jade">
            <EchoCardHeader
              title="Voz"
              subtitle="Quando o ECHO fala com você"
              icon={<Volume2 className="h-5 w-5" />}
              accent="jade"
            />
            <div className="echo-ink-divider mb-1" />
            <Row
              title="Leitura por voz"
              desc="O ECHO lê as respostas em voz alta (pt-BR, tom grave)."
            >
              <Switch
                checked={profile.voiceEnabled}
                onCheckedChange={(v) => {
                  setProfile({ voiceEnabled: v });
                  toast({
                    title: v ? "Voz ativada" : "Voz silenciada",
                    description: v
                      ? "O ECHO vai falar as respostas em voz alta."
                      : "Silêncio. Só texto.",
                  });
                }}
              />
            </Row>
          </EchoCard>
        </Section>

        {/* 3. Notificações */}
        <Section index={3}>
          <EchoCard glow="copper">
            <EchoCardHeader
              title="Notificações"
              subtitle="Quando o ECHO te procura"
              icon={<Bell className="h-5 w-5" />}
              accent="copper"
            />
            <div className="echo-ink-divider mb-1" />
            <Row
              title="Check-in diário"
              desc="Um lembrete carinhoso pra parar e sentir."
            >
              <Select
                value={String(profile.checkinHour)}
                onValueChange={(v) => setProfile({ checkinHour: Number(v) })}
              >
                <SelectTrigger className="h-9 w-44 rounded-xl border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {hours.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      Check-in às {h}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <div className="echo-ink-divider" />
            <Row
              title="Não perturbar"
              desc="Silêncio respeitoso no seu descanso."
            >
              <div className="flex items-center gap-2">
                <Select
                  value={String(profile.dndStart)}
                  onValueChange={(v) => setProfile({ dndStart: Number(v) })}
                >
                  <SelectTrigger className="h-9 w-20 rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {hours.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">às</span>
                <Select
                  value={String(profile.dndEnd)}
                  onValueChange={(v) => setProfile({ dndEnd: Number(v) })}
                >
                  <SelectTrigger className="h-9 w-20 rounded-xl border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {hours.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Row>
            <div className="echo-ink-divider" />
            <Row
              title="Lembrete após 2 dias"
              desc="Se você some, o ECHO pergunta se está tudo bem."
            >
              <Switch
                checked={reminder2d}
                onCheckedChange={(v) => {
                  setReminder2d(v);
                  toast({
                    title: v
                      ? "Lembrete de 2 dias ativo"
                      : "Lembrete de 2 dias desligado",
                  });
                }}
              />
            </Row>
            <div className="echo-ink-divider" />
            <Row
              title="Resumo semanal"
              desc="Toda segunda, um mapa do que se moveu em você."
            >
              <Switch
                checked={weeklySummary}
                onCheckedChange={(v) => {
                  setWeeklySummary(v);
                  toast({
                    title: v
                      ? "Resumo semanal ativado"
                      : "Resumo semanal desligado",
                  });
                }}
              />
            </Row>
          </EchoCard>
        </Section>

        {/* 4. Conta */}
        <Section index={4}>
          <EchoCard glow="vermillion">
            <EchoCardHeader
              title="Conta"
              subtitle="Quem você é no ECHO"
              icon={<UserCog className="h-5 w-5" />}
              accent="vermillion"
            />
            <div className="echo-ink-divider mb-3" />
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Seu nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === "Enter" && commitName()}
                placeholder="Como te chamamos?"
                className="h-11 rounded-xl border-white/10 bg-white/5"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <EchoButton
                variant="ghost"
                size="sm"
                onClick={() => setOverlay("premium")}
              >
                {profile.premium ? "Premium ativo ✦" : "Ver Premium"}
              </EchoButton>
              <EchoButton
                variant="vermillion"
                size="sm"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir conta
              </EchoButton>
            </div>
          </EchoCard>
        </Section>

        {/* 5. Sobre */}
        <Section index={5}>
          <EchoCard>
            <EchoCardHeader
              title="Sobre"
              subtitle="Termos, privacidade e o espírito do ECHO"
              icon={<Info className="h-5 w-5" />}
              accent="gold"
            />
            <div className="echo-ink-divider mb-2" />
            <div className="flex flex-col gap-1">
              <EchoButton
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setAboutOpen("termos")}
              >
                <FileText className="h-4 w-4 text-[var(--mist)]" />
                Termos de uso
              </EchoButton>
              <EchoButton
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setAboutOpen("privacidade")}
              >
                <Shield className="h-4 w-4 text-[var(--jade)]" />
                Política de privacidade
              </EchoButton>
              <EchoButton
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setAboutOpen("sobre")}
              >
                <Heart className="h-4 w-4 text-[var(--vermillion)]" />
                Sobre o ECHO
              </EchoButton>
            </div>
          </EchoCard>
        </Section>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <span className="echo-brush text-3xl text-[var(--vermillion)]/70">
            心
          </span>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            ECHO v1.0 · wuxia-brasileirado
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl border-white/10 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="echo-display text-xl">
              Apagar tudo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar seu nome, conversas, diário, metas e insights. Sem
              volta. O caminho começa de novo do zero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Manter meu caminho
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-[var(--vermillion)] text-[#F4F1EA] hover:bg-[var(--vermillion)]/90"
            >
              Apagar e recomeçar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* About dialogs */}
      <Dialog
        open={aboutOpen !== null}
        onOpenChange={(o) => !o && setAboutOpen(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto echo-no-scrollbar rounded-2xl border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="echo-display text-2xl">
              {aboutOpen === "termos" && "Termos de uso"}
              {aboutOpen === "privacidade" && "Política de privacidade"}
              {aboutOpen === "sobre" && "Sobre o ECHO"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Texto sobre {aboutOpen}
            </DialogDescription>
          </DialogHeader>

          {aboutOpen === "termos" && (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                O ECHO é um assistente de inteligência emocional baseado em
                inteligência artificial. Ele existe pra te ouvir, refletir com
                você e ajudar a enxergar padrões — mas{" "}
                <span className="text-foreground">
                  não substitui ajuda profissional
                </span>
                .
              </p>
              <p>
                Você concorda em usar o ECHO com responsabilidade. Em crises
                graves, pensamentos de morte ou risco iminente, procure um
                profissional de saúde, a emergência (192) ou ligue pra{" "}
                <span className="font-semibold text-[var(--gold)]">
                  CVV 188
                </span>
                , 24h, gratuito.
              </p>
              <p>
                O ECHO pode errar. Ele é um espelho, não um oráculo. Confie no
                seu próprio coração acima de qualquer resposta que ele dê.
              </p>
            </div>
          )}

          {aboutOpen === "privacidade" && (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Tudo o que você escreve no ECHO fica salvo{" "}
                <span className="text-foreground">
                  apenas no seu aparelho
                </span>{" "}
                (armazenamento local do navegador). Nada é enviado a servidores
                externos a não ser a sua mensagem no momento da conversa — e
                mesmo essa não é guardada por nós.
              </p>
              <p>
                Você pode apagar tudo a qualquer momento em{" "}
                <span className="text-foreground">Conta → Excluir conta</span>.
                Não existe recuperação depois disso.
              </p>
              <p>
                Não vendemos dados. Não temos dados pra vender. O que é seu,
                fica seu.
              </p>
            </div>
          )}

          {aboutOpen === "sobre" && (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                O ECHO nasceu de uma ideia antiga: a de que{" "}
                <span className="text-foreground">
                  todo mundo merece ser ouvido
                </span>
                , mesmo quando não consegue se ouvir. Ele mistura a tradição
                wuxia do cultivo do coração (修心) com a alma brasileira — direta,
                afetuosa, sem rodeios.
              </p>
              <p>
                Ele tem três modos:{" "}
                <span className="echo-brush text-[var(--jade)]">柔</span>{" "}
                apoio,{" "}
                <span className="echo-brush text-[var(--gold)]">道</span>{" "}
                equilíbrio e{" "}
                <span className="echo-brush text-[var(--vermillion)]">剛</span>{" "}
                confronto. Você escolhe o que precisa no momento.
              </p>
              <p>
                O ECHO é uma IA emocional. Ele sente? Não. Mas ele aprende a te
                conhecer. E às vezes, o que a gente mais precisa é de uma
                presença que repete de volta, com cuidado, o que dissemos pra
                nós mesmos.
              </p>
              <p className="border-t border-white/8 pt-3 text-xs text-muted-foreground/80">
                Em situação de sofrimento intenso, ligue pra{" "}
                <span className="font-semibold text-[var(--gold)]">CVV 188</span>
                . O ECHO não substitui ajuda profissional.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsScreen;
