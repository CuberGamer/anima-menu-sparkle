import { useMemo } from "react";

import { TILE_COLS, TILE_ROWS, TILES, tileAt } from "@/lib/tilemap";

type Props = {
  /** grilla de caracteres de la escena */
  map: string[];
  /** nombre accesible de la escena */
  name: string;
};

/**
 * Dibuja el mapa por tiles. No usa imagenes: cada tile es un bloque de color
 * con un patron pixel-art definido en CSS.
 */
export function TileScene({ map, name }: Props) {
  const cells = useMemo(() => {
    const list: { key: string; def: typeof TILES[string] }[] = [];
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLS; col++) {
        list.push({ key: `${col}-${row}`, def: tileAt(map, col, row) });
      }
    }
    return list;
  }, [map]);

  return (
    <div
      role="img"
      aria-label={`Mapa de ${name} construido con tiles`}
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${TILE_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${TILE_ROWS}, 1fr)`,
      }}
    >
      {cells.map((c) => (
        <span
          key={c.key}
          className={`tile tile-${c.def.pattern}`}
          style={{ backgroundColor: `var(${c.def.color})` }}
        />
      ))}
    </div>
  );
}
