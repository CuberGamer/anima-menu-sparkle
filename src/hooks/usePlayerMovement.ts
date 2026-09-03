import { useCallback, useEffect, useRef, useState } from "react";

import { resolveMove, type Rect } from "@/lib/collision";
import { facingFromDelta, type Facing } from "@/lib/hero";

export type MoveInput = { dx: number; dy: number };

type Options = {
  blockers: Rect[];
  bounds?: Rect;
  /** velocidad en % de escena por segundo */
  speed?: number;
  enabled?: boolean;
};

/**
 * Movimiento libre del jugador con teclado (WASD / flechas) y joystick tactil.
 * Aplica colisiones en cada frame y expone la direccion para elegir el sprite.
 */
export function usePlayerMovement(
  start: { x: number; y: number },
  { blockers, bounds, speed = 22, enabled = true }: Options,
) {
  const [pos, setPos] = useState(start);
  const [facing, setFacing] = useState<Facing>("south");
  const [moving, setMoving] = useState(false);

  const keys = useRef<Set<string>>(new Set());
  const touch = useRef<MoveInput>({ dx: 0, dy: 0 });
  const posRef = useRef(start);
  const blockersRef = useRef(blockers);
  const enabledRef = useRef(enabled);

  blockersRef.current = blockers;
  enabledRef.current = enabled;

  const teleport = useCallback((p: { x: number; y: number }) => {
    posRef.current = p;
    setPos(p);
    setMoving(false);
  }, []);

  /** Entrada del joystick/botones en pantalla (reutilizable). */
  const setTouchInput = useCallback((input: MoveInput) => {
    touch.current = input;
  }, []);

  useEffect(() => {
    const MAP: Record<string, MoveInput> = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
      KeyW: { dx: 0, dy: -1 },
      KeyS: { dx: 0, dy: 1 },
      KeyA: { dx: -1, dy: 0 },
      KeyD: { dx: 1, dy: 0 },
    };
    const down = (e: KeyboardEvent) => {
      if (!MAP[e.code]) return;
      e.preventDefault();
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      let dx = touch.current.dx;
      let dy = touch.current.dy;
      for (const code of keys.current) {
        const v = MAP[code];
        if (v) {
          dx += v.dx;
          dy += v.dy;
        }
      }

      const len = Math.hypot(dx, dy);
      if (len > 0 && enabledRef.current) {
        const nx = (dx / len) * speed * dt;
        const ny = (dy / len) * speed * dt;
        const next = resolveMove(posRef.current, nx, ny, blockersRef.current, bounds);
        if (next.x !== posRef.current.x || next.y !== posRef.current.y) {
          posRef.current = next;
          setPos(next);
        }
        setFacing(facingFromDeltaSafe(dx, dy));
        setMoving(true);
      } else {
        setMoving((m) => (m ? false : m));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      keys.current.clear();
    };
  }, [bounds, speed]);

  return { pos, facing, moving, teleport, setTouchInput };
}

/** El umbral de facingFromDelta esta pensado para saltos grandes: aca normalizamos. */
function facingFromDeltaSafe(dx: number, dy: number): Facing {
  return facingFromDelta(dx * 100, dy * 100);
}
