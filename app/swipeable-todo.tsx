"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  id: number;
  text: string;
  completed: boolean;
  isNew?: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

const THRESHOLD = 80;
const DAMPING = 0.55;

export function SwipeableTodo({ id, text, completed, isNew, onToggle, onDelete }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<"x" | "y" | null>(null);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "dismissing" | "collapsing">("idle");
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (phase !== "dismissing") return;
    const t = setTimeout(() => setPhase("collapsing"), 280);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "collapsing") return;
    const t = setTimeout(() => onDelete(id), 220);
    return () => clearTimeout(t);
  }, [phase, id, onDelete]);

  function clampDrag(dx: number) {
    const clamped = Math.min(0, dx);
    const abs = Math.abs(clamped);
    if (abs <= THRESHOLD) return clamped;
    const over = abs - THRESHOLD;
    return -(THRESHOLD + over * DAMPING);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (phase !== "idle") return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    axis.current = null;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (phase !== "idle") return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!axis.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (axis.current !== "x") return;
    setOffset(clampDrag(dx));
  }

  function onTouchEnd() {
    if (phase !== "idle") return;
    setDragging(false);

    if (axis.current === "x" && Math.abs(offset) >= THRESHOLD) {
      const width = cardRef.current?.offsetWidth ?? 320;
      setOffset(-(width + 40));
      setPhase("dismissing");
    } else {
      setOffset(0);
    }
    axis.current = null;
  }

  const progress = Math.min(1, Math.abs(offset) / THRESHOLD);
  const pastThreshold = Math.abs(offset) >= THRESHOLD;

  const shellClass = [
    "relative overflow-hidden",
    phase === "collapsing" ? "todo-collapse" : isNew ? "todo-enter" : "",
  ].join(" ");

  const cardTransition = dragging
    ? "none"
    : phase === "dismissing"
      ? "transform 0.28s cubic-bezier(0.4, 0, 1, 1)"
      : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)";

  return (
    <div className={shellClass}>
      {/* Delete backdrop */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4"
        style={{
          background: "var(--danger)",
          opacity: progress * progress,
          transition: dragging ? "none" : "opacity 0.2s ease",
        }}
      >
        <span
          className="text-xs font-medium uppercase tracking-widest text-white"
          style={{
            opacity: progress > 0.3 ? 1 : 0,
            transform: `translateX(${(1 - progress) * 8}px)`,
            transition: dragging ? "none" : "opacity 0.15s ease, transform 0.2s ease",
          }}
        >
          {pastThreshold ? "Release" : "Delete"}
        </span>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="todo-card relative flex select-none items-center gap-3 px-3 py-3"
        style={{
          background: "#ffffff",
          transform: `translateX(${offset}px)`,
          touchAction: "pan-y",
          transition: cardTransition,
        }}
      >
        {/* Checkbox */}
        <div
          onClick={() => {
            setSettling(true);
            onToggle(id);
          }}
          onAnimationEnd={() => setSettling(false)}
          className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ${settling ? "checkbox-pop" : ""}`}
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
