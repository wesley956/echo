"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Phone, MapPin, UserPlus, Check } from "lucide-react";
import { useEcho } from "@/lib/echo/store";
import { EchoCard, EchoCardHeader } from "@/components/echo/ui/echo-card";
import { EchoButton } from "@/components/echo/ui/echo-button";
import { SealStamp } from "@/components/echo/ui/seal-stamp";
import { BreathingAnimation } from "@/components/echo/ui/breathing-animation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EmergencyScreen() {
  const profile = useEcho((s) => s.profile);
  const setProfile = useEcho((s) => s.setProfile);
  const setOverlay = useEcho((s) => s.setOverlay);
  const { toast } = useToast();

  const trustedContact = profile.trustedContact;
  const nearestCaps = profile.nearestCaps;

  const [capsInput, setCapsInput] = useState("");
  const [cname, setCname] = useState("");
  const [cphone, setCphone] = useState("");

  const call = (number: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${number.replace(/\D/g, "")}`;
    }
  };

  const saveCaps = () => {
    if (!capsInput.trim()) return;
    setProfile({ nearestCaps: capsInput.trim() });
    toast({ title: "CAPS salvo no seu perfil." });
    setCapsInput("");
  };

  const saveContact = () => {
    if (!cname.trim() || !cphone.trim()) {
      toast({ title: "Precisa do nome e do telefone." });
      return;
    }
    setProfile({
      trustedContact: { name: cname.trim(), phone: cphone.trim() },
    });
    toast({ title: "Contato de confiança salvo." });
    setCname("");
    setCphone("");
  };

  return (
    <div className="echo-ink-bg echo-no-scrollbar fixed inset-0 z-50 overflow-y-auto">
      {/* Close */}
      <button
        type="button"
        onClick={() => setOverlay(null)}
        aria-label="Fechar tela de emergência"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto max-w-md space-y-4 px-4 pb-16 pt-14">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center gap-3 pt-4 text-center"
        >
          <SealStamp char="救" size={72} rotate={-3} />
          <h1 className="echo-display text-2xl font-semibold text-foreground">
            Você não está sozinho
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Agora, neste momento, alguém pode te ouvir. De verdade.
          </p>
        </motion.div>

        {/* CVV */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
        >
          <EchoCard filigree glow="vermillion" className="text-center">
            <div className="echo-shimmer-gold echo-display text-5xl font-semibold">
              188
            </div>
            <p className="echo-display mt-1 text-lg text-foreground">
              Centro de Valorização da Vida
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gratuito · 24h · sigiloso
            </p>
            <EchoButton
              variant="vermillion"
              size="lg"
              className="mt-4 w-full gap-2"
              onClick={() => call("188")}
            >
              <Phone className="h-4 w-4" />
              Ligar agora
            </EchoButton>
          </EchoCard>
        </motion.div>

        {/* CAPS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
        >
          <EchoCard glow="copper">
            <EchoCardHeader
              title="CAPS mais próximo"
              subtitle="Centro de Atenção Psicossocial"
              accent="copper"
              icon={<MapPin className="h-4 w-4" />}
            />
            {nearestCaps ? (
              <div className="space-y-2">
                <p className="rounded-xl bg-white/5 p-3 text-sm text-foreground">
                  {nearestCaps}
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=CAPS+perto+de+mim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
                >
                  <MapPin className="h-4 w-4" />
                  Buscar no mapa
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Anote o endereço do CAPS que você conhece. Fica aqui pra quando
                  precisar.
                </p>
                <Input
                  value={capsInput}
                  onChange={(e) => setCapsInput(e.target.value)}
                  placeholder="ex: Rua das Acácias, 120 — centro"
                  className="h-11 rounded-xl border-white/10 bg-white/5"
                />
                <div className="flex items-center gap-2">
                  <EchoButton
                    variant="outline"
                    size="sm"
                    onClick={saveCaps}
                    className="gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" /> Salvar
                  </EchoButton>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=CAPS+perto+de+mim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs text-[var(--copper)] transition-opacity hover:opacity-80"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Buscar no mapa
                  </a>
                </div>
              </div>
            )}
          </EchoCard>
        </motion.div>

        {/* Trusted contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.24 }}
        >
          <EchoCard glow="jade">
            <EchoCardHeader
              title="Contato de confiança"
              subtitle="Alguém que você sabe que atende"
              accent="jade"
              icon={<UserPlus className="h-4 w-4" />}
            />
            {trustedContact ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {trustedContact.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {trustedContact.phone}
                  </p>
                </div>
                <EchoButton
                  variant="jade"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => call(trustedContact.phone)}
                >
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </EchoButton>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Quem você ligaria agora se precisasse? Guarda o contato aqui.
                </p>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="c-name"
                    className="text-xs text-muted-foreground"
                  >
                    Nome
                  </Label>
                  <Input
                    id="c-name"
                    value={cname}
                    onChange={(e) => setCname(e.target.value)}
                    placeholder="ex: mãe, irmã, amigo próximo"
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="c-phone"
                    className="text-xs text-muted-foreground"
                  >
                    Telefone
                  </Label>
                  <Input
                    id="c-phone"
                    type="tel"
                    value={cphone}
                    onChange={(e) => setCphone(e.target.value)}
                    placeholder="ex: (11) 99999-9999"
                    className="h-11 rounded-xl border-white/10 bg-white/5"
                  />
                </div>
                <EchoButton
                  variant="jade"
                  size="sm"
                  className="mt-1 w-full gap-1.5"
                  onClick={saveContact}
                >
                  <Check className="h-3.5 w-3.5" /> Salvar contato
                </EchoButton>
              </div>
            )}
          </EchoCard>
        </motion.div>

        {/* Breathing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
        >
          <EchoCard glass>
            <EchoCardHeader
              title="Respira comigo"
              subtitle="Quatro. Sete. Oito."
              accent="gold"
              icon={<span className="echo-brush text-lg">息</span>}
            />
            <BreathingAnimation />
          </EchoCard>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
          className="px-2 pt-2 text-center text-xs leading-relaxed text-muted-foreground"
        >
          Se está sentindo que não dá mais, liga pra alguém agora. Não precisa ser
          forte sozinho. O ECHO fica aqui quando você voltar.
        </motion.p>
      </div>
    </div>
  );
}

export default EmergencyScreen;
