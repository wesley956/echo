"use client";

/**
 * ECHO — Voice Service
 * Wrapper sobre Web Speech API: SpeechRecognition (STT) + SpeechSynthesis (TTS).
 * Voz pt-BR, tom levemente mais grave (confiança), velocidade moderada.
 */

type Listener = (text: string) => void;

class VoiceService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private supported: boolean = false;
  private listening = false;
  private onTextCb: Listener | null = null;
  private onAmplitudeCb: ((amp: number) => void) | null = null;
  private amplitudeTimer: ReturnType<typeof setInterval> | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR();
      this.recognition.lang = "pt-BR";
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
    this.synth = window.speechSynthesis;
    if (this.synth) {
      this.loadVoices();
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
    this.supported = !!SR || !!this.synth;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  get sttSupported() {
    return !!this.recognition;
  }
  get ttsSupported() {
    return !!this.synth;
  }

  /** Inicia escuta. onText recebe o texto final. onAmplitude recebe valor 0-1 para visualização. */
  startListening(onText: Listener, onAmplitude?: (a: number) => void) {
    if (!this.recognition) {
      onText("");
      return;
    }
    this.onTextCb = onText;
    this.onAmplitudeCb = onAmplitude || null;
    this.listening = true;

    let finalText = "";
    this.recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      // amplitude proxy from length
      if (this.onAmplitudeCb) {
        const amp = Math.min(1, (finalText.length + interim.length) / 40 + Math.random() * 0.3);
        this.onAmplitudeCb(amp);
      }
    };
    this.recognition.onerror = () => {
      this.listening = false;
      this.stopAmplitude();
    };
    this.recognition.onend = () => {
      this.listening = false;
      this.stopAmplitude();
      if (this.onTextCb) this.onTextCb(finalText.trim());
    };

    // simulate amplitude pulse while listening
    this.amplitudeTimer = setInterval(() => {
      if (this.onAmplitudeCb && this.listening) {
        this.onAmplitudeCb(0.3 + Math.random() * 0.7);
      }
    }, 120);

    try {
      this.recognition.start();
    } catch {
      /* already started */
    }
  }

  stopListening(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve("");
        return;
      }
      let finalText = "";
      this.recognition.onresult = (e: any) => {
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        }
      };
      this.recognition.onend = () => {
        this.listening = false;
        this.stopAmplitude();
        resolve(finalText.trim());
      };
      try {
        this.recognition.stop();
      } catch {
        resolve(finalText.trim());
      }
    });
  }

  private stopAmplitude() {
    if (this.amplitudeTimer) {
      clearInterval(this.amplitudeTimer);
      this.amplitudeTimer = null;
    }
  }

  get isListening() {
    return this.listening;
  }

  /** Sintetiza fala. pt-BR, tom mais grave, velocidade moderada. */
  speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      onEnd?.();
      return;
    }
    this.synth.cancel();
    const u = new SpeechSynthesisUtterance(stripMarkdown(text));
    u.lang = "pt-BR";
    u.rate = 0.96;
    u.pitch = 0.85; // mais grave = mais confiança
    u.volume = 1;
    // tenta voz pt-BR nativa
    const ptVoice =
      this.voices.find((v) => v.lang === "pt-BR" && /female|maria|luciana|vit/i.test(v.name)) ||
      this.voices.find((v) => v.lang === "pt-BR") ||
      this.voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) u.voice = ptVoice;
    u.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };
    u.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };
    this.currentUtterance = u;
    this.synth.speak(u);
  }

  stop() {
    this.synth?.cancel();
    this.currentUtterance = null;
  }
  pause() {
    this.synth?.pause();
  }
  resume() {
    this.synth?.resume();
  }
  get speaking() {
    return !!this.synth?.speaking;
  }
}

function stripMarkdown(t: string): string {
  return t
    .replace(/[*_`#>~-]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

let instance: VoiceService | null = null;
export function getVoice(): VoiceService {
  if (!instance) instance = new VoiceService();
  return instance;
}
