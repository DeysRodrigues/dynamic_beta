import { useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
}

export default function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "color-mix(in srgb, var(--primary, #6366f1) 15%, transparent)",
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    props.onMouseMove?.(e);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    setOpacity(1);
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    setOpacity(0);
    props.onMouseLeave?.(e);
  };

  return (
    <div
      ref={divRef}
      {...props}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-500",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
