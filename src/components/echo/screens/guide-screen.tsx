"use client";

import { motion } from "framer-motion";
import { X, Github, Box, Smartphone, MapPin, Info } from "lucide-react";
import { useEcho } from "@/lib/echo/store";
import { EchoCard, EchoCardHeader } from "../ui/echo-card";
import { EchoButton } from "../ui/echo-button";
import { SealStamp } from "../ui/seal-stamp";

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="echo-seal flex h-8 w-8 shrink-0 items-center justify-center text-sm font-semibold"
      style={{ fontSize: 14, transform: "rotate(-3deg)" }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <StepBadge n={n} />
      <div className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </li>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-[var(--gold-soft)]">
      <code>{children}</code>
    </pre>
  );
}

export function GuideScreen() {
  const setOverlay = useEcho((s) => s.setOverlay);

  return (
    <div className="fixed inset-0 z-50 echo-ink-bg overflow-y-auto echo-no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#08080F] via-[#08080F]/95 to-transparent">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <SealStamp char="道" size={40} rotate={-4} />
            <div>
              <h1 className="echo-display text-2xl font-semibold leading-none text-foreground">
                Como publicar o ECHO
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Do código ao APK
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

      <div className="mx-auto max-w-2xl px-5 pb-16 pt-2">
        {/* Subtitle / intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 mt-2"
        >
          <EchoCard glass className="p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="echo-brush text-xl text-[var(--gold)]">
                道
              </span>{" "}
              Passo a passo completo pra colocar o ECHO no ar: do{" "}
              <span className="text-foreground">GitHub</span> ao{" "}
              <span className="text-foreground">CodeSandbox</span> e, por fim,
              num <span className="text-foreground">APK instalável</span> no
              celular. Três trilhas. Uma só viagem.
            </p>
          </EchoCard>
        </motion.div>

        {/* SECTION 1 — GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <EchoCard filigree glow="copper">
            <EchoCardHeader
              title={
                <span>
                  <span className="echo-brush text-lg text-[var(--mist)]">
                    一
                  </span>{" "}
                  Colocar no GitHub
                </span>
              }
              subtitle="Seu código, num lugar seguro"
              icon={<Github className="h-5 w-5" />}
              accent="copper"
            />
            <ol className="space-y-3.5">
              <Step n={1}>
                Crie uma conta em{" "}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--gold)] underline decoration-dotted underline-offset-2"
                >
                  github.com
                </a>{" "}
                (grátis) se ainda não tiver.
              </Step>
              <Step n={2}>
                Crie um novo repositório: clique no <strong className="text-foreground">+</strong> no
                canto superior direito → <strong className="text-foreground">New repository</strong>.
              </Step>
              <Step n={3}>
                Nome: <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">echo-wuxia</code>{" "}
                (ou o que quiser). Marque{" "}
                <strong className="text-foreground">Private</strong> se não quer
                compartilhar. <strong>NÃO</strong> marque "Add README" (vamos
                enviar tudo).
              </Step>
              <Step n={4}>
                No seu computador, na pasta do projeto, abra o terminal:
                <div className="mt-2">
                  <CodeBlock>{`git init
git add .
git commit -m "ECHO — versão inicial wuxia-brasileirada"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/echo-wuxia.git
git push -u origin main`}</CodeBlock>
                </div>
              </Step>
              <Step n={5}>
                Pronto. Seu código está no GitHub.{" "}
                <span className="text-foreground">
                  Guarde a URL do repo.
                </span>
              </Step>
            </ol>
          </EchoCard>
        </motion.div>

        {/* SECTION 2 — CodeSandbox */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <EchoCard filigree glow="jade">
            <EchoCardHeader
              title={
                <span>
                  <span className="echo-brush text-lg text-[var(--jade)]">
                    二
                  </span>{" "}
                  Abrir no CodeSandbox
                </span>
              }
              subtitle="Teste e compartilhe no navegador"
              icon={<Box className="h-5 w-5" />}
              accent="jade"
            />
            <ol className="space-y-3.5">
              <Step n={1}>
                Acesse{" "}
                <a
                  href="https://codesandbox.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--jade)] underline decoration-dotted underline-offset-2"
                >
                  codesandbox.io
                </a>{" "}
                e faça login (pode ser com GitHub).
              </Step>
              <Step n={2}>
                Clique em <strong className="text-foreground">Create Sandbox</strong> →
                aba <strong className="text-foreground">Import</strong>.
              </Step>
              <Step n={3}>
                Cole a URL do seu repositório GitHub (ex:{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">
                  https://github.com/SEU-USUARIO/echo-wuxia
                </code>
                ).
              </Step>
              <Step n={4}>
                Selecione a opção <strong className="text-foreground">Next.js</strong>{" "}
                se perguntar. Clique em <strong className="text-foreground">Import</strong>.
              </Step>
              <Step n={5}>
                O CodeSandbox abre o projeto rodando num preview à direita.
                Edite arquivos à esquerda e veja o live reload.
              </Step>
              <Step n={6}>
                Para compartir: botão{" "}
                <strong className="text-foreground">Share</strong> no topo →
                copie o link do sandbox.
              </Step>
              <Step n={7}>
                <span className="text-foreground">Dica:</span> o plano grátis do
                CodeSandbox roda Next.js em container. Se pedir "Define Devbox",
                aceite (é o modo Next.js 16).
              </Step>
            </ol>
          </EchoCard>
        </motion.div>

        {/* SECTION 3 — APK via GitHub Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <EchoCard filigree glow="vermillion">
            <EchoCardHeader
              title={
                <span>
                  <span className="echo-brush text-lg text-[var(--vermillion)]">
                    三
                  </span>{" "}
                  Compilar APK no GitHub Actions
                </span>
              }
              subtitle="Web app → app Android nativo (TWA)"
              icon={<Smartphone className="h-5 w-5" />}
              accent="vermillion"
            />
            <p className="mb-4 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
              Como o ECHO é um web app Next.js, transformá-lo em APK usa{" "}
              <strong className="text-[var(--gold-soft)]">Bubblewrap</strong>{" "}
              (TWA — Trusted Web Activity): ele empacota o site publicado num
              app Android nativo.
            </p>

            <ol className="space-y-3.5">
              <Step n={1}>
                No GitHub repo, crie a pasta{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">
                  .github/workflows/
                </code>{" "}
                e um arquivo{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">
                  build-apk.yml
                </code>
                .
              </Step>
              <Step n={2}>
                Cole este workflow:
                <div className="mt-2">
                  <CodeBlock>{`name: Build APK
on:
  workflow_dispatch:
jobs:
  apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 17 }
      - name: Install Bubblewrap
        run: npm i -g @bubblewrap/cli
      - name: Init TWA (usa a URL publicada do app)
        run: |
          bubblewrap init --manifest https://SEU-DOMINIO.com/manifest.json
      - name: Build APK
        run: bubblewrap build
      - uses: actions/upload-artifact@v4
        with:
          name: echo-apk
          path: app-release-signed.apk`}</CodeBlock>
                </div>
              </Step>
              <Step n={3}>
                Em <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">manifest.json</code>{" "}
                (na pasta <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">/public</code>{" "}
                do projeto) — já existe; garanta que tem:
                <div className="mt-2">
                  <CodeBlock>{`{
  "name": "ECHO",
  "short_name": "ECHO",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#08080F",
  "background_color": "#08080F",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}`}</CodeBlock>
                </div>
              </Step>
              <Step n={4}>
                Publique o site ({" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--gold)] underline decoration-dotted underline-offset-2"
                >
                  Vercel
                </a>{" "}
                recomendado: importe o repo, deploy automático). Use a URL
                publicada no passo{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--gold-soft)]">
                  bubblewrap init
                </code>
                .
              </Step>
              <Step n={5}>
                No GitHub, vá em <strong className="text-foreground">Actions</strong> →{" "}
                <strong className="text-foreground">Build APK</strong> →{" "}
                <strong className="text-foreground">Run workflow</strong>. Aguarde
                ~5 min.
              </Step>
              <Step n={6}>
                Baixe o APK em <strong className="text-foreground">Artifacts</strong>{" "}
                no final do run. Instale no celular (permitir "fontes
                desconhecidas").
              </Step>
              <Step n={7}>
                <span className="text-foreground">Alternativa:</span> se quiser um
                APK que não depende de URL publicada, use{" "}
                <strong className="text-[var(--gold-soft)]">Capacitor</strong>:
                <div className="mt-2">
                  <CodeBlock>{`npm i @capacitor/core @capacitor/android
npx cap init
npx cap add android
npx cap open android`}</CodeBlock>
                </div>
                Gere no Android Studio. Workflow similar no Actions.
              </Step>
            </ol>
          </EchoCard>
        </motion.div>

        {/* Final note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <EchoCard glass className="border-[var(--gold)]/20 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10">
                <Info className="h-4 w-4 text-[var(--gold)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="echo-display text-base font-semibold text-foreground">
                  <MapPin className="mr-1 inline h-3.5 w-3.5 text-[var(--gold)]" />
                  E a Play Store?
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Para publicar na Play Store, gere um{" "}
                  <strong className="text-foreground">AAB</strong> (Android App
                  Bundle) e siga as instruções em{" "}
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--gold)] underline decoration-dotted underline-offset-2"
                  >
                    play.google.com/console
                  </a>
                  . Taxa única de U$25.
                </p>
              </div>
            </div>
          </EchoCard>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <span className="echo-brush text-3xl text-[var(--vermillion)]/70">
            道
          </span>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            ECHO · o caminho se faz andando
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuideScreen;
