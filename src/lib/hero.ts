import heroSouth from "@/assets/hero-south.png.asset.json";
import heroSouthWest from "@/assets/hero-south-west.png.asset.json";
import heroSouthEast from "@/assets/hero-south-east.png.asset.json";
import heroNorth from "@/assets/hero-north.png.asset.json";
import heroNorthWest from "@/assets/hero-north-west.png.asset.json";
import heroNorthEast from "@/assets/hero-north-east.png.asset.json";
import heroEast from "@/assets/hero-east.png.asset.json";
import heroWest from "@/assets/hero-west.png.asset.json";

export type Facing =
  | "south"
  | "south-west"
  | "south-east"
  | "north"
  | "north-west"
  | "north-east"
  | "east"
  | "west";

export const HERO_SPRITES: Record<Facing, string> = {
  south: heroSouth.url,
  "south-west": heroSouthWest.url,
  "south-east": heroSouthEast.url,
  north: heroNorth.url,
  "north-west": heroNorthWest.url,
  "north-east": heroNorthEast.url,
  east: heroEast.url,
  west: heroWest.url,
};

/** Elige el sprite segun el desplazamiento en porcentaje de escena */
export function facingFromDelta(dx: number, dy: number): Facing {
  const t = 4;
  const horiz = Math.abs(dx) > t;
  const vert = Math.abs(dy) > t;
  if (horiz && vert) {
    return `${dy < 0 ? "north" : "south"}-${dx < 0 ? "west" : "east"}` as Facing;
  }
  if (horiz) return dx < 0 ? "west" : "east";
  if (vert) return dy < 0 ? "north" : "south";
  return "south";
}
