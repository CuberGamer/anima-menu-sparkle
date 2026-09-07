/**
 * Mapa por tiles importado del proyecto LDtk "Typical_TopDown_example".
 * Cada escena es una grilla de caracteres, sin imagenes de fondo:
 *   W = muro solido, S = piso de piedra, . = piso de tierra/empedrado.
 * Las colisiones se derivan automaticamente de la grilla.
 */

import type { Rect } from "./collision";

export type TilePattern = "flat" | "brick" | "grid" | "wave" | "plank" | "leaf" | "stone";

export type TileDef = {
  /** true = no se puede pisar */
  solid: boolean;
  /** variable CSS del color base */
  color: string;
  pattern: TilePattern;
  label: string;
};

/** Diccionario de tiles: agregar uno nuevo es sumar una entrada aca. */
export const TILES: Record<string, TileDef> = {
  ".": { solid: false, color: "--tile-dirt", pattern: "grid", label: "tierra" },
  S: { solid: false, color: "--tile-cobble", pattern: "stone", label: "piedra" },
  g: { solid: false, color: "--tile-grass", pattern: "leaf", label: "pasto" },
  k: { solid: false, color: "--tile-dock", pattern: "plank", label: "muelle" },
  W: { solid: true, color: "--tile-wall", pattern: "brick", label: "muro" },
  H: { solid: true, color: "--tile-house", pattern: "brick", label: "casa" },
  T: { solid: true, color: "--tile-tree", pattern: "leaf", label: "arbol" },
  w: { solid: true, color: "--tile-water", pattern: "wave", label: "agua" },
};

export const FALLBACK_TILE: TileDef = TILES["."]!;

/** Ancho/alto de la grilla, leidos del propio mapa (cada escena puede variar). */
export function mapCols(map: string[]): number {
  return map[0]?.length ?? 0;
}

export function mapRows(map: string[]): number {
  return map.length;
}

/** Tolerancia a fallos: un caracter desconocido se dibuja como piso. */
export function tileAt(map: string[], col: number, row: number): TileDef {
  const ch = map[row]?.[col];
  return (ch && TILES[ch]) || FALLBACK_TILE;
}

/**
 * Convierte los tiles solidos en rectangulos de colision (en % de escena),
 * uniendo tiles contiguos de la misma fila para tener menos cajas.
 */
export function tilemapBlockers(map: string[]): Rect[] {
  const cols = mapCols(map);
  const rows = mapRows(map);
  if (!cols || !rows) return [];
  const tileW = 100 / cols;
  const tileH = 100 / rows;
  const rects: Rect[] = [];
  for (let row = 0; row < rows; row++) {
    let runStart = -1;
    for (let col = 0; col <= cols; col++) {
      const solid = col < cols && tileAt(map, col, row).solid;
      if (solid && runStart < 0) runStart = col;
      if (!solid && runStart >= 0) {
        rects.push({
          x: runStart * tileW,
          y: row * tileH,
          w: (col - runStart) * tileW,
          h: tileH,
        });
        runStart = -1;
      }
    }
  }
  return rects;
}

export const TILEMAPS: Record<string, string[]> = {
  plaza: [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWW...W.WWWWWWWWWWW",
    "WWSSSSSSWSSSSSSW.....WWW.....WWW",
    "WWSSSSSS.SSSSSSW.....WWW.WWW.WWW",
    "WWSSSSSS.SSSSSSWWW...WWW.WWW.WWW",
    "WWSSSSSSWSSSSSSWWW...WWW.WWW.WWW",
    "WWWWWWWWWWSSWWWWWW..WWWW.WWW.WWW",
    "WWWWWWWWW....WWWWW.......WWW....",
    "..............W..........WWW....",
    "....................WWWWWWWWWWWW",
    "..............W.....WWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  ],
  puerto: [
    "WWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWW",
    "WWWWW...WWWWWWWW",
    "WWW.......WWWWWW",
    "WWW..WWW..WWWWWW",
    "WWW.......WWWWWW",
    "WWW..........WWW",
    "WWW..WWW..W..WWW",
    "WWW.......W..WWW",
    "WWW.......W.....",
    "WWW..WWW..W.....",
    "WWW.......WWWW..",
    "WWWWWWWW.WW..WWW",
    "WWWWWWWSSSSS.WWW",
    "WWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWW",
  ],
  convento: [
    "SSSSSSSSSSSSSSSS",
    "WWWWSSSSSSSSSSSS",
    "WWWWSSSSSSSSSSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "WWWWWWWWWWWWWSSS",
    "SSSSSSSSSSSSSSSS",
    "SSSSSSSSSSSSSSSS",
    "SSSSSSSSSSSSSSSS",
  ],
};
