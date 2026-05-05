import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InfoCard({
  trigger,
  title,
  subtitle,
  avatar,
  avatarColor = "bg-primary/20 text-primary border-primary/30",
  rows = [],
  footer,
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState("top");
  const [cardStyle, setCardStyle] = useState({ left: "12px", top: "12px" });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, 120);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const nextPosition = spaceAbove < 200 && spaceBelow > spaceAbove ? "bottom" : "top";
      const cardWidth = 288;
      const gap = 12;
      const left = Math.min(
        Math.max(12, rect.left),
        window.innerWidth - cardWidth - 12
      );
      const top = nextPosition === "top"
        ? Math.max(12, rect.top - gap)
        : Math.min(window.innerHeight - 12, rect.bottom + gap);

      setPosition(nextPosition);
      setCardStyle({
        left: `${left}px`,
        top: `${top}px`,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible]);

  const card = (
    <div
      className={`fixed z-[9999] w-72 transition-all duration-200 ease-out ${
        visible
          ? "pointer-events-auto opacity-100 scale-100"
          : "pointer-events-none opacity-0 scale-95"
      }`}
      style={{
        ...cardStyle,
        transform: position === "top" ? "translateY(-100%)" : "translateY(0)",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        className="overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,20,30,0.95) 0%, rgba(10,15,24,0.98) 100%)",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.6), inset 0 0 0.5px rgba(255,255,255,0.1)",
        }}
      >
        {(title || avatar) && (
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            {avatar && (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${avatarColor}`}
              >
                {avatar}
              </div>
            )}
            <div className="min-w-0">
              {title && <p className="truncate text-sm font-semibold text-white">{title}</p>}
              {subtitle && (
                <span
                  className="text-[0.6rem] font-medium uppercase tracking-widest"
                  style={{ color: "#C8F53A" }}
                >
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-2.5 px-4 py-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-xs text-gray-400 transition-colors hover:text-white"
              >
                {row.icon && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {row.icon}
                  </div>
                )}
                <div className="min-w-0">
                  {row.label && (
                    <p className="mb-0.5 text-[0.6rem] uppercase text-gray-600">
                      {row.label}
                    </p>
                  )}
                  <p className="truncate">{row.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {footer && (
          <div className="border-t border-white/10 bg-black/20 px-4 py-2">
            {footer}
          </div>
        )}
      </div>

      <div
        className={`absolute left-4 h-3 w-3 rotate-45 border-white/10 bg-[#0A0F18] ${
          position === "top"
            ? "bottom-[-6px] border-b border-r"
            : "top-[-6px] border-l border-t"
        }`}
      />
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {trigger}
      {typeof document !== "undefined" ? createPortal(card, document.body) : null}
    </div>
  );
}
