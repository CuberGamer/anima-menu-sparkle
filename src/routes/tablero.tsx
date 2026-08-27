import { createFileRoute } from "@tanstack/react-router";
import { WorldMap } from "@/components/game/WorldMap";

export const Route = createFileRoute("/tablero")({
  head: () => ({
    meta: [
      { title: "Infiltrados — Mapa del pueblo" },
      {
        name: "description",
        content:
          "Recorre la plaza, el puerto y el convento de Infiltrados: habla con NPCs, junta objetos y avanza tus misiones.",
      },
      { property: "og:title", content: "Infiltrados — Mapa del pueblo" },
      {
        property: "og:description",
        content: "Explora el pueblo de frontera, habla con NPCs y completa misiones de espionaje.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorldMap,
});

