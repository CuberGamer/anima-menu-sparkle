export type SaveGame = {
  id: string;
  name: string;
  createdAt: string;
};

const KEY = "infiltrados:saves";

export function loadSaves(): SaveGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SaveGame =>
        typeof s?.id === "string" && typeof s?.name === "string",
    );
  } catch {
    return [];
  }
}

export function saveSaves(list: SaveGame[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function currentSaveName(): string | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem("infiltrados:slot");
  if (!id) return null;
  return loadSaves().find((s) => s.id === id)?.name ?? null;
}
