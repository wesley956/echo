"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVoice } from "@/lib/echo/voice";

/** Botão de microfone — segura pra gravar, solta pra enviar. */
export function VoiceButton({
  onTranscript,
  className,
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [amp, setAmp] = useState(0);
  const voiceRef = useRef(getVoice());

  const start = () => {
    if (!voiceRef.current.sttSupported) {
      onTranscript("");
      return;
    }
    setListening(true);
    voiceRef.current.startListening((text) => {
      setListening(false);
      setAmp(0);
      if (text) onTranscript(text);
    }, setAmp);
  };

  const stop = () => {
    voiceRef.current.stopListening().then((text) => {
      setListening(false);
      setAmp(0);
      if (text) onTranscript(text);
    });
  };

  return (
    <motion.button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        start();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        stop();
      }}
      onPointerLeave={() => listening && stop()}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
        listening
          ? "bg-[var(--vermillion)]/20 text-[var(--vermillion)]"
          : "bg-white/5 text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={listening ? "Parar gravação" : "Falar com o ECHO"}
    >
      {listening && (
        <motion.span
          className="absolute inset-0 rounded-2xl border border-[var(--vermillion)]/50"
          animate={{ scale: 1 + amp * 0.25, opacity: 0.7 - amp * 0.4 }}
          transition={{ duration: 0.1 }}
        />
      )}
      {listening ? (
        <Square className="h-4 w-4" fill="currentColor" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </motion.button>
  );
}
