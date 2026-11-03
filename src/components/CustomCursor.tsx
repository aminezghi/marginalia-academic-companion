import React, { useEffect, useState, useRef } from 'react';

interface CustomCursorProps {
  isHoveringActive?: boolean;
  label?: string;
  isInteractive?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  isHoveringActive = false,
  label = 'OPEN',
  isInteractive = false,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const reqId = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports fine hover (desktop mouse)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Single requestAnimationFrame loop for fluid, non-jittery interpolation
    const render = () => {
      const ease = 0.22;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;
      setPos({ x: currentPos.current.x, y: currentPos.current.y });
      reqId.current = requestAnimationFrame(render);
    };
    reqId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (reqId.current) cancelAnimationFrame(reqId.current);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        left: 0,
        top: 0,
      }}
    >
      {isHoveringActive ? (
        /* Expanded OPEN / EXPLORE circular lens */
        <div className="relative -left-12 -top-12 w-24 h-24 rounded-full bg-[#1F3FB0] text-white flex flex-col items-center justify-center text-[10px] font-mono tracking-widest uppercase shadow-2xl transition-all duration-200 animate-in zoom-in-75">
          <span className="font-bold">{label.split(' / ')[0]}</span>
          <span className="text-[8px] opacity-75">{label.split(' / ')[1] || 'EXPLORE'}</span>
          <div className="w-4 h-[1px] bg-white/60 my-1" />
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="7 17 17 7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>
      ) : isInteractive ? (
        /* Subtle interactive ring indicator */
        <div className="relative -left-3.5 -top-3.5 w-7 h-7 rounded-full border border-[#1F3FB0] bg-[#1F3FB0]/10 transition-all duration-150 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1F3FB0]" />
        </div>
      ) : (
        /* Minimalist pinpoint dot */
        <div className="relative -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#141414]/70 transition-all duration-150" />
      )}
    </div>
  );
};
