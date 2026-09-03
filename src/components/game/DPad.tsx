import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

import type { MoveInput } from "@/hooks/usePlayerMovement";

type Props = {
  onInput: (input: MoveInput) => void;
};

const DIRS: { key: string; label: string; icon: typeof ChevronUp; input: MoveInput; cls: string }[] = [
  { key: "up", label: "Mover arriba", icon: ChevronUp, input: { dx: 0, dy: -1 }, cls: "col-start-2 row-start-1" },
  { key: "left", label: "Mover izquierda", icon: ChevronLeft, input: { dx: -1, dy: 0 }, cls: "col-start-1 row-start-2" },
  { key: "right", label: "Mover derecha", icon: ChevronRight, input: { dx: 1, dy: 0 }, cls: "col-start-3 row-start-2" },
  { key: "down", label: "Mover abajo", icon: ChevronDown, input: { dx: 0, dy: 1 }, cls: "col-start-2 row-start-3" },
];

/** Control tactil reutilizable: mantiene el movimiento mientras se presiona. */
export function DPad({ onInput }: Props) {
  const stop = () => onInput({ dx: 0, dy: 0 });

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1" role="group" aria-label="Controles de movimiento">
      {DIRS.map((d) => {
        const Icon = d.icon;
        return (
          <button
            key={d.key}
            type="button"
            aria-label={d.label}
            className={
              "key-sprite flex size-11 items-center justify-center touch-manipulation active:scale-95 sm:size-12 " +
              d.cls
            }
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              onInput(d.input);
            }}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Icon className="size-6 text-secondary-foreground" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
