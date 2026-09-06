/**
 * Mapa por tiles construido desde cero (sin imagenes de fondo).
 * Cada escena es una grilla de caracteres: legible, facil de modificar
 * y de donde se derivan las colisiones automaticamente.
 */

import type { Rect } from "./collision";

export const TILE_COLS = 40;
export const TILE_ROWS = 24;

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
  ".": { solid: false, color: "--tile-cobble", pattern: "stone", label: "empedrado" },
  ",": { solid: false, color: "--tile-dirt", pattern: "grid", label: "tierra" },
  g: { solid: false, color: "--tile-grass", pattern: "leaf", label: "pasto" },
  k: { solid: false, color: "--tile-dock", pattern: "plank", label: "muelle" },
  S: { solid: false, color: "--tile-stone", pattern: "brick", label: "piedra" },
  D: { solid: false, color: "--tile-door", pattern: "plank", label: "puerta" },
  w: { solid: true, color: "--tile-water", pattern: "wave", label: "agua" },
  W: { solid: true, color: "--tile-wall", pattern: "brick", label: "muro" },
  H: { solid: true, color: "--tile-house", pattern: "brick", label: "casa" },
  R: { solid: true, color: "--tile-roof", pattern: "plank", label: "techo" },
  F: { solid: true, color: "--tile-fountain", pattern: "wave", label: "fuente" },
  s: { solid: true, color: "--tile-stall", pattern: "plank", label: "puesto" },
  T: { solid: true, color: "--tile-tree", pattern: "leaf", label: "arbol" },
  f: { solid: true, color: "--tile-fence", pattern: "grid", label: "reja" },
  x: { solid: true, color: "--tile-crate", pattern: "plank", label: "cajon" },
  A: { solid: true, color: "--tile-altar", pattern: "brick", label: "altar" },
  "#": { solid: true, color: "--tile-pillar", pattern: "stone", label: "columna" },
  B: { solid: true, color: "--tile-boat", pattern: "plank", label: "bote" },
};

export const FALLBACK_TILE: TileDef = TILES["."]!;

/** Tolerancia a fallos: un caracter desconocido se dibuja como piso. */
export function tileAt(map: string[], col: number, row: number): TileDef {
  const ch = map[row]?.[col];
  return (ch && TILES[ch]) || FALLBACK_TILE;
}

export const TILE_W = 100 / TILE_COLS;
export const TILE_H = 100 / TILE_ROWS;

/**
 * Convierte los tiles solidos en rectangulos de colision (en % de escena),
 * uniendo tiles contiguos de la misma fila para tener menos cajas.
 */
export function tilemapBlockers(map: string[]): Rect[] {
  const rects: Rect[] = [];
  for (let row = 0; row < TILE_ROWS; row++) {
    let runStart = -1;
    for (let col = 0; col <= TILE_COLS; col++) {
      const solid = col < TILE_COLS && tileAt(map, col, row).solid;
      if (solid && runStart < 0) runStart = col;
      if (!solid && runStart >= 0) {
        rects.push({
          x: runStart * TILE_W,
          y: row * TILE_H,
          w: (col - runStart) * TILE_W,
          h: TILE_H,
        });
        runStart = -1;
      }
    }
  }
  return rects;
}

export const TILEMAPS: Record<string, string[]> = {
  plaza: [
    "RRRRRRRRRRRRRRRRRR,,,,RRRRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRRRR,,,,RRRRRRRRRRRRRRRRRR",
    "HHHHHDHHHHHHHHHHHH,,,,HHHHHHHHHDHHHHHHHH",
    "HHHHHDHHHHHHHHHHHH,,,,HHHHHHHHHDHHHHHHHH",
    "W......................................W",
    "W......................................W",
    "W..T...................................W",
    "W......ssss............................W",
    "W......................................W",
    "W......................................W",
    "W..................FF..................W",
    "W..................FF..................,",
    "W......................................,",
    "W......................................,",
    "W......................................,",
    "W..........................ssss........W",
    "W......................................W",
    "W......................................W",
    "W.....T...........................T....W",
    "W......................................W",
    "W...........ffffff......ffffff.........W",
    "W......................................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  ],
  puerto: [
    "WwwwwwwwwwwwwwwBwwwwwwwwwwwwwwwwwwwwwwwW",
    "WwwwwwwwwwwwwwwBwwwwwwwwwwwwwwwwwwwwwwwW",
    "WwwwwwwwwwwwwwkBkwwwwwwwwwwwwwwwwwwwwwwW",
    "WwwwwwwwwwwwwwkkkwwwwwwwwwwwwwwwwwwwwwwW",
    "WwwwwwwwwwwwwwkkkwwwwwwwwwkkwwwwwwwwwwwW",
    "WwwwwwwwwwwwwwkkkwwwwwwwwwkkwwwwwwwwwwwW",
    "WkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkW",
    "WkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkW",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    ",,,,,,xxx,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    ",,,,,,xxx,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,xx,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,xx,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,ffffff,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,T,,,,,,,,,,,,,,,,,,,T,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "W,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  ],
  convento: [
    "WRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRW",
    "WRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRW",
    "WHHHHHHHHHHHHHHHHHAAAAHHHHHHHHHHHHHHHHHW",
    "WHHHHHHHHHHHHHHHHHAAAAHHHHHHHHHHHHHHHHHW",
    "WHHHHHHHHHHHHHHHHHAAAAHHHHHHHHHHHHHHHHHW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSS#SSSggggSSSSSSSSSSSSggggSSS#SSSSSW",
    "WSSSSS#SSSgTggSSSSSSSSSSSSggggSSS#SSSSSW",
    "WSSSSS#SSSggggSSSSSSSSSSSSggTgSSS#SSSSSW",
    "WSSSSS#SSSggggSSSSSSSSSSSSggggSSS#SSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSS#SSSSSSSSSSSSSSSSSSSSSSSSSS#SSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSffffffffSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSW",
    "WWWWWWWWWWWWWWWWWW,,,,WWWWWWWWWWWWWWWWWW",
  ],
};
