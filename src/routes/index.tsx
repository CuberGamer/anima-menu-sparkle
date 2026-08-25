import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DoorOpen, FileText, Image as ImageIcon, LogOut, Pencil } from "lucide-react";
import { PixelButton } from "@/components/game/PixelButton";
import { sfx } from "@/lib/sfx";
import { loadSaves, saveSaves, type SaveGame } from "@/lib/saves";

import bgImage from "@/assets/menu-bg.jpg";
import logoImage from "@/assets/logo.png";
import generalImage from "@/assets/general.png";
import { GAME_TEXTURE_VARS } from "@/lib/textures";
import { RotateGate } from "@/components/game/RotateGate";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen = "menu" | "config" | "creditos" | "partidas";

const KEYS_TOP = ["W", "X"];
const KEYS_BOTTOM = ["A", "S", "D", "F", "C"];



function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="animate-panel-pop panel-sprite w-full max-w-4xl p-4 sm:p-10">
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
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("menu");
  const [volume, setVolume] = useState(30);

  const [saves, setSaves] = useState<SaveGame[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const selectedSave = saves.find((s) => s.id === selected) ?? null;

  useEffect(() => {
    const list = loadSaves();
    setSaves(list);
    setSelected(list[0]?.id ?? null);
  }, []);

  const persist = (list: SaveGame[]) => {
    setSaves(list);
    saveSaves(list);
  };

  const createSave = () => {
    const id = `s${Date.now()}`;
    const next: SaveGame = {
      id,
      name: `PARTIDA ${saves.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    persist([...saves, next]);
    setSelected(id);
    setEditingId(id);
    setDraft(next.name);
  };

  const deleteSave = () => {
    if (!selected) return;
    const list = saves.filter((s) => s.id !== selected);
    persist(list);
    setSelected(list[0]?.id ?? null);
  };

  const commitName = () => {
    if (!editingId) return;
    const name = draft.trim().slice(0, 18) || "PARTIDA";
    persist(saves.map((s) => (s.id === editingId ? { ...s, name } : s)));
    setEditingId(null);
  };

  const play = () => {
    if (!selected) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("infiltrados:slot", selected);
    }
    navigate({ to: "/tablero" });
  };

  return (
    <main
      className="relative min-h-[100svh] overflow-x-hidden overscroll-none"
      style={GAME_TEXTURE_VARS}
    >
      <RotateGate />
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
            <Panel title="GESTOR DE PARTIDAS">
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                <div className="flex flex-col gap-4">
                  <div className="dark-sprite flex aspect-[4/3] flex-col items-center justify-center gap-3 p-2">
                    {selectedSave ? (
                      <>
                        <ImageIcon className="size-12 text-muted-foreground" aria-hidden />
                        <p className="text-[10px] text-muted-foreground sm:text-xs">
                          PARTIDA SELECCIONADA
                        </p>
                        <p className="text-gold-texture text-center text-sm sm:text-base">
                          {selectedSave.name}
                        </p>
                      </>
                    ) : (
                      <p className="px-4 text-center text-[10px] text-muted-foreground sm:text-xs">
                        SIN PARTIDA SELECCIONADA
                      </p>
                    )}
                  </div>

                  <PixelButton
                    size="md"
                    onClick={play}
                    disabled={!selected}
                    className="animate-slide-left w-full disabled:opacity-50"
                  >
                    JUGAR
                  </PixelButton>
                  <PixelButton
                    size="md"
                    onClick={createSave}
                    className="animate-slide-left w-full"
                    style={{ animationDelay: "0.1s" }}
                  >
                    NUEVA PARTIDA
                  </PixelButton>
                  <PixelButton
                    size="md"
                    onClick={deleteSave}
                    disabled={!selected}
                    className="animate-slide-left w-full text-destructive disabled:opacity-50"
                    style={{ animationDelay: "0.18s" }}
                  >
                    ELIMINAR
                  </PixelButton>

                  <div className="mt-2 flex">
                    <PixelButton
                      size="sm"
                      onClick={() => setScreen("menu")}
                      aria-label="Volver al menu"
                      className="flex items-center justify-center"
                    >
                      <LogOut className="size-5" aria-hidden />
                    </PixelButton>
                  </div>
                </div>

                <div className="dark-sprite max-h-[22rem] min-h-[16rem] overflow-y-auto p-2">
                  {saves.length === 0 ? (
                    <p className="p-6 text-center text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                      NO HAY PARTIDAS.
                      <br />
                      CREA UNA NUEVA PARA EMPEZAR.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {saves.map((s, i) => (
                        <li key={s.id}>
                          <div
                            className={
                              "card-sprite animate-panel-pop flex items-center gap-2 px-2 py-1 transition-all " +
                              (selected === s.id
                                ? "btn-sprite-gold translate-x-1 scale-[1.02] shadow-lg"
                                : "opacity-80 hover:opacity-100")
                            }
                            style={{ animationDelay: `${i * 0.06}s` }}
                          >
                            {selected === s.id && !editingId && (
                              <span className="shrink-0 text-[10px] text-primary-foreground">▶</span>
                            )}
                            {editingId === s.id ? (
                              <input
                                autoFocus
                                value={draft}
                                maxLength={18}
                                onChange={(e) => setDraft(e.target.value.toUpperCase())}
                                onBlur={commitName}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitName();
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                aria-label="Nombre de la partida"
                                className="w-full bg-transparent text-[10px] text-primary-foreground outline-none sm:text-xs"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  sfx.click();
                                  setSelected(s.id);
                                }}
                                onMouseEnter={() => sfx.hover()}
                                aria-pressed={selected === s.id}
                                className="min-w-0 flex-1 truncate text-left text-[10px] text-primary-foreground sm:text-xs"
                              >
                                {s.name}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                sfx.click();
                                setSelected(s.id);
                                setEditingId(s.id);
                                setDraft(s.name);
                              }}
                              aria-label={`Editar ${s.name}`}
                              className="key-sprite flex size-8 shrink-0 items-center justify-center"
                            >
                              <Pencil className="size-3 text-secondary-foreground" aria-hidden />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
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
      className="animate-key-press key-sprite flex size-12 items-center justify-center text-lg text-secondary-foreground transition-all duration-100"
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
