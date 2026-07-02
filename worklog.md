# ECHO — Worklog (Wuxia-Brasileirado)

## Visão Geral do Projeto
ECHO é um web app de inteligência emocional (Next.js 16) inspirado na spec Flutter do `upload/echo.txt`, reconstruído com tema **Wuxia-Brasileirado** (tinta nanquim + selos vermelhos + jade/cobre/ouro + cultivo do coração 修心 + alma brasileira). 

**Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, framer-motion, recharts, zustand (persistido em localStorage), z-ai-web-dev-sdk (LLM no backend), Web Speech API (voz no browser).

**Rota única visível:** `/` (src/app/page.tsx). Tudo é SPA com tabs + overlays.

## Tema (tokens em src/app/globals.css)
- `--background: #08080F` (noite de tinta), `--foreground: #F4F1EA` (papel quente)
- `--primary/--jade: #4A9D7C` (caminho do cultivo), `--secondary/--copper: #C8895A` (terra brasileira)
- `--accent/--gold: #D4B062` (prosperidade orixá), `--destructive/--vermillion: #C84B3F` (selo wuxia)
- `--mist: #5B7BA6`, `--card: #12121E`
- Fontes: Cormorant Garamond (display, `.echo-display`), DM Sans (corpo), Ma Shan Zheng (pincel, `.echo-brush`)
- Classes utilitárias: `.echo-ink-bg`, `.echo-filigree`, `.echo-seal`, `.echo-glow-jade|copper|gold|vermillion`, `.echo-glass`, `.echo-ink-divider`, `.echo-rise`, `.echo-shimmer-gold`, `.echo-no-scrollbar`

## Estrutura Criada
- `src/app/globals.css` — tema completo wuxia-brasileirado ✅
- `src/app/layout.tsx` — fontes + metadata pt-BR + dark canônico ✅
- `src/lib/echo/prompts.ts` — personalidade ECHO (Empático/Sincero/Inteligente/Corajoso), 3 modos (柔apoio/道equilíbrio/剛confronto), detectCrisis(), buildSystemPrompt(), MODE_META, EMOTION_TAGS ✅
- `src/lib/echo/store.ts` — zustand persistido: profile, conversations, messages, diary, insights, goals, patterns/strengths/challenges, tab, overlay. Seeds realistas. Helper `useEcho` + `daysSince()` ✅
- `src/lib/echo/voice.ts` — VoiceService (SpeechRecognition pt-BR + SpeechSynthesis pt-BR tom grave). Singleton `getVoice()` ✅
- `src/app/api/echo/chat/route.ts` — streaming SSE via z-ai SDK. Envia meta(crisis) → tokens → done(tags, crisis, full). Anexa msg de cuidado (CVV 188) se crise ✅
- `src/app/api/echo/insights/route.ts` — gera 2-4 insights curtos baseados em diário+conversas ✅
- `src/app/api/echo/goals-suggest/route.ts` — sugere 3 metas emocionais com IA ✅
- `src/components/echo/ui/` — InkBackground, SealStamp, EchoButton, EchoCard(+Header), EchoChip, MoodPicker, TypingIndicator, MessageBubble, BreathingAnimation, VoiceButton, ModeSelector ✅

## APIs que os subagentes DEVEM usar

### Store (`import { useEcho, daysSince } from "@/lib/echo/store"`)
State: `onboarded, profile, tab, overlay, conversations, activeConversationId, currentMode, diary, insights, patterns, strengths, challenges, goals, lastVisit`
Actions: `setOnboarded, setProfile(partial), setTab, setOverlay, setMode, startConversation(mode)->id, addMessage(convId, {role,content,tags?,crisis?}), updateMessage(convId, msgId, patch), endConversation(convId, summary?), setDiary(dateStr, partial), addInsight({content,type}), dismissInsight(id), addPattern, addStrength, addChallenge, addGoal({title,description,targetDate?}), updateGoal(id,patch), deleteGoal(id), resetAll(), touch()`
Tipos: `EchoMessage, Conversation, DiaryEntry, Insight, Goal, UserProfile, ScreenTab, Overlay`

### Prompts (`import { MODE_META, type EchoMode } from "@/lib/echo/prompts"`)
`MODE_META[mode] = { label, zh (char pincel), color (var), glow (class), icon (leaf/compass/sword), tagline }`

