import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/game/InDevelopment";

export const Route = createFileRoute("/tablero")({
  head: () => ({
    meta: [
      { title: "Infiltrados — Partida en desarrollo" },
      {
        name: "description",
        content:
          "El mapa jugable de Infiltrados esta en desarrollo. Volve al menu principal para gestionar tus partidas.",
      },
      { property: "og:title", content: "Infiltrados — Partida en desarrollo" },
      {
        property: "og:description",
        content: "El nivel tactico de Infiltrados todavia esta en construccion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InDevelopment,
});
