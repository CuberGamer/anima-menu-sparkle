import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorOpen, Hammer } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { currentSaveName } from "@/lib/saves";

import { GAME_TEXTURE_VARS } from "@/lib/textures";
import { RotateGate } from "./RotateGate";

export function InDevelopment() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(currentSaveName());
  }, []);

  return (
    <main
      className="relative flex min-h-[100svh] items-center justify-center overflow-x-hidden p-4"
      style={GAME_TEXTURE_VARS}
    >
      <RotateGate />
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