### Componentes UI (`@/components/echo/ui/...`)
- `<InkBackground />` — fundo fixo (já no page.tsx)
- `<SealStamp char="心" size={44} rotate={-4} />`
- `<EchoButton variant="primary|secondary|ghost|outline|gold|vermillion|jade" size="sm|md|lg|icon" />`
- `<EchoCard filigree glow="jade|copper|gold|vermillion|null" glass> <EchoCardHeader title subtitle icon accent right/> ... </EchoCard>`
- `<EchoChip tone="jade|copper|gold|vermillion|mist|muted" active />`
- `<MoodPicker value={1-5} onChange compact />`
- `<TypingIndicator />`
- `<MessageBubble message={EchoMessage} showTags onToggleTags />`
- `<BreathingAnimation />` — ciclo 4-7-8
- `<VoiceButton onTranscript={(text)=>{}} />`
- `<ModeSelector value={EchoMode} onChange showTagline />`

### Voz (`import { getVoice } from "@/lib/echo/voice"`)
`getVoice().speak(text, onEnd?)`, `.stop()`, `.sttSupported`, `.ttsSupported`

### Chat API (fetch SSE)
POST `/api/echo/chat` com `{ message, history: [{role,content}], mode, context: {userName, recentMoods, patterns, strengths, challenges, daysSinceLastVisit} }`. Resposta: SSE com `data: {type:"meta",crisis}` / `data: {type:"token",content}` / `data: {type:"done",tags,crisis,full}` / `data: [DONE]`.

POST `/api/echo/insights` com `{userName, diary[], recentConversations[], patterns[]}` → `{insights:[{content,type}]}`
POST `/api/echo/goals-suggest` com `{userName, patterns, challenges, strengths}` → `{goals:[{title,description,targetDate}]}`

## Design Language (OBRIGATÓRIO seguir)
- Fundo escuro com `InkBackground` já global. Cards usam `EchoCard` (bg-card, border white/8, radius 2xl).
- Títulos com `echo-display` (Cormorant). Acentos wuxia com `echo-brush` (Ma Shan Zheng) — chars como 心 (coração), 道 (caminho), 柔 (suave), 剛 (firme), 氣 (energia), 靜 (calma).
- Selos vermelhos `<SealStamp>` em pontos de ênfase.
- Espaçamento: `p-5`/`p-6` em cards, `gap-4`/`gap-6` entre seções. Lists longas: `max-h-96 overflow-y-auto`.
- Botões: `EchoButton`. Chips de emoção: `EchoChip tone="gold"`.
- Animações: framer-motion `initial/animate` com `ease [0.22,1,0.36,1]`. Use `.echo-rise` para entradas simples.
- NUNCA azul/índigo. Use jade/cobre/ouro/vermillion/mist.
- Português brasileiro em toda UI. Voz do ECHO: empática, direta, sem frases robóticas.

---
Task ID: 1-3
Agent: orchestrator
Task: Fundação (tema, fontes, libs core, APIs, componentes UI compartilhados)

Work Log:
- Lido echo.txt (spec Flutter) e adaptado para Next.js web
- Criado tema wuxia-brasileirado em globals.css (paleta + 12 utilities)
- layout.tsx com 3 fontes Google + dark canônico + metadata pt-BR
- prompts.ts: persona ECHO + 3 modos + crise + tags emocionais
- store.ts: zustand persistido com seeds realistas (14 dias diário, 3 insights, 2 metas, padrões)
- voice.ts: Web Speech API pt-BR (STT + TTS tom grave)
- 3 API routes (chat streaming SSE, insights, goals-suggest)
- 10 componentes UI compartilhados

Stage Summary:
- Fundação completa e funcional. Próximos subagentes constroem as telas em paralelo.
- Contract de telas: cada `<Name>Screen` é default export sem props (lê do store), exceto `OnboardingScreen` que recebe `onDone: () => void`.
- Caminho dos arquivos: `src/components/echo/screens/<name>-screen.tsx`

---
Task ID: 8-a
Agent: full-stack-developer (Settings + Premium + Guide)
Task: Build SettingsScreen, PremiumScreen, GuideScreen

