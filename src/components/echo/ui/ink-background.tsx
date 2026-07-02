"use client";

import { cn } from "@/lib/utils";

/**
 * Fundo de tinta nanquim — montanhas em camadas, lua, névoa.
 * Assinatura visual do ECHO wuxia-brasileirado.
 */
export function InkBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 echo-ink-bg" />
      {/* moon */}
      <div
        className="absolute right-[12%] top-[8%] h-28 w-28 rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(244,241,234,0.95), rgba(212,176,98,0.4) 55%, transparent 70%)",
          filter: "blur(0.5px)",
        }}
      />
      <div
        className="absolute right-[12%] top-[8%] h-28 w-28 rounded-full"
        style={{ boxShadow: "0 0 80px 20px rgba(212,176,98,0.18)" }}
      />
      {/* far mountains */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "42vh", opacity: 0.22 }}
      >
        <path
          d="M0,224 L120,180 L240,210 L360,150 L480,190 L600,140 L720,180 L840,130 L960,170 L1080,120 L1200,160 L1320,140 L1440,180 L1440,320 L0,320 Z"
          fill="url(#mFar)"
        />
        <defs>
          <linearGradient id="mFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2a3a" />
            <stop offset="100%" stopColor="#08080F" />
          </linearGradient>
        </defs>
      </svg>
      {/* mid mountains */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "32vh", opacity: 0.38 }}
      >
        <path
          d="M0,260 L100,200 L220,240 L340,180 L460,220 L580,170 L700,210 L820,160 L940,200 L1060,150 L1180,190 L1300,170 L1440,210 L1440,320 L0,320 Z"
          fill="url(#mMid)"
        />
        <defs>
          <linearGradient id="mMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14202a" />
            <stop offset="100%" stopColor="#08080F" />
          </linearGradient>
        </defs>
      </svg>
      {/* bamboo / leaf silhouettes — Brazilian+wuxia fusion */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ height: "20vh", opacity: 0.5 }}
      >
        <g fill="url(#leaf)">
          <path d="M120,200 C120,140 100,100 70,70 C110,90 140,130 150,200 Z" />
          <path d="M180,200 C180,120 165,80 140,50 C185,70 210,110 215,200 Z" />
          <path d="M1280,200 C1280,150 1300,110 1330,80 C1290,100 1265,140 1255,200 Z" />
          <path d="M1340,200 C1340,130 1360,90 1390,60 C1345,80 1320,120 1315,200 Z" />
        </g>
        <defs>
          <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="100%" stopColor="#08080F" />
          </linearGradient>
        </defs>
      </svg>
      {/* subtle ink grain noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
