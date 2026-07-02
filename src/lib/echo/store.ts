"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { EchoMode, EmotionTag } from "./prompts";

export interface EchoMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  tags?: EmotionTag[];
  crisis?: boolean;
}

export interface Conversation {
  id: string;
  mode: EchoMode;
  title: string;
  startedAt: number;
  endedAt?: number;
  summary?: string;
  messages: EchoMessage[];
}

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  anxiety: number; // 0-10
  energy: number; // 0-10
  sleep: number; // 0-10
  stress: number; // 0-10
  motivation: number; // 0-10
  note: string;
  createdAt: number;
}

export interface Insight {
  id: string;
  content: string;
  type: "pattern" | "win" | "warning" | "observation";
  generatedAt: number;
  dismissed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  status: "ativa" | "concluida" | "pausada";
  progress: number; // 0-100
  createdAt: number;
}

export interface UserProfile {
  name: string;
  avatarSeed: string;
  createdAt: number;
  premium: boolean;
  premiumUntil?: number;
  voiceEnabled: boolean;
  theme: "dark" | "light";
  fontScale: number;
  checkinHour: number; // 0-23
  dndStart: number; // 0-23
  dndEnd: number; // 0-23
  trustedContact?: { name: string; phone: string };
  nearestCaps?: string;
  biometric: boolean;
  privateMode: boolean;
}

export type ScreenTab = "home" | "chat" | "diary" | "insights" | "profile";
export type Overlay =
  | null
  | "onboarding"
  | "emergency"
  | "settings"
  | "premium"
  | "goals"
  | "guide"
  | "voice-chat";

interface EchoState {
  // onboarding
  onboarded: boolean;
  // profile
  profile: UserProfile;
  // navigation
  tab: ScreenTab;
  overlay: Overlay;
  // chat
  conversations: Conversation[];
  activeConversationId: string | null;
  currentMode: EchoMode;
  // diary
  diary: Record<string, DiaryEntry>;
  // insights
  insights: Insight[];
  patterns: string[];
  strengths: string[];
  challenges: string[];
  // goals
  goals: Goal[];
  // ui
  lastVisit: number;

  // actions
  setOnboarded: (v: boolean) => void;
  setProfile: (p: Partial<UserProfile>) => void;
  setTab: (t: ScreenTab) => void;
  setOverlay: (o: Overlay) => void;
  setMode: (m: EchoMode) => void;
  startConversation: (mode: EchoMode) => string;
  addMessage: (conversationId: string, msg: Omit<EchoMessage, "id" | "createdAt">) => void;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<EchoMessage>) => void;
  endConversation: (conversationId: string, summary?: string) => void;
  setDiary: (date: string, entry: Partial<DiaryEntry>) => void;
  addInsight: (i: Omit<Insight, "id" | "generatedAt" | "dismissed">) => void;
  dismissInsight: (id: string) => void;
  addPattern: (p: string) => void;
  addStrength: (s: string) => void;
  addChallenge: (c: string) => void;
  addGoal: (g: Omit<Goal, "id" | "createdAt" | "status" | "progress">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  resetAll: () => void;
  touch: () => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const defaultProfile: UserProfile = {
  name: "",
  avatarSeed: "echo",
  createdAt: Date.now(),
  premium: false,
  voiceEnabled: true,
  theme: "dark",
  fontScale: 1,
  checkinHour: 20,
  dndStart: 22,
  dndEnd: 8,
  biometric: false,
  privateMode: false,
};

const seedInsights: Insight[] = [
  {
    id: uid(),
    content:
      "Você costuma escrever mais nos domingos à noite. O que será que o domingo desperta em você?",
    type: "pattern",
    generatedAt: Date.now() - 86400000 * 2,
    dismissed: false,
  },
  {
    id: uid(),
    content:
      "Percebi que toda vez que você fala de trabalho, a palavra 'cansado' aparece junto. Vale olhar pra isso.",
    type: "observation",
    generatedAt: Date.now() - 86400000 * 4,
    dismissed: false,
  },
  {
    id: uid(),
    content:
      "Você tem voltado a falar de esperança com mais frequência. Pequeno sinal. Grande movimento.",
    type: "win",
    generatedAt: Date.now() - 86400000 * 6,
    dismissed: false,
  },
];

const seedGoals: Goal[] = [
  {
    id: uid(),
    title: "Escrever no diário 5 dias seguidos",
    description: "Pequeno ritual. O cultivador afia a lâmina todo dia.",
    targetDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    status: "ativa",
    progress: 40,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: uid(),
    title: "Conversar com o ECHO quando a ansiedade subir",
    description: "Em vez de segurar, despejar. 3 conversas esta semana.",
    targetDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    status: "ativa",
    progress: 66,
    createdAt: Date.now() - 86400000 * 2,
  },
];

const seedPatterns = [
  "Ansiedade recorrente ligada ao trabalho",
  "Humor mais baixo aos domingos à noite",
  "Tendência a se cobrar demais após erros pequenos",
];
const seedStrengths = ["Persistência", "Empatia", "Capacidade de rir da própria dor"];
const seedChallenges = ["Autocrítica", "Dificuldade de pedir ajuda", "Sono irregular"];

// seed diary for last 14 days with mild variation
function seedDiary(): Record<string, DiaryEntry> {
  const out: Record<string, DiaryEntry> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    // skip some days to feel real
    if (i % 4 === 2) continue;
    const mood = [3, 2, 4, 3, 2, 4, 5, 3, 2, 3, 4, 3, 2][13 - i] ?? 3;
    out[key] = {
      date: key,
      mood,
      anxiety: 4 + ((i * 3) % 5),
      energy: 5 + ((i * 2) % 4),
      sleep: 6 + ((i * 5) % 3),
      stress: 5 + ((i * 7) % 4),
      motivation: 4 + ((i * 4) % 5),
      note:
        i < 3
          ? "Dia corrido. Parei pra respirar só no fim da tarde."
          : i % 3 === 0
            ? "Conversa boa com alguém que faz bem."
            : "",
      createdAt: d.getTime(),
    };
  }
  return out;
}