Work Log:
- Lido worklog.md completo (tema, store API, prompts API, UI compartilhada).
- Inspecionados: store.ts (UserProfile + actions), echo-card.tsx (EchoCard/EchoCardHeader), echo-button.tsx (variants), seal-stamp.tsx, onboarding-screen.tsx (padrão de overlay), shadcn primitives (Select, Switch, Slider, Dialog, AlertDialog, Input, Label), useToast hook e tokens de globals.css (echo-shimmer-gold, echo-ink-bg, echo-no-scrollbar, gold-soft).
- Criado `src/components/echo/screens/settings-screen.tsx`:
  - Overlay full-screen (fixed inset-0 z-50 echo-ink-bg overflow-y-auto echo-no-scrollbar) com header sticky (gradient fade), SealStamp 設 e close X.
  - 5 EchoCards em sequência: Aparência (Switch modo claro + Slider fonte 0.85-1.3 com display echo-display), Voz (Switch voiceEnabled + nota pt-BR tom grave), Notificações (Select checkinHour, dois Selects dndStart/dndEnd + 2 Switches locais "Lembrete 2 dias" e "Resumo semanal" com toast), Conta (Input name com commit onBlur/Enter + EchoButton vermillion "Excluir conta" → AlertDialog → resetAll + setOverlay('onboarding')), Sobre (3 EchoButtons ghost → Dialogs com textos pt-BR sobre IA emocional + CVV 188 + "não substitui ajuda profissional").
  - Theme toggle: useEffect aplica/remove classe `light` em document.documentElement.
  - Footer: 心 brush + "ECHO v1.0 · wuxia-brasileirado".
- Criado `src/components/echo/screens/premium-screen.tsx`:
  - Overlay full-screen com header sticky (Crown gold + close X).
  - Hero: SealStamp ✦ size 72 (rotate -3) + título "ECHO Premium" com echo-shimmer-gold + subtítulo "Desbloqueie o cultivo completo do seu coração."
  - 5 EchoCards glass compact de benefícios (ícone + título echo-display + desc), com tons jade/copper/gold/mist/vermillion e selo "Ativo" se premium.
  - 2 planos side-by-side (grid sm:grid-cols-2): Mensal (R$ 19,90/mês, EchoButton outline) e Anual (R$ 149,90/ano, ~R$ 12,49/mês, badge "Economize 37%" gradient gold, EchoButton gold). Ambos → setProfile({premium:true, premiumUntil: Date.now()+365*86400000}) + toast "Bem-vindo ao cultivo completo ✦" + setOverlay(null).
  - Botão ghost "Restaurar compra" (RotateCcw) + footer micro sobre renovação automática.
- Criado `src/components/echo/screens/guide-screen.tsx`:
  - Overlay full-screen com header sticky (SealStamp 道 + título "Como publicar o ECHO" + close X).
  - Card introdutório glass com 道brush + resumo das 3 trilhas.
  - SECTION 1 (Github icon, glow copper, 一): 5 steps numeradas (StepBadge = echo-seal circular) com CodeBlock do `git init...git push`.
  - SECTION 2 (Box icon, glow jade, 二): 7 steps sobre CodeSandbox (import repo, Next.js, Devbox, share).
  - SECTION 3 (Smartphone icon, glow vermillion, 三): intro sobre Bubblewrap/TWA + 7 steps com 3 CodeBlocks (workflow YAML build-apk.yml, manifest.json, alternativa Capacitor).
  - Card final glass com Info icon "E a Play Store?" mencionando AAB + play.google.com/console + taxa U$25.
  - Footer: 道brush + "ECHO · o caminho se faz andando".
  - Componentes helper: StepBadge (circular echo-seal), Step (li com badge + texto), CodeBlock (pre com className exato do spec: overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-[var(--gold-soft)]).
- Corrigidos 2 erros de tipo TS: glow="mist" → glow="copper" (guide section 1) e accent="mist" → accent="gold" (settings Sobre) — EchoCard só aceita jade/copper/gold/vermillion.
- `bun run lint` passa limpo. `tsc --noEmit` limpo para os 3 arquivos novos.

Stage Summary:
- 3 overlays completos e auto-contidos, sem props (lêem store via useEcho), default export = named export, todos 'use client'.
- Linguagem visual wuxia-brasileirada consistente: selos vermelhos, echo-display titles, echo-brush acentos (一/二/三/道/心/設), paleta jade/copper/gold/vermillion/mist, mobile-first com max-w-2xl, animações framer-motion staggered.
- Settings cobre aparência/voz/notificações/conta/sobre com dialogs e alert-dialog; tema light/dark toggle funcional via classe no <html>.
- Premium é paywall elegante com hero shimmer-gold, 5 benefícios, 2 planos (mensal/anal com badge 37%), restaurar compra, ativação demo sem pagamento real.
- Guide entrega o passo a passo completo pedido (GitHub → CodeSandbox → APK via Bubblewrap/Capacitor via Actions) com YAML e manifest prontos pra copiar.
- Arquivos criados:
  - src/components/echo/screens/settings-screen.tsx
  - src/components/echo/screens/premium-screen.tsx
  - src/components/echo/screens/guide-screen.tsx

