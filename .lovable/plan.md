# Dibujar el mapa con el tileset del archivo LDtk

## Situación

El archivo que subiste trae el mapa dibujado tile por tile: 4 niveles (uno de 32x16 casillas y tres de 16x16), con capas de piso, piso especial, techos de pared y colisiones. Hoy el juego ya usa las colisiones y la forma del mapa, pero pinta cada casilla con un color plano, no con el arte real.

Falta una sola cosa en el archivo: la imagen de los tiles (176x176 px). Sin pedirte nada más, creo una imagen de tiles propia con ese mismo tamaño y estilo pixel-art colonial, así el mapa se dibuja con arte real respetando exactamente las posiciones del archivo.

## Qué vas a ver

- Los tres escenarios (plaza, puerto, convento) dibujados con piso, paredes y techos de verdad en lugar de bloques de color.
- Se suma el cuarto nivel del archivo como una escena nueva jugable.
- Paredes y bordes coinciden con el arte: donde ves pared, choca el personaje.
- Misiones, inventario, diálogos, sospecha, tiempo, puntaje y guardado siguen igual.

## Pasos

1. Crear la imagen de tiles de 176x176 (rejilla de 11x11 tiles de 16 px) con piso de tierra, empedrado, pasto, agua, muelle, piedra y paredes con su remate superior.
2. Extraer del archivo, por nivel, la lista de tiles dibujados de cada capa (piso, piso especial, techos) con su posición y su recorte en la imagen, más la rejilla de colisiones.
3. Guardar esos datos como módulo de datos del juego y reemplazar el dibujado por color plano por un dibujado por recortes de imagen, capa sobre capa.
4. Derivar las colisiones de la rejilla de colisiones del archivo (no del color) y mantener el deslizamiento contra paredes.
5. Reubicar aparición, salidas y personajes de cada escena sobre casillas caminables reales, y agregar la escena del cuarto nivel.
6. Probar en el navegador: recorrido completo, choques, cambios de escena, sin errores en consola.

## Detalles técnicos

- Nuevo `src/lib/ldtk-map.ts` generado con los datos del `.ldtk`: por nivel `cols`, `rows`, `layers[]` con `{ px:[x,y], src:[x,y], flip }` y `collisions: number[]`.
- La imagen del tileset se sube como asset de Lovable y se referencia por su pointer; el render de cada tile usa `background-image` + `background-position` negativa con `image-rendering: pixelated`.
- `TileScene.tsx` pasa a renderizar capas de tiles con recorte; `tilemap.ts` queda solo para el diccionario de compatibilidad y `tilemapBlockers` se reemplaza por `collisionRects(level)` derivado del IntGrid.
- Se respeta el offset vertical de la capa de techos (`pxOffsetY`) para que las paredes se vean como en LDtk.
- `world.ts` gana la cuarta escena y coordenadas de spawn/salida validadas contra las casillas libres.
