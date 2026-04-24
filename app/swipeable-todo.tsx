"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export function SwipeableTodo({ id, text, completed, onToggle, onDelete }: Props) {
  const itemRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const locked = useRef<"horizontal" | "vertical" | null>(null);
  const dismissTimer = useRef<number | null>(null);
  const deleteTimer = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [settling, setSettling] = useState(false);
  const threshold = 92;
  const dismissDuration = 320;
  const collapseDuration = 240;

  useEffect(() => {
    return () => {
      if (dismissTimer.current) {
        window.clearTimeout(dismissTimer.current);
      }

      if (deleteTimer.current) {
        window.clearTimeout(deleteTimer.current);
      }
    };
  }, []);

  function getDragOffset(dx: number) {
    const leftOnly = Math.min(0, dx);
    const distance = Math.abs(leftOnly);

    if (distance <= threshold) {
      return leftOnly * 0.92;
    }

    const overflow = distance - threshold;
    const softened = threshold * 0.92 + overflow * 0.32;
    return -Math.min(softened, 176);
  }

  function onTouchStart(e: React.TouchEvent) {
    if (dismissing || collapsing) return;

    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = offset;
    locked.current = null;
    setSwiping(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (dismissing || collapsing) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }

    if (locked.current === "vertical") return;
    if (locked.current !== "horizontal") return;

    const nextOffset = getDragOffset(dx);
    currentX.current = nextOffset;
    setOffset(nextOffset);
  }

  function onTouchEnd() {
    if (dismissing || collapsing) return;

    setSwiping(false);

    if (locked.current === "horizontal" && currentX.current < -threshold) {
      const itemWidth = itemRef.current?.offsetWidth ?? 320;
      const dismissOffset = -(itemWidth + 56);

      setDismissing(true);
      currentX.current = dismissOffset;
      setOffset(dismissOffset);

      dismissTimer.current = window.setTimeout(() => {
        setCollapsing(true);
      }, dismissDuration - 36);

      deleteTimer.current = window.setTimeout(() => {
        onDelete(id);
      }, dismissDuration + collapseDuration - 28);
    } else {
      currentX.current = 0;
      setOffset(0);
    }

    locked.current = null;
  }

  const dragProgress = Math.min(1, Math.abs(offset) / threshold);
  const backdropOpacity = dragProgress === 0 ? 0 : 0.14 + dragProgress * 0.86;
  const labelOpacity = dragProgress === 0 ? 0 : 0.24 + dragProgress * 0.76;

  return (
    <div className={`todo-shell relative overflow-hidden ${collapsing ? "todo-collapse" : "todo-enter"}`}>
      {/* Red backdrop */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4"
        style={{
          background: "var(--danger)",
          opacity: backdropOpacity,
          transform: `scale(${1 - (1 - dragProgress) * 0.012})`,
          transition: swiping ? "none" : "opacity 240ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span
          className="text-xs font-medium uppercase text-white"
          style={{
            letterSpacing: "0.14em",
            opacity: labelOpacity,
            transform: `translateX(${(1 - dragProgress) * 10}px) scale(${0.96 + dragProgress * 0.04})`,
            transition: swiping ? "none" : "opacity 240ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          Delete
        </span>
      </div>

      {/* Item */}
      <div
        ref={itemRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="todo-card relative flex select-none items-center gap-3 px-3 py-3"
        style={{
          background: "#ffffff",
          transform: `translateX(${offset}px)`,
          touchAction: "pan-y",
          transition: swiping
            ? "none"
            : dismissing
              ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "transform 460ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Checkbox */}
        <div
          onClick={() => {
            setSettling(true);
            onToggle(id);
          }}
          onAnimationEnd={() => setSettling(false)}
          className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ${settling ? "checkbox-settle" : ""}`}
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
