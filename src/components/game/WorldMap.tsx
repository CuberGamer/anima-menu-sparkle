import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorOpen, EyeOff, Timer } from "lucide-react";

import { sfx } from "@/lib/sfx";
import { currentSaveName } from "@/lib/saves";
import { GAME_TEXTURE_VARS } from "@/lib/textures";
import { RotateGate } from "./RotateGate";
import { PixelButton } from "./PixelButton";
import { StatBar } from "./StatBar";
import { GameOverlay } from "./GameOverlay";
import { DPad } from "./DPad";
import { QUESTS, SCENES, START_SCENE, type Hotspot } from "@/lib/world";
import { HERO_SPRITES } from "@/lib/hero";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
import { useGameProgress } from "@/hooks/useGameProgress";
import { distance, rectContains, type Rect } from "@/lib/collision";
import {
  MAX_SUSPICION,
  TOTAL_SECONDS,
  changeScene,
  formatClock,
  hide,
  interactWith,
} from "@/lib/progress";
import minimapAsset from "@/assets/minimap.png.asset.json";

/** Distancia maxima (en % de escena) para poder interactuar. */
const REACH = 16;

function exitRect(e: { x: number; y: number; w?: number; h?: number }): Rect {
  const w = e.w ?? 8;
  const h = e.h ?? 8;
  return { x: e.x - w / 2, y: e.y - h / 2, w, h };
}