export const useEcho = create<EchoState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: defaultProfile,
      tab: "home",
      overlay: null,
      conversations: [],
      activeConversationId: null,
      currentMode: "equilibrio",
      diary: seedDiary(),
      insights: seedInsights,
      patterns: seedPatterns,
      strengths: seedStrengths,
      challenges: seedChallenges,
      goals: seedGoals,
      lastVisit: Date.now(),

      setOnboarded: (v) => set({ onboarded: v }),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setTab: (t) => set({ tab: t, overlay: null }),
      setOverlay: (o) => set({ overlay: o }),
      setMode: (m) => set({ currentMode: m }),
      touch: () => set({ lastVisit: Date.now() }),

      startConversation: (mode) => {
        const id = uid();
        const conv: Conversation = {
          id,
          mode,
          title: "Conversa",
          startedAt: Date.now(),
          messages: [],
        };
        set((s) => ({
          conversations: [conv, ...s.conversations].slice(0, 60),
          activeConversationId: id,
        }));
        return id;
      },

      addMessage: (conversationId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { ...msg, id: uid(), createdAt: Date.now() },
                  ],
                }
              : c
          ),
        })),

      updateMessage: (conversationId, messageId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m
                  ),
                }
              : c
          ),
        })),

      endConversation: (conversationId, summary) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, endedAt: Date.now(), summary }
              : c
          ),
        })),

      setDiary: (date, entry) =>
        set((s) => ({
          diary: {
            ...s.diary,
            [date]: {
              date,
              mood: 3,
              anxiety: 5,
              energy: 5,
              sleep: 5,
              stress: 5,
              motivation: 5,
              note: "",
              createdAt: Date.now(),
              ...(s.diary[date] ?? {}),
              ...entry,
              date,
            },
          },
        })),

      addInsight: (i) =>
        set((s) => ({
          insights: [
            { ...i, id: uid(), generatedAt: Date.now(), dismissed: false },
            ...s.insights,
          ].slice(0, 40),
        })),

      dismissInsight: (id) =>
        set((s) => ({
          insights: s.insights.map((i) =>
            i.id === id ? { ...i, dismissed: true } : i
          ),
        })),

      addPattern: (p) =>
        set((s) =>
          s.patterns.includes(p) ? {} : { patterns: [...s.patterns, p] }
        ),
      addStrength: (st) =>
        set((s) =>
          s.strengths.includes(st) ? {} : { strengths: [...s.strengths, st] }
        ),
      addChallenge: (c) =>
        set((s) =>
          s.challenges.includes(c) ? {} : { challenges: [...s.challenges, c] }
        ),

      addGoal: (g) =>
        set((s) => ({
          goals: [
            {
              ...g,
              id: uid(),
              createdAt: Date.now(),
              status: "ativa",
              progress: 0,
            },
            ...s.goals,
          ],
        })),

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      resetAll: () =>
        set({
          onboarded: false,
          profile: defaultProfile,
          conversations: [],
          diary: {},
          insights: [],
          patterns: [],
          strengths: [],
          challenges: [],
          goals: [],
          activeConversationId: null,
          tab: "home",
          overlay: "onboarding",
        }),
    }),
    {
      name: "echo-wuxia-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        currentMode: s.currentMode,
        diary: s.diary,
        insights: s.insights,
        patterns: s.patterns,
        strengths: s.strengths,
        challenges: s.challenges,
        goals: s.goals,
        lastVisit: s.lastVisit,
      }),
    }
  )
);

/** Helper: dias desde a última visita. */
export function daysSince(ts: number): number {
  if (!ts) return 0;
  const diff = Date.now() - ts;
  return Math.floor(diff / 86400000);
}
