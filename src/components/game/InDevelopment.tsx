import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorOpen, Hammer } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { currentSaveName } from "@/lib/saves";

import texParchment from "@/assets/tex-parchment.png";
import texPanel from "@/assets/tex-panel.jpg";
import texGold from "@/assets/tex-gold.jpg";
import panelTile from "@/assets/panel-tile-cleaned.jpeg.asset.json";
import btnFrame from "@/assets/btn-frame.png.asset.json";
import btnFrameGold from "@/assets/btn-frame-gold.png.asset.json";
import cardFrame from "@/assets/card-frame.png.asset.json";
import panelDark from "@/assets/panel-dark.png.asset.json";
import keycap from "@/assets/keycap.png.asset.json";

export function InDevelopment() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(currentSaveName());
  }, []);

  return (
    <main
      className="relative flex min-h-[100svh] items-center justify-center overflow-x-hidden p-4"
      style={
        {
          "--tex-parchment": `url(${texParchment})`,
          "--tex-panel": `url(${texPanel})`,
          "--tex-gold": `url(${texGold})`,
          "--tex-cell-panel": `url(${panelTile.url})`,
          "--tex-btn": `url(${btnFrame.url})`,
          "--tex-btn-gold": `url(${btnFrameGold.url})`,
          "--tex-card": `url(${cardFrame.url})`,
          "--tex-dark": `url(${panelDark.url})`,
          "--tex-key": `url(${keycap.url})`,
        } as React.CSSProperties
      }
    >
      <div className="texture-panel fixed inset-0 bg-[var(--panel-frame)]" />
      <div className="texture-noise pointer-events-none fixed inset-0" />

      <section className="animate-panel-pop panel-sprite relative z-10 w-full max-w-xl p-6 text-center sm:p-10">
        <Hammer
          className="animate-float-hat mx-auto mb-6 size-10 text-primary sm:size-14"
          aria-hidden
        />
        <h1 className="text-gold-texture text-xl sm:text-4xl">EN DESARROLLO</h1>
        <div className="card-sprite mx-auto mt-6 max-w-md px-3 py-2">
          <p className="text-[10px] leading-relaxed text-primary-foreground sm:text-xs">
            {name ? `PARTIDA: ${name}` : "PARTIDA SIN NOMBRE"}
            <br />
            EL MAPA JUGABLE LLEGA PRONTO.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <PixelButton size="md" className="flex items-center gap-2">
              <DoorOpen className="size-5" aria-hidden />
              <span>VOLVER AL MENU</span>
            </PixelButton>
          </Link>
        </div>
      </section>
    </main>
  );
}
