import { useEffect, useState } from "react";
import { Maximize, RotateCcw } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { GAME_TEXTURE_VARS } from "@/lib/textures";

type OrientationLockScreen = Screen & {
  orientation?: { lock?: (o: string) => Promise<void> };
};

export function RotateGate() {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const check = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setPortrait(isTouch && isPortrait && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const goFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      const screenApi = window.screen as OrientationLockScreen;
      await screenApi.orientation?.lock?.("landscape");
    } catch {
      /* el navegador puede rechazarlo: el aviso se mantiene */
    }
  };

  if (!portrait) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[var(--panel-frame)] p-6 text-center"
      style={GAME_TEXTURE_VARS}
    >
      <div className="panel-sprite w-full max-w-sm p-6">
        <RotateCcw className="animate-float-hat mx-auto mb-4 size-12 text-primary" aria-hidden />
        <h2 className="text-gold-texture text-base">ROTA EL CELULAR</h2>
        <p className="mt-4 text-[10px] leading-relaxed text-card-foreground">
          INFILTRADOS SE JUEGA EN HORIZONTAL.
          <br />
          GIRA TU DISPOSITIVO PARA CONTINUAR.
        </p>
        <div className="mt-6 flex justify-center">
          <PixelButton size="sm" onClick={goFullscreen} className="flex items-center gap-2">
            <Maximize className="size-4" aria-hidden />
            <span>PANTALLA COMPLETA</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
