import spriteAldeano from "@/assets/npc-aldeano.png";
import spriteSoldado from "@/assets/npc-soldado.png";
import spriteFraile from "@/assets/npc-fraile.png";
import spriteCarreta from "@/assets/obj-carreta.png";
import spriteCampana from "@/assets/obj-campana.png";

import { TILEMAPS } from "./tilemap";

export type Dir = "up" | "down" | "left" | "right";

export type Hotspot = {
  id: string;
  kind: "npc" | "objeto";
  label: string;
  /** posicion en porcentaje sobre la escena */
  x: number;
  y: number;
  /** textura pixel-art del npc u objeto */
  sprite: string;
  /** alto del sprite en porcentaje de la escena */
  size?: number;
  lines: string[];
  /** item que se agrega al inventario al interactuar */
  gives?: string;
  /** mision que se completa al interactuar */
  completes?: string;
  /** mision que se activa al interactuar */
  starts?: string;
};

export type Exit = {
  dir: Dir;
  to: string;
  /** centro de la zona de transicion en porcentaje */
  x: number;
  y: number;
  /** tamano de la zona que dispara el cambio de escena */
  w?: number;
  h?: number;
  label: string;
};

export type Scene = {
  id: string;
  name: string;
  /** grilla de tiles de la escena (el mapa se dibuja desde cero) */
  tiles: string[];
  /** posicion aproximada en el minimapa (porcentaje) */
  map: { x: number; y: number };
  /** posicion inicial del jugador al entrar a la escena */
  spawn: { x: number; y: number };
  exits: Exit[];
  hotspots: Hotspot[];
};

export type Quest = {
  id: string;
  title: string;
  detail: string;
};

export const QUESTS: Quest[] = [
  { id: "carta", title: "CONSEGUIR LA CARTA", detail: "Habla con el vendedor de la plaza." },
  { id: "llave", title: "LA LLAVE DEL PUERTO", detail: "Busca al contrabandista en el muelle." },
  { id: "convento", title: "EL MENSAJE OCULTO", detail: "Habla con el fraile del convento." },
];

export const SCENES: Record<string, Scene> = {
  plaza: {
    id: "plaza",
    name: "PLAZA MAYOR",
    tiles: TILEMAPS["plaza"]!,
    map: { x: 48, y: 50 },
    spawn: { x: 50, y: 75 },
    exits: [
      { dir: "right", to: "puerto", x: 98, y: 54, w: 5, h: 16, label: "AL PUERTO" },
      { dir: "up", to: "convento", x: 50, y: 8, w: 10, h: 14, label: "AL CONVENTO" },
    ],
    hotspots: [
      {
        id: "vendedor",
        sprite: spriteAldeano,
        size: 26,
        kind: "npc",
        label: "VENDEDOR",
        x: 72,
        y: 71,
        lines: [
          "VENDEDOR: Buenas, forastero. Cuidado con los soldados.",
          "VENDEDOR: Me dejaron esta carta para alguien como vos.",
          "OBTUVISTE: CARTA SELLADA",
        ],
        gives: "CARTA SELLADA",
        completes: "carta",
        starts: "llave",
      },
      {
        id: "soldado",
        sprite: spriteSoldado,
        size: 26,
        kind: "npc",
        label: "SOLDADO",
        x: 78,
        y: 25,
        lines: [
          "SOLDADO: Nadie entra al cabildo sin permiso.",
          "SOLDADO: Segui tu camino y no hagas ruido.",
        ],
      },
      {
        id: "carro",
        sprite: spriteCarreta,
        size: 20,
        kind: "objeto",
        label: "CARRETA",
        x: 22,
        y: 38,
        lines: ["Bajo la lona hay una BOLSA DE MONEDAS.", "OBTUVISTE: MONEDAS"],
        gives: "MONEDAS",
      },
    ],
  },
  puerto: {
    id: "puerto",
    name: "PUERTO",
    tiles: TILEMAPS["puerto"]!,
    map: { x: 74, y: 55 },
    spawn: { x: 20, y: 60 },
    exits: [{ dir: "left", to: "plaza", x: 2, y: 54, w: 5, h: 16, label: "A LA PLAZA" }],
    hotspots: [
      {
        id: "contrabandista",
        sprite: spriteAldeano,
        size: 26,
        kind: "npc",
        label: "CONTRABANDISTA",
        x: 40,
        y: 42,
        lines: [
          "CONTRABANDISTA: Traes la carta? Bien.",
          "CONTRABANDISTA: Toma la llave del deposito.",
          "OBTUVISTE: LLAVE DE BRONCE",
        ],
        gives: "LLAVE DE BRONCE",
        completes: "llave",
        starts: "convento",
      },
      {
        id: "pescador",
        sprite: spriteSoldado,
        size: 24,
        kind: "npc",
        label: "PESCADOR",
        x: 67,
        y: 44,
        lines: [
          "PESCADOR: El rio trae mas espias que peces ultimamente.",
          "PESCADOR: Tomá esta polvora, escondela bien.",
          "OBTUVISTE: POLVORA",
        ],
        gives: "POLVORA",
      },
      ],
  },
  convento: {
    id: "convento",
    name: "CONVENTO",
    tiles: TILEMAPS["convento"]!,
    map: { x: 45, y: 24 },
    spawn: { x: 50, y: 88 },
    exits: [{ dir: "down", to: "plaza", x: 50, y: 99, w: 10, h: 5, label: "A LA PLAZA" }],
    hotspots: [
      {
        id: "monje",
        sprite: spriteFraile,
        size: 26,
        kind: "npc",
        label: "FRAILE",
        x: 50,
        y: 30,
        lines: [
          "FRAILE: Aqui rezamos y callamos, hijo.",
          "FRAILE: Guardé esto para vos: los planos del regimiento.",
          "OBTUVISTE: PLANOS SECRETOS",
        ],
        gives: "PLANOS SECRETOS",
        completes: "convento",
      },
      {
        id: "campana",
        sprite: spriteCampana,
        size: 16,
        kind: "objeto",
        label: "CAMPANARIO",
        x: 20,
        y: 84,
        lines: ["La campana esta trabada con un trapo.", "Alguien no queria que suene."],
      },
    ],
  },
};

export const START_SCENE = "plaza";
