import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "lg" | "md" | "sm";
};

export function PixelButton({ className, size = "lg", onMouseEnter, onClick, ...props }: Props) {
  return (
    <button
      {...props}
      onMouseEnter={(e) => {
        sfx.hover();
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        sfx.click();
        onClick?.(e);
      }}
      className={cn(
        "group relative select-none text-secondary-foreground uppercase tracking-wider",
        "btn-sprite transition-all duration-100 touch-manipulation",
        "hover:-translate-y-0.5 hover:btn-sprite-gold",
        "active:translate-y-1 active:btn-sprite-gold",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
        size === "lg" &&
          "min-h-12 px-4 py-3 text-xs border-[10px] sm:px-8 sm:py-4 sm:text-base sm:border-[14px]",
        size === "md" &&
          "min-h-11 px-3 py-2 text-[10px] border-[8px] sm:px-5 sm:py-3 sm:text-sm sm:border-[10px]",
        size === "sm" && "min-h-11 px-3 py-2 text-[10px] border-[8px]",
        className,
      )}
    />
  );
}
