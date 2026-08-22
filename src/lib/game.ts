export type Pos = { x: number; y: number };

export type Guard = {
  id: number;
  pos: Pos;
  path: Pos[];
  pathIndex: number;
  facing: "up" | "down" | "left" | "right";
};

export type GameState = {
  player: Pos;
  guards: Guard[];
  status: "playing" | "won" | "caught";
  moves: number;
  message: string;
};

export const MAP = [
  "##############",
  "#P...........#",
  "#.##......##.#",
  "#...T....T...#",
  "#...G........#",
  "#......##....#",
  "#..T......E..#",
  "#.##.##.##...#",
  "#....G.......#",
  "##############",
] as const;

export function parseMap() {
  const player: Pos = { x: 1, y: 1 };
  const exit: Pos = { x: 11, y: 6 };
  const guards: Guard[] = [];
  const walls: boolean[][] = [];
  const trees: boolean[][] = [];

  for (let y = 0; y < MAP.length; y++) {
    const row = MAP[y]!;
    walls[y] = [];
    trees[y] = [];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      walls[y]![x] = ch === "#";
      trees[y]![x] = ch === "T";
      if (ch === "P") {
        player.x = x;
        player.y = y;
      } else if (ch === "E") {
        exit.x = x;
        exit.y = y;
      } else if (ch === "G") {
        guards.push({
          id: guards.length + 1,
          pos: { x, y },
          path: [{ x, y }],
          pathIndex: 0,
          facing: "right",
        });
      }
    }
  }

  // Configure patrol routes after parsing positions.
  const g1 = guards.find((g) => g.pos.x === 4 && g.pos.y === 4);
  if (g1) {
    g1.path = [
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 7, y: 4 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
    ];
    g1.facing = "right";
  }

  const g2 = guards.find((g) => g.pos.x === 5 && g.pos.y === 8);
  if (g2) {
    g2.path = [
      { x: 5, y: 8 },
      { x: 5, y: 7 },
      { x: 5, y: 6 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 5, y: 8 },
    ];
    g2.facing = "up";
  }

  return { player, exit, guards, walls, trees };
}

export function isBlocked(
  x: number,
  y: number,
  walls: boolean[][],
  trees: boolean[][],
) {
  if (y < 0 || y >= walls.length || x < 0 || x >= (walls[0]?.length ?? 0))
    return true;
  return walls[y]![x] || trees[y]![x];
}

export function guardVision(
  guard: Guard,
  walls: boolean[][],
  trees: boolean[][],
): Pos[] {
  const vision: Pos[] = [];
  const dirs = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };
  const { dx, dy } = dirs[guard.facing];
  for (let i = 1; i <= 3; i++) {
    const x = guard.pos.x + dx * i;
    const y = guard.pos.y + dy * i;
    if (isBlocked(x, y, walls, trees)) break;
    vision.push({ x, y });
  }
  return vision;
}

export function movePlayer(
  state: GameState,
  dx: number,
  dy: number,
  walls: boolean[][],
  trees: boolean[][],
  exit: Pos,
): GameState {
  if (state.status !== "playing") return state;

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (isBlocked(nx, ny, walls, trees)) return state;

  const newPlayer = { x: nx, y: ny };
  let status: GameState["status"] = "playing";
  let message = state.message;

  if (nx === exit.x && ny === exit.y) {
    status = "won";
    message = "Mision completada. Extraccion exitosa.";
  }

  // Guards patrol after the player moves.
  const newGuards = state.guards.map((g) => {
    const nextIndex = (g.pathIndex + 1) % g.path.length;
    const nextPos = g.path[nextIndex]!;
    let facing = g.facing;
    if (nextPos.x > g.pos.x) facing = "right";
    else if (nextPos.x < g.pos.x) facing = "left";
    else if (nextPos.y > g.pos.y) facing = "down";
    else if (nextPos.y < g.pos.y) facing = "up";
    return { ...g, pos: nextPos, pathIndex: nextIndex, facing };
  });

  const guardOnPlayer = newGuards.some(
    (g) => g.pos.x === newPlayer.x && g.pos.y === newPlayer.y,
  );
  const seen = newGuards.some((g) =>
    guardVision(g, walls, trees).some(
      (v) => v.x === newPlayer.x && v.y === newPlayer.y,
    ),
  );

  if ((guardOnPlayer || seen) && status !== "won") {
    status = "caught";
    message = "Te han descubierto. Intenta de nuevo.";
  }

  return {
    ...state,
    player: newPlayer,
    guards: newGuards,
    status,
    moves: state.moves + 1,
    message,
  };
}
