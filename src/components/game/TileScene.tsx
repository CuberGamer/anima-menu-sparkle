import { useMemo } from "react";

import { TILES, mapCols, mapRows, tileAt } from "@/lib/tilemap";

type Props = {
  /** grilla de caracteres de la escena */
  map: string[];
  /** nombre accesible de la escena */
  name: string;
};

/**
 * Dibuja el mapa por tiles. No usa imagenes: cada tile es un bloque de color
 * con un patron pixel-art definido en CSS. El tamano se lee del propio mapa.
 */
export function TileScene({ map, name }: Props) {
  const cols = mapCols(map);
  const rows = mapRows(map);

  const cells = useMemo(() => {
    const list: { key: string; def: typeof TILES[string]; alt: boolean }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        list.push({
          key: `${col}-${row}`,
          def: tileAt(map, col, row),
          alt: (col + row) % 2 === 0,
        });
      }
    }
    return list;
  }, [map, cols, rows]);

  return (
    <div
      role="img"
      aria-label={`Mapa de ${name} construido con tiles`}
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {cells.map((c) => (
        <span
          key={c.key}
          className={`tile tile-${c.def.pattern}${c.alt ? " tile-alt" : ""}`}
          style={{ backgroundColor: `var(${c.def.color})` }}
        />
      ))}
    </div>
  );
}
