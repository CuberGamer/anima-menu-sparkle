import { Link } from "@tanstack/react-router";

import { PixelButton } from "./PixelButton";

type Props = {
  title: string;
  detail: string;
  score: number;
  onRestart: () => void;
};

/** Pantalla final reutilizable para victoria y derrota. */
export function GameOverlay({ title, detail, score, onRestart }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[oklch(0_0_0/0.72)] px-4">
      <div className="card-sprite animate-panel-pop w-full max-w-md px-4 py-5 text-center sm:px-6 sm:py-7">
        <h2 className="text-xs text-primary-foreground sm:text-lg">{title}</h2>
        <p className="mt-3 text-[8px] leading-relaxed text-muted-foreground sm:text-[11px]">
          {detail}
        </p>
        <p className="mt-3 text-[10px] text-primary-foreground sm:text-sm">
          PUNTAJE: {score}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <PixelButton size="sm" onClick={onRestart}>
            REINTENTAR
          </PixelButton>
          <Link to="/">
            <PixelButton size="sm">MENU</PixelButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
