/**
 * Sistema de colisiones del mapa.
 * Todo se expresa en porcentaje de la escena (0-100) para que funcione
 * en cualquier resolucion y en mobile sin recalcular pixeles.
 */

export type Rect = { x: number; y: number; w: number; h: number };

/** Zona caminable general de una escena (los bordes y el "cielo" no se pisan). */
export const WALK_BOUNDS: Rect = { x: 4, y: 46, w: 92, h: 48 };

export function rectContains(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function insideBounds(x: number, y: number, bounds: Rect = WALK_BOUNDS): boolean {
  return rectContains(bounds, x, y);
}

/** true si la posicion choca con un obstaculo o se sale del area caminable. */
export function isBlocked(
  x: number,
  y: number,
  blockers: Rect[] = [],
  bounds: Rect = WALK_BOUNDS,
): boolean {
  if (!insideBounds(x, y, bounds)) return true;
  return blockers.some((b) => rectContains(b, x, y));
}

/**
 * Mueve intentando deslizar contra las paredes:
 * si el movimiento diagonal choca, prueba cada eje por separado.
 */
export function resolveMove(
  from: { x: number; y: number },
  dx: number,
  dy: number,
  blockers: Rect[] = [],
  bounds: Rect = WALK_BOUNDS,
): { x: number; y: number } {
  const tryPos = (nx: number, ny: number) =>
    isBlocked(nx, ny, blockers, bounds) ? null : { x: nx, y: ny };

  return (
    tryPos(from.x + dx, from.y + dy) ??
    tryPos(from.x + dx, from.y) ??
    tryPos(from.x, from.y + dy) ??
    from
  );
}

export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
