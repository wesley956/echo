"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEcho } from "@/lib/echo/store";
import { InkBackground } from "@/components/echo/ui/ink-background";
import { BottomNav } from "@/components/echo/ui/bottom-nav";
import { HomeScreen } from "@/components/echo/screens/home-screen";
import { ChatScreen } from "@/components/echo/screens/chat-screen";
import { DiaryScreen } from "@/components/echo/screens/diary-screen";
import { InsightsScreen } from "@/components/echo/screens/insights-screen";
import { ProfileScreen } from "@/components/echo/screens/profile-screen";
import { GoalsScreen } from "@/components/echo/screens/goals-screen";
import { EmergencyScreen } from "@/components/echo/screens/emergency-screen";
import { SettingsScreen } from "@/components/echo/screens/settings-screen";
import { PremiumScreen } from "@/components/echo/screens/premium-screen";
import { GuideScreen } from "@/components/echo/screens/guide-screen";
import { OnboardingScreen } from "@/components/echo/screens/onboarding-screen";

export default function Home() {
  const onboarded = useEcho((s) => s.onboarded);
  const tab = useEcho((s) => s.tab);
  const overlay = useEcho((s) => s.overlay);
  const setOverlay = useEcho((s) => s.setOverlay);
  const setOnboarded = useEcho((s) => s.setOnboarded);
  const theme = useEcho((s) => s.profile.theme);
  const fontScale = useEcho((s) => s.profile.fontScale);

  // apply theme + font scale to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * fontScale}px`;
  }, [fontScale]);

  if (!onboarded) {
    return (
      <>
        <InkBackground />
        <OnboardingScreen onDone={() => setOnboarded(true)} />
      </>
    );
  }

  return (
    <>
      <InkBackground />
      <div className="relative flex min-h-[100dvh] flex-col">
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "home" && <HomeScreen />}
              {tab === "chat" && <ChatScreen />}
              {tab === "diary" && <DiaryScreen />}
              {tab === "insights" && <InsightsScreen />}
              {tab === "profile" && <ProfileScreen />}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>

      {/* overlays */}
      <AnimatePresence>
        {overlay === "emergency" && (
          <motion.div
            key="ov-emergency"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmergencyScreen />
          </motion.div>
        )}
        {overlay === "goals" && (
          <motion.div
            key="ov-goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 echo-ink-bg overflow-y-auto echo-no-scrollbar"
          >
            <GoalsScreen />
          </motion.div>
        )}
        {overlay === "settings" && (
          <motion.div key="ov-settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <SettingsScreen />
          </motion.div>
        )}
        {overlay === "premium" && (
          <motion.div key="ov-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <PremiumScreen />
          </motion.div>
        )}
        {overlay === "guide" && (
          <motion.div key="ov-guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <GuideScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