---
Task ID: 6-a
Agent: full-stack-developer (Diary + Insights)
Task: Build DiaryScreen and InsightsScreen

Work Log:
- Lido worklog.md e componentes compartilhados (EchoCard, EchoButton, EchoChip, MoodPicker/MOODS, SealStamp, Sheet, Slider, Textarea).
- Lido store.ts para entender diary (Record<dateStr,DiaryEntry>), insights, patterns/strengths/challenges, conversations, actions setDiary/addInsight/dismissInsight.
- Lido /api/echo/insights/route.ts para casar o contrato {userName, diary[], recentConversations[], patterns[]} → {insights:[{content,type}]}.
- Criado `src/components/echo/screens/diary-screen.tsx`:
  - Header "Diário Emocional" + brush 日 + SealStamp 記 + subtítulo pt-BR.
  - Week navigator com ChevronLeft/Right e format(startOfWeek, ..., {locale: ptBR}).
  - Mini-calendário 7 células (grid-cols-7) com inicial do dia (EEEEE ptBR), número, e mood dot colorido (cor de MOODS). Hoje destacado em gold.
  - Sheet bottom (side="bottom") por dia: MoodPicker + 5 Sliders (Ansiedade=vermillion, Energia=gold, Sono=mist, Estresse=copper, Motivação=jade) com badge numérico colorido, brush zh no label, textarea "O que aconteceu hoje?" e EchoButton jade "Salvar registro". Slider com track bg-white/10 e range/thumb colorido por dimensão via Tailwind arbitrary variants `[&_[data-slot=slider-range]]:bg-[var(--dim)]`.
  - Gráfico AreaChart (14 dias) com gradient jade→transparent, connectNulls para dias sem registro, tooltip pt-BR bg #12121E.
  - Lista de entradas recentes (max-h-72 overflow echo-no-scrollbar) com EchoCard por entrada: data capitalize (EEEE d 'de' MMMM), emoji, note line-clamp-2, chips vermillion/gold/mist.
  - Root max-w-md mx-auto px-4 pb-28 pt-4. Mobile-first. Tudo lido do store via useEcho.
- Criado `src/components/echo/screens/insights-screen.tsx`:
  - Header "Insights" + brush 觀 + SealStamp 觀 + subtítulo.
  - EchoButton outline "Gerar novos" → POST /api/echo/insights com {userName, diary: Object.values(diary), recentConversations: conversations.slice(0,6), patterns}. Estado loading com Loader2 spinner. Toast de sucesso/falha via useToast.
  - Lista de insights (max-h-[28rem] overflow echo-no-scrollbar) com EchoCard por insight: ícone contextual (Search/Trophy/AlertTriangle/Eye), badge colorida, label, conteúdo echo-display text-base, data relativa pt-BR (há X dias), botão ghost "Dispensar" → dismissInsight(id). Filtro dismissed=false. Empty state com SealStamp 靜 e mensagem acolhedora. framer-motion stagger delay i*0.05.
  - Grid 2x2 de LineCharts (28 dias): Humor jade, Ansiedade vermillion, Energia gold, Sono mist. ResponsiveContainer height=90, connectNulls, tooltip pt-BR.
  - EchoCard "Seus padrões" com brush 相 + chips: padrões (gold), forças (jade), desafios (vermillion).
  - Linha do tempo horizontal (90 dias): flex overflow-x-auto echo-no-scrollbar, cada dia = div 4px com altura ∝ mood e cor por nível (MOOD_COLOR[0..4] mapeando 1..5). Title attribute com data pt-BR + humor. Hover scale-y-110.
  - Mesmas regras de design: max-w-md mx-auto, px-4 pb-28 pt-4, paleta jade/copper/gold/vermillion/mist, brush chars 觀 察 變 相 時, sem azul/índigo.
- Lint OK: `bun run lint` 0 erros.

