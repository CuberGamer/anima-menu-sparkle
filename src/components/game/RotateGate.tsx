import { useEffect, useState } from "react";
import { Maximize, RotateCcw } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { GAME_TEXTURE_VARS } from "@/lib/textures";

type AnyElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type OrientationLockScreen = Screen & {
  orientation?: {
    lock?: (o: string) => Promise<void>;
    unlock?: () => void;
  };
  mozLockOrientation?: (o: string) => Promise<boolean> | boolean;
  msLockOrientation?: (o: string) => Promise<boolean> | boolean;
};

export function RotateGate() {
  const [portrait, setPortrait] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const check = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setPortrait(isTouch && isPortrait && window.innerWidth < 1024);
      if (!isPortrait) setHint(null);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const enterFullscreen = async () => {
    const el = document.documentElement as AnyElement;

    if (document.fullscreenElement) return;

    const request =
      el.requestFullscreen?.bind(el) ??
      el.webkitRequestFullscreen?.bind(el) ??
      el.msRequestFullscreen?.bind(el);

    if (!request) {
      throw new Error("Fullscreen API no disponible");
    }

    await request();
  };

  const lockLandscape = async () => {
    const screenApi = window.screen as OrientationLockScreen;

    if (screenApi.orientation?.lock) {
      try {
        await screenApi.orientation.lock("landscape");
        return;
      } catch {
        try {
          await screenApi.orientation.lock("landscape-primary");
          return;
        } catch {
          /* sigue con alternativas */
        }
      }
    }

    const legacyLock =
      (screenApi as unknown as { lockOrientation?: (o: string) => Promise<boolean> | boolean })
        .lockOrientation ??
      screenApi.mozLockOrientation ??
      screenApi.msLockOrientation;

    if (legacyLock) {
      const ok = await legacyLock("landscape");
      if (!ok) throw new Error("No se pudo bloquear orientación");
      return;
    }

    throw new Error("Screen Orientation API no disponible");
  };

  const goFullscreen = async () => {
    setHint(null);

    try {
      await enterFullscreen();
    } catch (fsErr) {
      setHint("Tu navegador no permite pantalla completa automática. Gira el celular manualmente.");
      return;
    }

    try {
      await lockLandscape();
    } catch {
      setHint("Pantalla completa activada. Si no gira solo, gira el celular manualmente.");
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
        {hint && (
          <p className="mt-4 text-[10px] leading-relaxed text-destructive">{hint}</p>
        )}
      </div>
    </div>
  );
}
