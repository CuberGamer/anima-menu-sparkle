import { createFileRoute } from "@tanstack/react-router";
import { TacticalBoard } from "@/components/game/TacticalBoard";

export const Route = createFileRoute("/tablero")({
  head: () => ({
    meta: [
      { title: "Infiltrados — Mision 1: Frontera" },
      {
        name: "description",
        content:
          "Primer nivel tactico de Infiltrados: guia al espia hasta la extraccion evitando a los guardias en la frontera argentina.",
      },
      {
        property: "og:title",
        content: "Infiltrados — Mision 1: Frontera",
      },
      {
        property: "og:description",
        content:
          "Juego de espionaje pixel art: primer nivel tactico en la frontera argentina del 1800.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TacticalBoard,
});