Stage Summary:
- 2 arquivos criados exatamente nos paths solicitados, ambos com `export function <Name>()` e `export default`. Ambos `'use client'`, sem props, lendo 100% do store useEcho.
- Design wuxia-brasileirado consistente: selos vermelhos (記/觀/靜), brush chars (日/心/情/虑/氣/息/緊/志/記/筆/觀/察/變/相/時/勝/警), paleta jade/copper/gold/vermillion/mist, sem azul/índigo.
- Charts recharts em dark theme: grid rgba(255,255,255,0.05), eixos #9A9AB0, tooltip bg #12121E border white/10.
- Componentes reutilizados: EchoCard/EchoCardHeader/EchoButton/EchoChip/MoodPicker+MOODS/SealStamp/Sheet/Slider/Textarea. date-fns com locale ptBR para todos os formatos de data.
- Pronto para integração no page.tsx pelo orchestrator (import { DiaryScreen } from "@/components/echo/screens/diary-screen"; import { InsightsScreen } from "@/components/echo/screens/insights-screen").

---
Task ID: 7-a
Agent: full-stack-developer (Profile + Goals + Emergency)
Task: Build ProfileScreen, GoalsScreen, EmergencyScreen

Work Log:
- Lido worklog.md completo para herdar tema, tokens, store API, prompts API e componentes UI compartilhados.
- Inspecionados EchoCard/EchoCardHeader, EchoButton, EchoChip, SealStamp, BreathingAnimation, dialog/progress/slider/input para casar com a API existente.
- Criado `/src/components/echo/screens/profile-screen.tsx`:
  - Hero card com avatar (anel jade→copper + inicial echo-display), nome, "Cultivando há X dias", premium chip gold, SealStamp "我" no canto.
  - Fortalezas (glow jade, brush "力"): cada força com Sparkles + barra fina jade (60–95% estável por hash do nome).
  - Desafios (glow vermillion, brush "難"): cada desafio com Mountain + chip de frequência derivado por hash (frequente/às vezes/raro).
  - Radar de 6 dimensões (Relacionamentos, Família, Carreira, Saúde, Autoestima, Espiritualidade) — Saúde e Autoestima calculados do diário (avg sleep+energy *10 e avg mood *20), demais por hash estável do nome. Jade fill 0.32 opacidade.
  - Grid 3 colunas com StatCards (Conversas, Diário, Dias) — tons jade/copper/gold.
  - Botão "Exportar relatório" variant=gold: gated por premium (setOverlay('premium') + toast) ou toast demo.
- Criado `/src/components/echo/screens/goals-screen.tsx`:
  - Header com SealStamp "願", título echo-display, subtítulo.
  - Botões "Sugerir com IA" (outline) → chama /api/echo/goals-suggest, abre Dialog com 3 metas + botões "Adicionar" (estado "Adicionada" após clique) e loader.
  - Botão "Nova meta" (jade) → abre Dialog com form (title/description/targetDate) → addGoal + toast.
  - Lista de metas ativas/pausadas em EchoCard glow=copper: título echo-display, descrição muted, Progress + %, data alvo (format ptBR) + chip "Nd restantes"/"hoje"/"vencida", status chip, actions: +10% (auto-complete em 100), Concluir (verde), Pausar/Retomar, Excluir (vermelho).
  - Concluídas em seção separada com check jade + line-through + chip "feito".
  - Empty state com SealStamp "空" + CTA gold.
- Criado `/src/components/echo/screens/emergency-screen.tsx`:
  - Overlay full-screen `fixed inset-0 z-50 echo-ink-bg echo-no-scrollbar overflow-y-auto`, X no canto sup-direito chama setOverlay(null).
  - Hero: SealStamp "救" 72px + "Você não está sozinho" + subtítulo calmo.
  - CVV card (filigree + glow vermillion): "188" shimmer-gold 5xl, "Centro de Valorização da Vida", "Gratuito · 24h · sigiloso", botão vermillion "Ligar agora" → tel:188 via window.location.href.
  - CAPS card (glow copper): se nearestCaps setado mostra + link "Buscar no mapa" (Google Maps); senão Input + salvar + link mapa.
  - Contato de confiança (glow jade): se setado mostra nome/telefone + botão "Ligar"; senão form (nome + tel) → setProfile({trustedContact}).
  - Respiração: EchoCard glass com brush "息" + BreathingAnimation.
  - Footer calmo em pt-BR.
- Rodado `bun run lint` → sem erros.

