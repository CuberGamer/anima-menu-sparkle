import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorOpen, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PixelButton } from "./PixelButton";
import { sfx } from "@/lib/sfx";
import { parseMap, movePlayer, guardVision, type GameState } from "@/lib/game";

import texParchment from "@/assets/tex-parchment.png";
import texPanel from "@/assets/tex-panel.jpg";
import texGold from "@/assets/tex-gold.jpg";
import panelTile from "@/assets/panel-tile-cleaned.jpeg.asset.json";
import btnFrame from "@/assets/btn-frame.png.asset.json";
import btnFrameGold from "@/assets/btn-frame-gold.png.asset.json";

const DIRECTION_ARROW = {
  up: "▲",
  down: "▼",
  left: "◀",
  right: "▶",
};

export function TacticalBoard() {
  const { player, exit, guards, walls, trees } = useMemo(() => parseMap(), []);
  const [state, setState] = useState<GameState>({
    player,
    guards,
    status: "playing",
    moves: 0,
    message: "Llega a la zona de extraccion sin ser visto.",
  });
  const [slot, setSlot] = useState("1");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("infiltrados:slot");
    if (saved) setSlot(saved);
  }, []);

  const reset = () => {
    sfx.click();
    setState({
      player,
      guards,
      status: "playing",
      moves: 0,
      message: "Llega a la zona de extraccion sin ser visto.",
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setState((prev) => {
        if (prev.status !== "playing") return prev;
        if (key === "w" || key === "arrowup")
          return movePlayer(prev, 0, -1, walls, trees, exit);
        if (key === "s" || key === "arrowdown")
          return movePlayer(prev, 0, 1, walls, trees, exit);
        if (key === "a" || key === "arrowleft")
          return movePlayer(prev, -1, 0, walls, trees, exit);
        if (key === "d" || key === "arrowright")
          return movePlayer(prev, 1, 0, walls, trees, exit);
        return prev;
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [walls, trees, exit]);

  const tryMove = (dx: number, dy: number) => {
    if (state.status !== "playing") return;
    sfx.tick();
    setState((prev) => movePlayer(prev, dx, dy, walls, trees, exit));
  };

  const visionCells = useMemo(() => {
    const set = new Set<string>();
    state.guards.forEach((g) => {
      guardVision(g, walls, trees).forEach((v) => set.add(`${v.x},${v.y}`));
    });
    return set;
  }, [state.guards, walls, trees]);

  const cols = walls[0]?.length ?? 0;
  const rows = walls.length;

  return (
    <main
      className="relative min-h-[100svh] overflow-x-hidden overscroll-none"
      style={
        {
          "--tex-parchment": `url(${texParchment})`,
          "--tex-panel": `url(${texPanel})`,
          "--tex-gold": `url(${texGold})`,
          "--tex-cell-panel": `url(${panelTile.url})`,
          "--tex-btn": `url(${btnFrame.url})`,
          "--tex-btn-gold": `url(${btnFrameGold.url})`,
        } as React.CSSProperties
      }
    >
      <div className="texture-panel fixed inset-0 bg-[var(--panel-frame)]" />
      <div className="texture-noise pointer-events-none fixed inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col gap-4 p-3 py-5 sm:gap-8 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-gold-texture text-base sm:text-3xl">
              MISION 1: FRONTERA
            </h1>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
              PARTIDA {slot} • MOVIMIENTOS: {state.moves}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PixelButton
              size="sm"
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="size-4" aria-hidden />
              <span className="hidden sm:inline">REINICIAR</span>
            </PixelButton>
            <Link to="/">
              <PixelButton
                size="sm"
                className="flex flex-col items-center gap-1"
              >
                <span>MENU</span>
                <DoorOpen className="size-5" aria-hidden />
              </PixelButton>
            </Link>
          </div>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <section
            className="animate-panel-pop panel-sprite w-full max-w-full p-1 sm:w-fit"
            style={{ animationDelay: "0.1s" }}
          >
            <div
              className="grid gap-0.5 bg-[var(--panel-frame)] p-1"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: rows }).map((_, y) =>
                Array.from({ length: cols }).map((_, x) => {
                  const isWall = walls[y]![x];
                  const isTree = trees[y]![x];
                  const isPlayer =
                    state.player.x === x && state.player.y === y;
                  const guard = state.guards.find(
                    (g) => g.pos.x === x && g.pos.y === y,
                  );
                  const isExit = exit.x === x && exit.y === y;
                  const isVision = visionCells.has(`${x},${y}`);

                  return (
                    <div
                      key={`${x}-${y}`}
                      className="relative aspect-square w-8 sm:w-10"
                      aria-label={
                        isPlayer
                          ? "Jugador"
                          : guard
                            ? `Guardia ${guard.facing}`
                            : isExit
                              ? "Extraccion"
                              : undefined
                      }
                    >
                      <div
                        className={cn(
                          "absolute inset-0",
                          isWall && "texture-panel bg-muted",
                          isTree && "texture-panel bg-accent",
                          !isWall && !isTree && "texture-parchment bg-secondary",
                        )}
                      />
                      {isVision && (
                        <div className="pointer-events-none absolute inset-0 animate-pulse bg-destructive/25" />
                      )}
                      {isExit && (
                        <div className="absolute inset-1 flex animate-flicker items-center justify-center texture-gold">
                          <span className="text-[10px] text-primary-foreground">
                            E
                          </span>
                        </div>
                      )}
                      {guard && (
                        <div className="absolute inset-1 flex items-center justify-center border-2 border-destructive-foreground bg-destructive text-[10px] text-destructive-foreground">
                          {DIRECTION_ARROW[guard.facing]}
                        </div>
                      )}
                      {isPlayer && (
                        <div className="absolute inset-1 animate-panel-pop border-2 border-primary-foreground bg-primary shadow-[0_0_12px_var(--primary)]" />
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          </section>

          <aside
            className="animate-panel-pop flex-1 p-4 sm:p-6"
            style={{
              animationDelay: "0.2s",
              backgroundImage: "var(--tex-cell-panel)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h2 className="text-pixel-shadow mb-3 text-lg text-card-foreground">
              CONTROLES
            </h2>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div />
              <button
                type="button"
                onClick={() => tryMove(0, -1)}
                className="texture-panel flex h-10 items-center justify-center border-[6px] border-tex text-foreground transition-transform active:translate-y-0.5"
              >
                W
              </button>
              <div />
              <button
                type="button"
                onClick={() => tryMove(-1, 0)}
                className="texture-panel flex h-10 items-center justify-center border-[6px] border-tex text-foreground transition-transform active:translate-y-0.5"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => tryMove(0, 1)}
                className="texture-panel flex h-10 items-center justify-center border-[6px] border-tex text-foreground transition-transform active:translate-y-0.5"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => tryMove(1, 0)}
                className="texture-panel flex h-10 items-center justify-center border-[6px] border-tex text-foreground transition-transform active:translate-y-0.5"
              >
                D
              </button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Evita los conos de vision rojos.</p>
              <p>• Alcanza la casilla dorada (E).</p>
              <p>• Los guardias se mueven despues de ti.</p>
            </div>

            {state.status !== "playing" && (
              <div className="mt-6 text-center">
                <p
                  className={cn(
                    "text-pixel-shadow mb-4 text-xl",
                    state.status === "won"
                      ? "text-primary"
                      : "text-destructive",
                  )}
                >
                  {state.status === "won" ? "VICTORIA" : "DERROTA"}
                </p>
                <PixelButton onClick={reset}>REINTENTAR</PixelButton>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-card-foreground">
              {state.message}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
