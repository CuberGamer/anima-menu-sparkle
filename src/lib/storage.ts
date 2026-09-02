/**
 * Acceso tolerante a fallos al almacenamiento del navegador.
 * Cualquier error (modo privado, cuota llena, JSON corrupto) se contiene
 * aca y nunca llega a la interfaz del juego.
 */

export type Validator<T> = (value: unknown) => T | null;

export function readJSON<T>(key: string, validate: Validator<T>, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    const valid = validate(parsed);
    return valid ?? fallback;
  } catch {
    // Dato corrupto: lo descartamos para poder recuperarnos en el proximo guardado.
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* sin acceso a storage: seguimos en memoria */
    }
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignorado a proposito */
  }
}