Stage Summary:
- 3 telas criadas em `src/components/echo/screens/`: profile-screen.tsx, goals-screen.tsx, emergency-screen.tsx. Todas `'use client'`, export nomeado + default, sem props (leem do store `useEcho`).
- Design wuxia-brasileirado consistente: echo-display títulos, echo-brush chars (力 難 盾 我 願 空 救 息), palette jade/copper/gold/vermillion/mist, EchoCard com glow temático, framer-motion entrance animations com ease [0.22,1,0.36,1], pb-28 no profile/goals (emergency é full-screen overlay).
- Decisões de implementação:
  - Valores do radar: Saúde/Autoestima derivados do diário real (quando há entries); demais dims por hash estável do nome do usuário para evitar flutuar entre renders.
  - Frequência de desafios e valor de fortalezas derivados por hash do nome (estáveis por sessão).
  - `tel:` implementado via `window.location.href` (EchoButton não suporta asChild) — funciona em mobile, abre app compatível em desktop.
  - Ações de meta: +10% auto-promove para "concluida" em 100%; pausar/retomar toggle; excluir direto (com toast).
  - Empty state de goals com CTA "Sugerir com IA" para redução de fricção.
  - Telas usam selectors individuais `useEcho(s => s.x)` para minimizar re-renders.
- Lint passou limpo. Pronto para ser conectado ao page.tsx pelo próximo agente.

---
Task ID: 5-9 (orchestrator)
Agent: orchestrator
Task: App shell, bottom nav, page.tsx orchestrator, HomeScreen, ChatScreen, onboarding, manifest, integração final, verificação E2E

Work Log:
- BottomNav (5 tabs com brush chars 家話記觀我 + glow ativo por cor)
- page.tsx orchestrator: InkBackground global, AnimatePresence entre tabs, overlay renderer (emergency/goals/settings/premium/guide), theme+fontScale aplicados no <html>
- OnboardingScreen: 4 slides wuxia (心/道/三/密) + coleta de nome + escolha de modo, com SealStamp, ModeSelector e frases brasileiras
- HomeScreen: saudação por horário + check-in humor + card quick-chat com frase rotativa + insight do dia + meta atual com progresso + cards Diário/Publicar + selo 修心
- ChatScreen: header ECHO + mode selector expansível + 4 suggestion chips + input com VoiceButton + Send + streaming SSE real + typing indicator + auto-scroll + TTS automático + botão Emergência flutuante + MessageBubble com tags emocionais
- Fix: tracking do id da mensagem assistente (addMessage gera id — lê do estado após adicionar)
- Fix: lint (GreetingIcon como componente estático; removeu eslint-disable unused)
- manifest.json (PWA pt-BR) + allowedDevOrigins no next.config
- Verificação E2E com agent-browser (iPhone 14):
  * Onboarding: Pular → nome "Marina" → Começar ✓
  * Home: saudação "Marina心", 5 moods, insight, meta, nav 5 tabs ✓
  * Chat: envio "hoje acordei ansioso sem motivo claro" → ECHO respondeu via LLM streaming: "Ansiedade sem motivo é como uma nuvem que se forma no céu azul. Não precisa de um motivo para estar ali, só precisa de um espaço para passar. O que seu corpo está tentando te dizer hoje, enquanto sua mente busca uma razão?" ✓ (personalidade wuxia-brasileira perfeita)
  * Diary, Insights, Profile: renderizam sem erros ✓
  * Emergency overlay: abre ✓
  * Guide overlay (GitHub+CodeSandbox+APK): abre ✓
  * Screenshots salvos em /home/z/my-project/screenshots/01-07
- API chat testada via curl: streaming SSE funcional (meta → tokens → done com tags)

Stage Summary:
- APP COMPLETO E FUNCIONAL end-to-end. LLM (z-ai-web-dev-sdk) integrado com personalidade ECHO de 3 modos, streaming, detecção de crise, tags emocionais, TTS pt-BR.
- 11 telas: Onboarding, Home, Chat, Diary, Insights, Profile, Goals, Emergency, Settings, Premium, Guide.
- Tema wuxia-brasileirado coeso: tinta nanquim, montanhas, lua, selos vermelhos (心/道/柔/剛/氣/回/記/觀/我/救/願/息), jade/cobre/ouro/vermillion, fontes Cormorant+DM Sans+Ma Shan Zheng.
- Lint limpo. Dev server compila sem erros.
- LIMITAÇÃO conhecida: o sandbox mata processos background entre comandos bash. O cron job webDevReview (15 min) reinicia/verifica o servidor. O desenvolvedor deve rodar `bun run dev` para preview local.
- Próxima fase (cron): estabilizar, adicionar mais features (voice-chat screen dedicada, notificações locais reais, exportação PDF real, mais animações), refinar detalhes visuais.

