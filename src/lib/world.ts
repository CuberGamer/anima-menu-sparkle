import scenePlaza from "@/assets/scene-plaza.jpg.asset.json";
import scenePuerto from "@/assets/scene-puerto.jpg.asset.json";
import sceneConvento from "@/assets/scene-convento.jpg.asset.json";
import spriteAldeano from "@/assets/npc-aldeano.png";
import spriteSoldado from "@/assets/npc-soldado.png";
import spriteFraile from "@/assets/npc-fraile.png";
import spriteCarreta from "@/assets/obj-carreta.png";
import spriteCampana from "@/assets/obj-campana.png";

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
  x: number;
  y: number;
  label: string;
};

export type Scene = {
  id: string;
  name: string;
  image: string;
  /** posicion aproximada en el minimapa (porcentaje) */
  map: { x: number; y: number };
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
    image: scenePlaza.url,
    map: { x: 48, y: 50 },
    exits: [
      { dir: "right", to: "puerto", x: 95, y: 50, label: "AL PUERTO" },
      { dir: "up", to: "convento", x: 50, y: 8, label: "AL CONVENTO" },
    ],
    hotspots: [
      {
        id: "vendedor",
        sprite: spriteAldeano,
        size: 26,
        kind: "npc",
        label: "VENDEDOR",
        x: 76,
        y: 74,
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
        x: 43,
        y: 42,
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
        x: 27,
        y: 79,
        lines: ["Bajo la lona hay una BOLSA DE MONEDAS.", "OBTUVISTE: MONEDAS"],
        gives: "MONEDAS",
      },
    ],
  },
  puerto: {
    id: "puerto",
    name: "PUERTO",
    image: scenePuerto.url,
    map: { x: 74, y: 55 },
    exits: [{ dir: "left", to: "plaza", x: 5, y: 50, label: "A LA PLAZA" }],
    hotspots: [
      {
        id: "contrabandista",
        sprite: spriteAldeano,
        size: 26,
        kind: "npc",
        label: "CONTRABANDISTA",
        x: 59,
        y: 66,
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
        x: 33,
        y: 45,
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
    image: sceneConvento.url,
    map: { x: 45, y: 24 },
    exits: [{ dir: "down", to: "plaza", x: 50, y: 94, label: "A LA PLAZA" }],
    hotspots: [
      {
        id: "monje",
        sprite: spriteFraile,
        size: 26,
        kind: "npc",
        label: "FRAILE",
        x: 24,
        y: 47,
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
        x: 32,
        y: 18,
        lines: ["La campana esta trabada con un trapo.", "Alguien no queria que suene."],
      },
    ],
  },
};

export const START_SCENE = "plaza";
