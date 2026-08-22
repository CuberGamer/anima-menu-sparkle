import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, DoorOpen, Plus } from "lucide-react";
import { PixelButton } from "@/components/game/PixelButton";
import { sfx } from "@/lib/sfx";

import texParchment from "@/assets/tex-parchment.png";
import texPanel from "@/assets/tex-panel.jpg";
import texGold from "@/assets/tex-gold.jpg";
import btnFrame from "@/assets/btn-frame.png.asset.json";
import btnFrameGold from "@/assets/btn-frame-gold.png.asset.json";

export const Route = createFileRoute("/tablero")({
  head: () => ({
    meta: [
      { title: "Infiltrados — Tablero de desarrollo" },
      {
        name: "description",
        content:
          "Tablero kanban pixel art del juego Infiltrados: backlog, pendientes, en proceso y terminado con tarjetas y etiquetas.",
      },
      { property: "og:title", content: "Infiltrados — Tablero de desarrollo" },
      {
        property: "og:description",
        content: "Organiza las tareas del juego en un tablero pixel art con texturas de pergamino y adobe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tablero,
});

type Card = { id: number; text: string; tags: string[]; done?: boolean };
type Column = { id: string; title: string; tone: string; cards: Card[] };

const TAGS = [
  "var(--tag-yellow)",
  "var(--tag-red)",
  "var(--tag-green)",
  "var(--tag-blue)",
  "var(--tag-purple)",
  "var(--tag-cyan)",
  "var(--tag-gray)",
] as const;

let nextId = 100;

const INITIAL: Column[] = [
  {
    id: "backlog",
    title: "PRODUCT BACKLOG",
    tone: "var(--col-sand)",
    cards: [
      { id: 1, text: "Iniciar Sesion", tags: [], done: true },
      { id: 2, text: "Mapa Jugable", tags: [], done: true },
      { id: 3, text: "Cinematicas", tags: [], done: true },
      { id: 4, text: "NPCs Interactivos", tags: [], done: true },
      { id: 5, text: "Sistema de Reputacion", tags: [], done: true },
      { id: 6, text: "Misiones", tags: [], done: true },
      { id: 7, text: "Sistema de Inventario", tags: [], done: true },
    ],
  },
  {
    id: "pendientes",
    title: "PENDIENTES",
    tone: "var(--col-red)",
    cards: [{ id: 8, text: "Sistema de Reputacion", tags: [TAGS[0], TAGS[4], TAGS[3], TAGS[6]] }],
  },
  {
    id: "proceso",
    title: "EN PROCESO",
    tone: "var(--col-blue)",
    cards: [
      { id: 9, text: "Misiones", tags: [TAGS[0], TAGS[1], TAGS[2]] },
      { id: 10, text: "NPCs Interactivos", tags: [TAGS[1], TAGS[4], TAGS[3]] },
      { id: 11, text: "Sistema de inventario", tags: [TAGS[5], TAGS[4], TAGS[2], TAGS[6]] },
    ],
  },
  {
    id: "terminado",
    title: "TERMINADO",
    tone: "var(--col-green)",
    cards: [
      { id: 12, text: "Iniciar Sesion", tags: [TAGS[0], TAGS[4], TAGS[3]] },
      { id: 13, text: "Mapa Jugable", tags: [TAGS[5], TAGS[0], TAGS[1], TAGS[2]] },
      { id: 14, text: "Cinematicas", tags: [TAGS[4], TAGS[2], TAGS[6]] },
    ],
  },
];

function Tablero() {
  const [columns, setColumns] = useState<Column[]>(INITIAL);

  const addCard = (colId: string) => {
    const text = window.prompt("Nombre de la tarjeta");
    if (!text) return;
    setColumns((cols) =>
      cols.map((c) =>
        c.id === colId
          ? { ...c, cards: [...c.cards, { id: nextId++, text, tags: TAGS.slice(0, 2) }] }
          : c,
      ),
    );
  };

  const toggle = (colId: string, cardId: number) => {
    sfx.tick();
    setColumns((cols) =>
      cols.map((c) =>
        c.id === colId
          ? {
              ...c,
              cards: c.cards.map((k) => (k.id === cardId ? { ...k, done: !k.done } : k)),
            }
          : c,
      ),
    );
  };

  return (
    <main
      className="relative min-h-[100svh] overflow-x-hidden"
      style={
        {
          "--tex-parchment": `url(${texParchment})`,
          "--tex-panel": `url(${texPanel})`,
          "--tex-gold": `url(${texGold})`,
          "--tex-btn": `url(${btnFrame.url})`,
          "--tex-btn-gold": `url(${btnFrameGold.url})`,
        } as React.CSSProperties
      }
    >
      <div className="texture-panel fixed inset-0 bg-[var(--panel-frame)]" />
      <div className="texture-noise pointer-events-none fixed inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col gap-5 p-3 py-5 sm:gap-8 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-gold-texture text-base sm:text-3xl">TABLERO DE MISIONES</h1>
          <Link to="/">
            <PixelButton size="sm" className="flex flex-col items-center gap-1">
              <span>MENU</span>
              <DoorOpen className="size-5" aria-hidden />
            </PixelButton>
          </Link>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-4 sm:gap-5">
          {columns.map((col, i) => (
            <section
              key={col.id}
              className="animate-panel-pop border-tex flex w-[78vw] shrink-0 flex-col gap-3 border-[14px] p-2 sm:w-72 sm:gap-4"
              style={{ animationDelay: `${i * 0.08}s`, backgroundColor: col.tone }}
            >
              <div className="border-tex-parchment flex items-center justify-between gap-2 border-[12px] px-1">
                <h2 className="text-pixel-shadow text-[10px] text-primary-foreground sm:text-xs">
                  {col.title}
                </h2>
                <span className="border-tex flex size-6 items-center justify-center border-[6px] text-[10px] text-foreground">
                  {col.cards.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {col.cards.map((card) => (
                  <article
                    key={card.id}
                    onMouseEnter={() => sfx.hover()}
                    className="border-tex-parchment animate-slide-left border-[12px] p-1 transition-transform duration-100 hover:-translate-y-0.5"
                  >
                    {card.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {card.tags.map((t, ti) => (
                          <span
                            key={ti}
                            className="h-2 w-7 rounded-none"
                            style={{ backgroundColor: t }}
                            aria-hidden
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {col.id === "backlog" && (
                        <button
                          type="button"
                          onClick={() => toggle(col.id, card.id)}
                          aria-pressed={!!card.done}
                          aria-label={`Marcar ${card.text}`}
                          className="flex size-5 shrink-0 items-center justify-center border-2 border-[var(--panel-frame)]"
                          style={{
                            backgroundColor: card.done ? "var(--tag-green)" : "transparent",
                          }}
                        >
                          {card.done && <Check className="size-4 text-[var(--panel-frame)]" />}
                        </button>
                      )}
                      <p className="text-[10px] leading-relaxed text-primary-foreground sm:text-xs">
                        {card.text}
                      </p>
                    </div>
                  </article>
                ))}

                <PixelButton
                  size="sm"
                  onClick={() => addCard(col.id)}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Plus className="size-4" aria-hidden />
                  <span className="text-[10px]">AÑADIR TARJETA</span>
                </PixelButton>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
