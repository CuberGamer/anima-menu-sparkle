import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DoorOpen,
} from "lucide-react";

import { sfx } from "@/lib/sfx";
import { currentSaveName } from "@/lib/saves";
import { GAME_TEXTURE_VARS } from "@/lib/textures";
import { RotateGate } from "./RotateGate";
import { PixelButton } from "./PixelButton";
import { QUESTS, SCENES, START_SCENE, type Dir, type Hotspot } from "@/lib/world";
import minimapAsset from "@/assets/minimap.png.asset.json";

const ARROWS: Record<Dir, typeof ChevronUp> = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
};

export function WorldMap() {
  const [sceneId, setSceneId] = useState(START_SCENE);
  const [saveName, setSaveName] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>(["carta"]);
  const [talking, setTalking] = useState<{ hotspot: Hotspot; line: number } | null>(null);

  const scene = SCENES[sceneId]!;

  useEffect(() => {
    setSaveName(currentSaveName());
  }, []);

  const quests = useMemo(
    () => QUESTS.filter((q) => active.includes(q.id) || done.includes(q.id)),
    [active, done],
  );

  const go = (to: string) => {
    sfx.click();
    setTalking(null);
    setSceneId(to);
  };

  const interact = (h: Hotspot) => {
    sfx.click();
    setTalking({ hotspot: h, line: 0 });
    if (h.gives && !inventory.includes(h.gives)) setInventory((i) => [...i, h.gives!]);
    if (h.completes) {
      setDone((d) => (d.includes(h.completes!) ? d : [...d, h.completes!]));
      setActive((a) => a.filter((id) => id !== h.completes));
    }
    if (h.starts) setActive((a) => (a.includes(h.starts!) ? a : [...a, h.starts!]));
  };

  const advance = () => {
    if (!talking) return;
    sfx.tick();
    const next = talking.line + 1;
    if (next >= talking.hotspot.lines.length) setTalking(null);
    else setTalking({ ...talking, line: next });
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[var(--panel-frame)]" style={GAME_TEXTURE_VARS}>
      <RotateGate />

      <section className="relative mx-auto h-[100svh] w-full max-w-[1600px]">
        <img
          key={scene.id}
          src={scene.image}
          alt={`Escena ${scene.name} del pueblo en pixel art`}
          width={1536}
          height={864}
          className="animate-panel-pop absolute inset-0 size-full object-cover [image-rendering:pixelated]"
        />
        <div className="texture-noise pointer-events-none absolute inset-0" />

        {/* Hotspots interactuables */}
        {scene.hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => interact(h)}
            onMouseEnter={() => sfx.hover()}
            aria-label={`Interactuar con ${h.label}`}
            className="group absolute -translate-x-1/2 touch-manipulation"
            style={{ left: `${h.x}%`, top: `${h.y}%`, height: `${h.size ?? 22}%`, transform: "translate(-50%,-85%)" }}
          >
            <img
              src={h.sprite}
              alt={h.label}
              loading="lazy"
              className={
                "h-full w-auto drop-shadow-[4px_6px_0_oklch(0_0_0/0.45)] transition-transform [image-rendering:pixelated] group-hover:scale-110 " +
                (h.kind === "npc" ? "animate-sprite-bob" : "")
              }
            />
            <span className="card-sprite pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap px-2 py-0.5 text-[9px] text-primary-foreground group-hover:block">
              {h.label}
            </span>
          </button>
        ))}

        {/* Personaje jugable con hoja de sprites */}
        <div
          key={`player-${scene.id}`}
          aria-hidden
          className="player-sprite player-sprite-walk pointer-events-none absolute bottom-[6%] left-1/2 h-[26%] w-auto -translate-x-1/2 drop-shadow-[4px_6px_0_oklch(0_0_0/0.45)]"
          style={{ aspectRatio: "160 / 512" }}
        />


        {/* Flechas de movimiento */}
        {scene.exits.map((e) => {
          const Icon = ARROWS[e.dir];
          return (
            <button
              key={e.to + e.dir}
              type="button"
              onClick={() => go(e.to)}
              onMouseEnter={() => sfx.hover()}
              aria-label={e.label}
              className="key-sprite absolute flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform hover:scale-110 active:scale-95 sm:size-16"
              style={{ left: `${e.x}%`, top: `${e.y}%` }}
            >
              <Icon className="size-7 text-secondary-foreground" aria-hidden />
            </button>
          );
        })}

        {/* Panel de misiones */}
        <aside className="card-sprite absolute left-2 top-2 w-40 px-2 py-2 sm:left-4 sm:top-4 sm:w-56 sm:px-3">
          <h2 className="mb-2 text-[10px] text-primary-foreground sm:text-sm">
            MISIONES
          </h2>
          <ul className="space-y-2">
            {quests.map((q) => (
              <li key={q.id} className="text-[8px] leading-relaxed sm:text-[10px]">
                <p
                  className={
                    done.includes(q.id)
                      ? "text-muted-foreground line-through"
                      : "text-primary-foreground"
                  }
                >
                  • {q.title}
                </p>
                {!done.includes(q.id) && (
                  <p className="pl-2 text-[7px] text-muted-foreground sm:text-[9px]">{q.detail}</p>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Minimapa */}
        <div className="absolute right-2 top-2 sm:right-4 sm:top-4">
          <div className="relative size-24 sm:size-36">
            <img
              src={minimapAsset.url}
              alt="Minimapa del pueblo"
              width={816}
              height={816}
              loading="lazy"
              className="size-full [image-rendering:pixelated]"
            />
            {Object.values(SCENES).map((s) => (
              <span
                key={s.id}
                aria-hidden
                className={
                  "absolute size-2 -translate-x-1/2 -translate-y-1/2 sm:size-3 " +
                  (s.id === scene.id
                    ? "animate-flicker bg-destructive ring-1 ring-primary"
                    : "bg-[var(--panel-frame)]/70")
                }
                style={{ left: `${s.map.x}%`, top: `${s.map.y}%` }}
              />
            ))}
          </div>
          <p className="text-pixel-shadow mt-1 text-center text-[8px] text-primary sm:text-[10px]">
            {scene.name}
          </p>
        </div>

        {/* Inventario */}
        <aside className="dark-sprite absolute bottom-2 right-2 w-36 px-2 py-1 sm:bottom-4 sm:right-4 sm:w-52">
          <h2 className="mb-1 text-[9px] text-primary sm:text-xs">INVENTARIO</h2>
          {inventory.length === 0 ? (
            <p className="text-[7px] text-muted-foreground sm:text-[9px]">VACIO</p>
          ) : (
            <ul className="flex flex-wrap gap-1">
              {inventory.map((it) => (
                <li
                  key={it}
                  className="card-sprite px-1 py-0.5 text-[7px] text-primary-foreground sm:text-[9px]"
                >
                  {it}
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Volver al menu */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
          <Link to="/">
            <PixelButton size="sm" className="flex items-center gap-2">
              <DoorOpen className="size-4" aria-hidden />
              <span className="hidden sm:inline">MENU</span>
            </PixelButton>
          </Link>
          {saveName && (
            <p className="text-pixel-shadow mt-1 text-[8px] text-primary sm:text-[10px]">
              {saveName}
            </p>
          )}
        </div>

        {/* Dialogo */}
        {talking && (
          <button
            type="button"
            onClick={advance}
            className="absolute inset-x-2 bottom-16 mx-auto flex max-w-2xl sm:inset-x-0 sm:bottom-24"
            aria-label="Continuar dialogo"
          >
            <span className="card-sprite animate-panel-pop w-full px-3 py-3 text-left sm:px-5 sm:py-4">
              <span className="block text-[9px] leading-relaxed text-primary-foreground sm:text-sm">
                {talking.hotspot.lines[talking.line]}
              </span>
              <span className="mt-2 block text-right text-[8px] text-muted-foreground sm:text-[10px]">
                TOCA PARA CONTINUAR ▶
              </span>
            </span>
          </button>
        )}
      </section>
    </main>
  );
}
