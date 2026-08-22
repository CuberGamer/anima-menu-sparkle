import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DoorOpen, FileText, Folder } from "lucide-react";
import { PixelButton } from "@/components/game/PixelButton";
import { sfx } from "@/lib/sfx";

import bgImage from "@/assets/menu-bg.jpg";
import logoImage from "@/assets/logo.png";
import texParchment from "@/assets/tex-parchment.png";
import texPanel from "@/assets/tex-panel.jpg";
import texGold from "@/assets/tex-gold.jpg";
import generalImage from "@/assets/general.png";
import btnFrame from "@/assets/btn-frame.png.asset.json";
import btnFrameGold from "@/assets/btn-frame-gold.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Infiltrados — Menu principal" },
      {
        name: "description",
        content:
          "Menu del videojuego Infiltrados: jugar, configuracion, creditos y gestor de partidas en pixel art.",
      },
      { property: "og:title", content: "Infiltrados — Menu principal" },
      {
        property: "og:description",
        content: "Juego de espionaje pixel art ambientado en la frontera argentina del 1800.",
      },
    ],
  }),
  component: Index,
});

type Screen = "menu" | "config" | "creditos" | "partidas";

const KEYS_TOP = ["W", "X"];
const KEYS_BOTTOM = ["A", "S", "D", "F", "C"];

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="animate-panel-pop pixel-panel texture-panel w-full max-w-4xl p-4 sm:p-10">
      {title && (
        <h2 className="animate-title-in text-gold-texture mb-6 text-center text-xl sm:mb-8 sm:text-4xl">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}


function BackButton({ onClick, label = "VOLVER" }: { onClick: () => void; label?: string }) {
  return (
    <PixelButton size="sm" onClick={onClick} className="flex flex-col items-center gap-1">
      <span>{label}</span>
      <DoorOpen className="size-5" aria-hidden />
    </PixelButton>
  );
}

function Index() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [volume, setVolume] = useState(30);
  const [partida, setPartida] = useState(1);

  return (
    <main
      className="relative min-h-[100svh] overflow-x-hidden overscroll-none"
      style={
        {
          "--tex-parchment": `url(${texParchment})`,
          "--tex-panel": `url(${texPanel})`,
          "--tex-gold": `url(${texGold})`,
          "--tex-btn": `url(${btnFrame.url})`,
          "--tex-btn-gold": `url(${btnFrameGold.url})`,
        } as React.CSSProperties
      }
    >
      <img
        src={bgImage}
        alt="Aldea de frontera argentina al atardecer en pixel art"
        width={1920}
        height={1088}
        className="animate-hero-pan fixed inset-0 size-full object-cover"
      />
      <div className="fixed inset-0 bg-[var(--panel-frame)]/35" />
      <div className="texture-noise pointer-events-none fixed inset-0" />
      <div className="animate-scan pointer-events-none fixed inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-foreground/5 to-transparent" />

      {screen === "menu" ? (
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between gap-8 p-4 py-6 sm:p-12">
          <h1 className="animate-title-in flex items-center gap-3 text-2xl sm:gap-4 sm:text-6xl lg:text-7xl">
            <span className="text-gold-texture min-w-0 break-words">INFILTRADOS</span>
            <img
              src={logoImage}
              alt="Escudo de Infiltrados"
              width={816}
              height={816}
              className="animate-float-hat size-12 shrink-0 sm:size-24"
            />
          </h1>

          <nav className="flex w-full max-w-full flex-col gap-3 sm:max-w-xs sm:gap-5">
            {(
              [
                ["JUGAR", () => setScreen("partidas")],
                ["CONFIGURACION", () => setScreen("config")],
                ["SALIR", () => setScreen("menu")],
              ] as const
            ).map(([label, action], i) => (
              <PixelButton
                key={label}
                onClick={action}
                className="animate-slide-left w-full"
                style={{ animationDelay: `${0.15 * i + 0.2}s` }}
              >
                {label}
              </PixelButton>
            ))}
          </nav>

          <div className="flex justify-end">
            <PixelButton
              size="sm"
              onClick={() => setScreen("creditos")}
              className="relative z-20 flex flex-col items-center gap-1"
            >
              <span>CREDITOS</span>
              <FileText className="size-5" aria-hidden />
            </PixelButton>
          </div>

          <img
            src={generalImage}
            alt="General argentino del 1800 en pixel art"
            width={500}
            height={500}
            loading="lazy"
            className="animate-flicker pointer-events-none absolute bottom-0 right-[14%] hidden h-[68vh] w-auto drop-shadow-[0_0_24px_oklch(0_0_0/0.7)] lg:block"
          />

        </div>
      ) : (
        <div className="relative z-10 flex min-h-[100svh] items-center justify-center p-3 py-6 sm:p-6">

          {screen === "config" && (
            <Panel title="CONFIGURACIONES">
              <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
                <div>
                  <h3 className="text-pixel-shadow mb-4 text-center text-base text-card-foreground sm:mb-6 sm:text-xl">
                    CONTROLES
                  </h3>
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="flex gap-8 sm:gap-14">
                      {KEYS_TOP.map((k, i) => (
                        <Key key={k} label={k} delay={i * 0.2} />
                      ))}
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      {KEYS_BOTTOM.map((k, i) => (
                        <Key key={k} label={k} delay={i * 0.15} />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-pixel-shadow mb-4 text-center text-base text-card-foreground sm:mb-6 sm:text-xl">
                    SONIDO
                  </h3>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      sfx.tick();
                    }}
                    aria-label="Volumen"
                    className="w-full accent-[var(--panel-highlight)]"
                  />

                  <p className="mt-4 text-center text-sm text-muted-foreground">{volume}%</p>
                </div>
              </div>
              <div className="mt-10">
                <BackButton onClick={() => setScreen("menu")} />
              </div>
            </Panel>
          )}

          {screen === "creditos" && (
            <Panel title="CREDITOS">
              <div className="space-y-6 text-center text-card-foreground">
                <Credit
                  title="DESARROLLO VISUAL:"
                  names={["MATEO SILES", "KEVIN HUANCA", "MALENA URZAGASTI", "AXEL ARICOMA"]}
                />
                <Credit title="DIALOGOS:" names={["KEVIN HUANCA", "MALENA URZAGASTI"]} />
                <Credit title="PROGRAMACION:" names={["MATEO SILES"]} />
              </div>
              <div className="mt-10">
                <BackButton onClick={() => setScreen("menu")} />
              </div>
            </Panel>
          )}

          {screen === "partidas" && (
            <Panel>
              <div className="grid gap-10 sm:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <PixelButton className="animate-slide-left">JUGAR PARTIDA</PixelButton>
                  <PixelButton
                    className="animate-slide-left"
                    style={{ animationDelay: "0.12s" }}
                  >
                    NUEVA
                  </PixelButton>
                  <PixelButton
                    className="animate-slide-left"
                    style={{ animationDelay: "0.24s" }}
                  >
                    ELIMINAR
                  </PixelButton>
                  <div className="mt-4">
                    <BackButton onClick={() => setScreen("menu")} label="SALIR" />
                  </div>
                </div>
                <div className="bg-[var(--panel-frame)] p-3">
                  <div className="flex flex-col gap-4 bg-[var(--panel-highlight)] p-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex items-center gap-3">
                        <Folder className="size-8 shrink-0 text-primary-foreground" aria-hidden />
                        <PixelButton
                          size="md"
                          onClick={() => setPartida(n)}
                          aria-pressed={partida === n}
                          className={
                            partida === n
                              ? "w-full btn-sprite-gold animate-panel-pop"
                              : "w-full animate-panel-pop"
                          }
                          style={{ animationDelay: `${n * 0.08}s` }}
                        >
                          PARTIDA {n}
                        </PixelButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </div>
      )}
    </main>
  );
}

function Key({ label, delay }: { label: string; delay: number }) {
  return (
    <span
      onMouseEnter={() => sfx.tick()}
      className="animate-key-press texture-panel border-tex hover:texture-gold hover:border-tex-hover flex size-12 items-center justify-center border-[10px] text-lg text-foreground shadow-[var(--shadow-key)] transition-all duration-100"
      style={{ animationDelay: `${delay}s` }}
    >
      {label}
    </span>
  );
}


function Credit({ title, names }: { title: string; names: string[] }) {
  return (
    <div className="animate-slide-left">
      <h3 className="text-pixel-shadow text-xl">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
