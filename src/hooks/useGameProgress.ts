import { useCallback, useEffect, useRef, useState } from "react";

import { readJSON, writeJSON, removeKey } from "@/lib/storage";
import {
  createProgress,
  parseProgress,
  tick,
  type Progress,
} from "@/lib/progress";

const KEY_PREFIX = "infiltrados:progreso";

function storageKey(): string {
  if (typeof window === "undefined") return KEY_PREFIX;
  let slot: string | null = null;
  try {
    slot = window.localStorage.getItem("infiltrados:slot");
  } catch {
    slot = null;
  }
  return slot ? `${KEY_PREFIX}:${slot}` : KEY_PREFIX;
}

/**
 * Une el estado puro de progress.ts con persistencia autorecuperable:
 * guarda cada cambio y, si el guardado falla, avisa sin romper el juego.
 */
export function useGameProgress(startScene: string) {
  const [progress, setProgress] = useState<Progress>(() => createProgress(startScene));
  const [restored, setRestored] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const keyRef = useRef(KEY_PREFIX);

  // Recuperacion: al montar leemos la partida previa (si es valida).
  useEffect(() => {
    keyRef.current = storageKey();
    const saved = readJSON<Progress | null>(
      keyRef.current,
      (v) => parseProgress(v),
      null,
    );
    if (saved) {
      setProgress(saved);
      setRestored(true);
    }
  }, []);

  // Persistencia tolerante a fallos.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = writeJSON(keyRef.current, progress);
    setSaveError(!ok);
  }, [progress]);

  // Temporizador: solo corre mientras la partida esta en juego.
  useEffect(() => {
    if (progress.status !== "jugando") return;
    const id = window.setInterval(() => setProgress((p) => tick(p, 1)), 1000);
    return () => window.clearInterval(id);
  }, [progress.status]);

  /** Aplica una regla pura de progress.ts protegiendo la UI de excepciones. */
  const apply = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((p) => {
      try {
        return fn(p) ?? p;
      } catch {
        return p;
      }
    });
  }, []);

  const restart = useCallback(() => {
    removeKey(keyRef.current);
    setRestored(false);
    setProgress(createProgress(startScene));
  }, [startScene]);

  return { progress, apply, restart, restored, saveError };
}
