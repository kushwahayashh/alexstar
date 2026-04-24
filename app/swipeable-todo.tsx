"use client";

import { useRef, useState } from "react";

type Props = {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export function SwipeableTodo({ id, text, completed, onToggle, onDelete }: Props) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const locked = useRef<"horizontal" | "vertical" | null>(null);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [popping, setPopping] = useState(false);
  const threshold = 80;

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0;
    locked.current = null;
    setSwiping(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        locked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }
      return;
    }

    if (locked.current === "vertical") return;

    const clamped = Math.min(0, dx);
    currentX.current = clamped;
    setOffset(clamped);
  }

  function onTouchEnd() {
    setSwiping(false);
    if (locked.current === "horizontal" && currentX.current < -threshold) {
      setExiting(true);
      setTimeout(() => onDelete(id), 250);
    } else {
      setOffset(0);
    }
    locked.current = null;
  }

  return (
    <div className={`relative overflow-hidden ${exiting ? "todo-exit" : "todo-enter"}`}>
      {/* Red backdrop */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4"
        style={{ background: "var(--danger)", opacity: Math.min(1, Math.abs(offset) / threshold) }}
      >
        <span className="text-xs font-medium tracking-wide text-white uppercase">Delete</span>
      </div>

      {/* Item */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative flex select-none items-center gap-3 py-3 px-3"
        style={{
          background: "#ffffff",
          transform: `translateX(${offset}px)`,
          transition: swiping ? "none" : "transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)",
        }}
      >
        {/* Checkbox */}
        <div
          onClick={() => {
            setPopping(true);
            onToggle(id);
          }}
          onAnimationEnd={() => setPopping(false)}
          className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ${popping ? "checkbox-pop" : ""}`}
          style={{
            border: completed ? "none" : "1.5px solid var(--fg-secondary)",
            background: completed ? "var(--fg)" : "transparent",
          }}
        >
          {completed && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Text */}
        <span
          className="text-[15px] leading-tight transition-colors duration-150"
          style={{
            color: completed ? "var(--fg-done)" : "var(--fg)",
            textDecorationLine: completed ? "line-through" : "none",
            textDecorationColor: completed ? "var(--fg-done)" : undefined,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
