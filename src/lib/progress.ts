import type { Hotspot } from "./world";
import { QUESTS } from "./world";

/**
 * Estado de la partida y reglas puras de la nueva mecanica:
 * sospecha + temporizador + puntaje, con condiciones de victoria y derrota.
 * Todo es puro para poder testearlo y ampliarlo sin tocar la interfaz.
 */

export type GameStatus = "jugando" | "victoria" | "derrota";

export type Progress = {
  sceneId: string;
  inventory: string[];
  done: string[];
  active: string[];
  score: number;
  suspicion: number;
  secondsLeft: number;
  status: GameStatus;
  reason: string;
};

export const MAX_SUSPICION = 100;
export const TOTAL_SECONDS = 300;
export const POINTS_ITEM = 50;
export const POINTS_QUEST = 150;
export const SUSPICION_MOVE = 4;
export const SUSPICION_GUARD = 18;
export const SUSPICION_HIDE = -25;
export const HIDE_SECONDS = 15;

export function createProgress(sceneId: string): Progress {
  return {
    sceneId,
    inventory: [],
    done: [],
    active: ["carta"],
    score: 0,
    suspicion: 0,
    secondsLeft: TOTAL_SECONDS,
    status: "jugando",
    reason: "",
  };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Vuelve a evaluar victoria y derrota despues de cualquier cambio. */
function evaluate(p: Progress): Progress {
  if (p.status !== "jugando") return p;
  if (p.done.length >= QUESTS.length) {
    return { ...p, status: "victoria", reason: "Completaste todas las misiones sin ser descubierto." };
  }
  if (p.suspicion >= MAX_SUSPICION) {
    return { ...p, status: "derrota", reason: "La guarnicion te descubrio. Sospecha al maximo." };
  }
  if (p.secondsLeft <= 0) {
    return { ...p, status: "derrota", reason: "Se agoto el tiempo antes de la extraccion." };
  }
  return p;
}

export function tick(p: Progress, seconds = 1): Progress {
  if (p.status !== "jugando") return p;
  return evaluate({ ...p, secondsLeft: Math.max(0, p.secondsLeft - seconds) });
}

export function addSuspicion(p: Progress, amount: number): Progress {
  if (p.status !== "jugando") return p;
  return evaluate({ ...p, suspicion: clamp(p.suspicion + amount, 0, MAX_SUSPICION) });
}

/** Nueva accion del jugador: esconderse baja la sospecha pero cuesta tiempo. */
export function hide(p: Progress): Progress {
  if (p.status !== "jugando") return p;
  const next: Progress = {
    ...p,
    suspicion: clamp(p.suspicion + SUSPICION_HIDE, 0, MAX_SUSPICION),
    secondsLeft: Math.max(0, p.secondsLeft - HIDE_SECONDS),
  };
  return evaluate(next);
}

export function changeScene(p: Progress, sceneId: string): Progress {
  if (p.status !== "jugando") return p;
  return evaluate({
    ...p,
    sceneId,
    suspicion: clamp(p.suspicion + SUSPICION_MOVE, 0, MAX_SUSPICION),
  });
}

/** Aplica el resultado de interactuar con un npc u objeto. */
export function interactWith(p: Progress, h: Hotspot): Progress {
  if (p.status !== "jugando") return p;
  let next: Progress = { ...p };

  if (h.gives && !next.inventory.includes(h.gives)) {
    next.inventory = [...next.inventory, h.gives];
    next.score += POINTS_ITEM;
  }
  if (h.completes && !next.done.includes(h.completes)) {
    next.done = [...next.done, h.completes];
    next.active = next.active.filter((id) => id !== h.completes);
    next.score += POINTS_QUEST;
  }
  if (h.starts && !next.active.includes(h.starts) && !next.done.includes(h.starts)) {
    next.active = [...next.active, h.starts];
  }
  if (h.id === "soldado") {
    next.suspicion = clamp(next.suspicion + SUSPICION_GUARD, 0, MAX_SUSPICION);
  }

  return evaluate(next);
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** Validador usado al recuperar una partida guardada. */
export function parseProgress(value: unknown): Progress | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const strings = (x: unknown) =>
    Array.isArray(x) ? x.filter((i): i is string => typeof i === "string") : [];
  const num = (x: unknown, def: number) => (typeof x === "number" && Number.isFinite(x) ? x : def);
  if (typeof v["sceneId"] !== "string") return null;
  const status = v["status"];
  return {
    sceneId: v["sceneId"],
    inventory: strings(v["inventory"]),
    done: strings(v["done"]),
    active: strings(v["active"]).length ? strings(v["active"]) : ["carta"],
    score: num(v["score"], 0),
    suspicion: clamp(num(v["suspicion"], 0), 0, MAX_SUSPICION),
    secondsLeft: clamp(num(v["secondsLeft"], TOTAL_SECONDS), 0, TOTAL_SECONDS),
    status: status === "victoria" || status === "derrota" ? status : "jugando",
    reason: typeof v["reason"] === "string" ? v["reason"] : "",
  };
}