export function WorldMap() {
  const { progress, apply, restart, restored, saveError } = useGameProgress(START_SCENE);
  const [saveName, setSaveName] = useState<string | null>(null);
  const [talking, setTalking] = useState<{ hotspot: Hotspot; line: number } | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  // Tolerancia a fallos: si el id guardado no existe, volvemos a la escena inicial.
  const scene = SCENES[progress.sceneId] ?? SCENES[START_SCENE]!;
  const playable = progress.status === "jugando";

  const { pos, facing, moving, teleport, setTouchInput } = usePlayerMovement(scene.spawn, {
    blockers: scene.blockers,
    enabled: playable && !talking,
  });

  const sceneRef = useRef(scene.id);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    setSaveName(currentSaveName());
  }, []);

  // Al cambiar de escena reposicionamos al jugador en el punto de entrada.
  useEffect(() => {
    if (sceneRef.current !== scene.id) {
      sceneRef.current = scene.id;
      teleport(scene.spawn);
    }
  }, [scene.id, scene.spawn, teleport]);

  const quests = useMemo(
    () => QUESTS.filter((q) => progress.active.includes(q.id) || progress.done.includes(q.id)),
    [progress.active, progress.done],
  );

  const showHint = useCallback((text: string) => {
    setHint(text);
    window.setTimeout(() => setHint((h) => (h === text ? null : h)), 1600);
  }, []);

  // Transicion de escena al pisar una zona de salida.
  useEffect(() => {
    if (!playable) return;
    const zone = scene.exits.find((e) => rectContains(exitRect(e), pos.x, pos.y));
    if (!zone) return;
    sfx.click();
    setTalking(null);
    apply((p) => changeScene(p, zone.to));
  }, [pos, scene.exits, playable, apply]);

  const interact = useCallback(
    (h: Hotspot) => {
      if (!playable) return;
      if (distance(posRef.current, { x: h.x, y: h.y }) > REACH) {
        sfx.tick();
        showHint(`ACERCATE A ${h.label}`);
        return;
      }
      sfx.click();
      setTalking({ hotspot: h, line: 0 });
      apply((p) => interactWith(p, h));
    },
    [apply, playable, showHint],
  );

  // Tecla de accion: interactua con lo mas cercano.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter" && e.code !== "KeyE") return;
      e.preventDefault();
      if (talking) {
        advance();
        return;
      }
      const near = scene.hotspots
        .map((h) => ({ h, d: distance(posRef.current, { x: h.x, y: h.y }) }))
        .sort((a, b) => a.d - b.d)[0];
      if (near && near.d <= REACH) interact(near.h);
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  });

  const esconderse = () => {
    if (!playable) return;
    sfx.tick();
    apply(hide);
  };

  const reintentar = () => {
    setTalking(null);
    teleport(SCENES[START_SCENE]!.spawn);
    restart();
  };

  function advance() {
    setTalking((t) => {
      if (!t) return t;
      sfx.tick();
      const next = t.line + 1;
      return next >= t.hotspot.lines.length ? null : { ...t, line: next };
    });
  }

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

        {/* Zonas de salida: se cruzan caminando */}
        {scene.exits.map((e) => {
          const r = exitRect(e);
          return (
            <div
              key={e.to + e.dir}
              aria-hidden
              className="pointer-events-none absolute flex items-end justify-center"
              style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
            >
              <span className="card-sprite animate-flicker px-1 py-0.5 text-[6px] text-primary-foreground sm:text-[8px]">
                {e.label}
              </span>
            </div>
          );
        })}

        {/* Hotspots interactuables */}
        {scene.hotspots.map((h) => {
          const near = distance(pos, { x: h.x, y: h.y }) <= REACH;
          return (
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
                  (h.kind === "npc" ? "animate-sprite-bob " : "") +
                  (near ? "" : "opacity-90")
                }
              />
              <span
                className={
                  "card-sprite pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 text-[9px] text-primary-foreground " +
                  (near ? "block" : "hidden group-hover:block")
                }
              >
                {near ? `${h.label} · [E]` : h.label}
              </span>
            </button>
          );
        })}

        {/* Personaje principal con sprites de 8 direcciones */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="card-sprite animate-sprite-bob mb-0.5 px-1.5 py-0.5 text-[7px] leading-none text-primary-foreground sm:text-[9px]">
              VOS
            </span>
            <span className="text-pixel-shadow -mt-1 text-[10px] leading-none text-primary sm:text-xs" aria-hidden>
              ▼
            </span>
          </div>
          <img
            src={HERO_SPRITES[facing]}
            alt="Personaje principal"
            width={48}
            height={48}
            className={
              "h-[20svh] w-auto drop-shadow-[4px_6px_0_oklch(0_0_0/0.45)] [image-rendering:pixelated] " +
              (moving ? "animate-hero-step" : "")
            }
          />
        </div>

        {/* Panel de misiones + estado */}
        <aside className="card-sprite absolute left-2 top-2 w-40 px-2 py-2 sm:left-4 sm:top-4 sm:w-56 sm:px-3">
          <div className="mb-2 flex items-center justify-between text-[8px] text-primary-foreground sm:text-[10px]">
            <span className="flex items-center gap-1">
              <Timer className="size-3" aria-hidden />
              {formatClock(progress.secondsLeft)}
            </span>
            <span>PTS {progress.score}</span>
          </div>
          <div className="mb-2 space-y-1">
            <StatBar
              label="SOSPECHA"
              value={progress.suspicion}
              max={MAX_SUSPICION}
              tone={progress.suspicion >= 60 ? "alert" : "calm"}
            />
            <StatBar label="TIEMPO" value={progress.secondsLeft} max={TOTAL_SECONDS} />
          </div>
          <h2 className="mb-2 text-[10px] text-primary-foreground sm:text-sm">MISIONES</h2>
          <ul className="space-y-2">
            {quests.map((q) => (
              <li key={q.id} className="text-[8px] leading-relaxed sm:text-[10px]">
                <p
                  className={
                    progress.done.includes(q.id)
                      ? "text-muted-foreground line-through"
                      : "text-primary-foreground"
                  }
                >
                  • {q.title}
                </p>
                {!progress.done.includes(q.id) && (
                  <p className="pl-2 text-[7px] text-muted-foreground sm:text-[9px]">{q.detail}</p>
                )}
              </li>
            ))}
          </ul>
          <PixelButton size="sm" className="mt-3 flex w-full items-center justify-center gap-1" onClick={esconderse}>
            <EyeOff className="size-3" aria-hidden />
            ESCONDERSE
          </PixelButton>
          <p className="mt-2 text-[7px] text-muted-foreground sm:text-[9px]">
            WASD / FLECHAS PARA MOVERSE · [E] INTERACTUAR
          </p>
          {restored && (
            <p className="mt-1 text-[7px] text-muted-foreground sm:text-[9px]">PARTIDA RECUPERADA</p>
          )}
          {saveError && (
            <p className="mt-1 text-[7px] text-destructive sm:text-[9px]">
              SIN GUARDADO: SEGUIS JUGANDO EN MEMORIA
            </p>
          )}
        </aside>

        {/* Minimapa con la posicion real del jugador */}
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
          {progress.inventory.length === 0 ? (
            <p className="text-[7px] text-muted-foreground sm:text-[9px]">VACIO</p>
          ) : (
            <ul className="flex flex-wrap gap-1">
              {progress.inventory.map((it) => (
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

        {/* Controles tactiles + volver al menu */}
        <div className="absolute bottom-2 left-2 flex items-end gap-3 sm:bottom-4 sm:left-4">
          <DPad onInput={setTouchInput} />
          <div>
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
        </div>

        {hint && (
          <p className="card-sprite animate-panel-pop absolute left-1/2 top-4 -translate-x-1/2 px-3 py-1 text-[8px] text-primary-foreground sm:text-[10px]">
            {hint}
          </p>
        )}

        {/* Dialogo */}
        {talking && playable && (
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

        {!playable && (
          <GameOverlay
            title={progress.status === "victoria" ? "MISION CUMPLIDA" : "MISION FALLIDA"}
            detail={progress.reason}
            score={progress.score}
            onRestart={reintentar}
          />
        )}
      </section>
    </main>
  );
}
