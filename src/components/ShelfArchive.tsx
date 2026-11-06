import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useMotionValueEvent,
  animate,
  AnimationPlaybackControls,
} from 'motion/react';
import {
  CollectionAppearance,
  ResearchItem,
  ShelfWoodMaterial,
} from '../types/research';
import { PhysicalCover } from './PhysicalCover';
import { PhysicalSpine } from './PhysicalSpine';
import {
  DEFAULT_CATEGORY_APPEARANCES,
  SHELF_WOOD_MATERIALS,
  resolveBookAppearance,
} from '../data/bookAppearanceData';
import { playPaperRustle, playTactileClick } from '../utils/sound';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { VintageBankersLamp } from './VintageBankersLamp';

interface ShelfArchiveProps {
  items: ResearchItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenDetail: (item: ResearchItem) => void;
  onReadPaper?: (item: ResearchItem) => void;
  onCustomizeBook?: (item: ResearchItem) => void;
  shelfMaterial?: ShelfWoodMaterial;
  categoryAppearances?: Record<string, CollectionAppearance>;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  onCursorChange?: (state: {
    isHoveringActive?: boolean;
    label?: string;
    isInteractive?: boolean;
  }) => void;
}

interface PointerSample {
  x: number;
  time: number;
}

// Smooth cubic Hermite interpolation (0..1)
function smoothStep01(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// Framer Motion spring physics configuration for heavy vintage volumes
const SHELF_SPRING_CONFIG = {
  stiffness: 145,
  damping: 20,
  mass: 0.92,
  restDelta: 0.001,
  restSpeed: 0.01,
};

const INERTIA_TIME_CONSTANT = 0.28; // Seconds of momentum projection on release
const BOUNDARY_RUBBER_FACTOR = 0.28; // Elastic resistance when pulling past shelf ends

export const ShelfArchive: React.FC<ShelfArchiveProps> = ({
  items,
  activeIndex,
  onSelectIndex,
  onOpenDetail,
  onReadPaper,
  onCustomizeBook,
  shelfMaterial = 'walnut',
  categoryAppearances = DEFAULT_CATEGORY_APPEARANCES,
  isNightMode = false,
  onToggleNightMode,
  onCursorChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pulledOutBookId, setPulledOutBookId] = useState<string | null>(null);
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
  const [activeTilt, setActiveTilt] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const safeActiveIndex = Math.max(0, Math.min(items.length - 1, activeIndex));

  // Framer Motion physics primitives:
  const targetMotionValue = useMotionValue(safeActiveIndex);
  const springPosition = useSpring(targetMotionValue, SHELF_SPRING_CONFIG);
  const springVelocity = useVelocity(springPosition);

  const [visualState, setVisualState] = useState<{
    position: number;
    velocity: number;
  }>({
    position: safeActiveIndex,
    velocity: 0,
  });

  // Refs for gesture tracking & active spring animations
  const activeAnimationRef = useRef<AnimationPlaybackControls | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isDragGestureRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartTimeRef = useRef<number>(0);
  const dragLastXRef = useRef<number>(0);
  const totalDragPixelsRef = useRef<number>(0);
  const pointerHistoryRef = useRef<PointerSample[]>([]);
  const wheelSettleTimeoutRef = useRef<number | null>(null);
  const bookClickStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastBookClickTimeRef = useRef<number>(0);

  const lastSoundBookRef = useRef<number>(safeActiveIndex);
  const lastReportedSelectRef = useRef<number>(safeActiveIndex);
  const onSelectIndexRef = useRef(onSelectIndex);
  useEffect(() => {
    onSelectIndexRef.current = onSelectIndex;
  }, [onSelectIndex]);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  // Responsive book dimensions
  const coverWidth = isMobile ? 198 : isTablet ? 232 : 260;
  const baseBookHeight = isMobile ? 274 : isTablet ? 320 : 352;
  const activeCoverHeight = isMobile ? 294 : isTablet ? 344 : 380;
  const pixelsPerBookStep = isMobile ? 62 : isTablet ? 76 : 88;

  // Helper to launch a Framer Motion spring animation with explicit initial velocity & inertia
  const animateShelfToBook = useCallback(
    (
      targetBookIndex: number,
      initialVelocity?: number,
      customSpring?: Partial<typeof SHELF_SPRING_CONFIG>
    ) => {
      const maxIdx = Math.max(0, items.length - 1);
      const clampedTarget = Math.max(0, Math.min(maxIdx, targetBookIndex));

      activeAnimationRef.current?.stop();
      targetMotionValue.set(clampedTarget);

      const currentVel =
        initialVelocity !== undefined ? initialVelocity : springVelocity.get();

      activeAnimationRef.current = animate(springPosition, clampedTarget, {
        type: 'spring',
        stiffness: customSpring?.stiffness ?? SHELF_SPRING_CONFIG.stiffness,
        damping: customSpring?.damping ?? SHELF_SPRING_CONFIG.damping,
        mass: customSpring?.mass ?? SHELF_SPRING_CONFIG.mass,
        velocity: currentVel,
        restDelta: 0.001,
        restSpeed: 0.01,
      });

      if (clampedTarget !== lastReportedSelectRef.current) {
        lastReportedSelectRef.current = clampedTarget;
        onSelectIndexRef.current(clampedTarget);
      }
    },
    [items.length, springPosition, springVelocity, targetMotionValue]
  );

  // Subscribe to `springPosition` updates to drive continuous 3D layout & paper-rustle audio
  useMotionValueEvent(springPosition, 'change', (latestPos) => {
    const maxIdx = Math.max(0, items.length - 1);
    const nearestIdx = Math.max(0, Math.min(maxIdx, Math.round(latestPos)));

    if (nearestIdx !== lastSoundBookRef.current) {
      lastSoundBookRef.current = nearestIdx;
      playPaperRustle();
    }

    if (nearestIdx !== lastReportedSelectRef.current) {
      lastReportedSelectRef.current = nearestIdx;
      onSelectIndexRef.current(nearestIdx);
    }

    const latestVel = springVelocity.get();
    setVisualState({
      position: latestPos,
      velocity: latestVel,
    });
  });

  // Sync external `activeIndex` changes (e.g. Category tabs, keyboard arrows, caption dots)
  useEffect(() => {
    if (
      !isDraggingRef.current &&
      safeActiveIndex !== lastReportedSelectRef.current
    ) {
      lastReportedSelectRef.current = safeActiveIndex;
      animateShelfToBook(safeActiveIndex);
    }
  }, [safeActiveIndex, animateShelfToBook]);

  // Viewport resize listener
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const woodTheme =
    SHELF_WOOD_MATERIALS.find((m) => m.id === shelfMaterial) ||
    SHELF_WOOD_MATERIALS[0];

  // Calculate gesture velocity (in books/sec) from recent pointer history
  const computeGestureVelocity = useCallback(
    (now: number): number => {
      const samples = pointerHistoryRef.current.filter(
        (s) => now - s.time <= 115
      );
      if (samples.length < 2) return 0;

      const newest = samples[samples.length - 1];
      if (now - newest.time > 80) return 0;

      let anchor = samples[0];
      for (let i = samples.length - 2; i >= 0; i--) {
        const dtMs = newest.time - samples[i].time;
        anchor = samples[i];
        if (dtMs >= 32) break;
      }

      const dtSec = (newest.time - anchor.time) / 1000;
      if (dtSec < 0.004) return 0;

      const dxPixels = newest.x - anchor.x;
      return -dxPixels / pixelsPerBookStep / dtSec;
    },
    [pixelsPerBookStep]
  );

  // Shared drag start / move / end logic for both Mouse (`window` listeners) and Touch
  const beginDragAt = useCallback(
    (clientX: number, isTouch = false) => {
      activeAnimationRef.current?.stop();
      if (wheelSettleTimeoutRef.current) {
        window.clearTimeout(wheelSettleTimeoutRef.current);
        wheelSettleTimeoutRef.current = null;
      }
      const now = performance.now();
      isDraggingRef.current = true;
      isDragGestureRef.current = false;
      isTouchRef.current = isTouch;
      dragStartXRef.current = clientX;
      dragStartTimeRef.current = now;
      dragLastXRef.current = clientX;
      totalDragPixelsRef.current = 0;
      pointerHistoryRef.current = [{ x: clientX, time: now }];
    },
    []
  );

  const moveDragAt = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return;
      const now = performance.now();
      const dx = clientX - dragLastXRef.current;
      const displacement = Math.abs(clientX - dragStartXRef.current);
      totalDragPixelsRef.current = displacement;

      // Generous deadzone slop to differentiate intentional swipe vs micro tap contact:
      const slop = isTouchRef.current ? 16 : 8;
      if (displacement > slop) {
        isDragGestureRef.current = true;
        if (!isMouseDragging) {
          setIsMouseDragging(true);
        }
      }

      // If user hasn't exceeded the deadzone, do NOT move the shelf!
      if (!isDragGestureRef.current) {
        return;
      }

      const maxIdx = Math.max(0, items.length - 1);
      const currentPos = springPosition.get();
      const isOutOfBounds =
        (currentPos < 0 && dx > 0) || (currentPos > maxIdx && dx < 0);
      const resistance = isOutOfBounds ? BOUNDARY_RUBBER_FACTOR : 1;

      const dIndex = (-dx / pixelsPerBookStep) * resistance;
      const nextPos = Math.max(
        -0.65,
        Math.min(maxIdx + 0.65, currentPos + dIndex)
      );

      targetMotionValue.set(nextPos);
      springPosition.set(nextPos);

      pointerHistoryRef.current.push({ x: clientX, time: now });
      if (pointerHistoryRef.current.length > 24) {
        pointerHistoryRef.current = pointerHistoryRef.current.filter(
          (s) => now - s.time <= 125
        );
      }

      dragLastXRef.current = clientX;
    },
    [
      isMouseDragging,
      items.length,
      pixelsPerBookStep,
      springPosition,
      targetMotionValue,
    ]
  );

  const finishDragAt = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsMouseDragging(false);

      const now = performance.now();
      pointerHistoryRef.current.push({ x: clientX, time: now });

      const wasDragGesture = isDragGestureRef.current;
      // Preserve isDragGestureRef for 100ms so synthetic click event after mouseup/touchend ignores it
      setTimeout(() => {
        isDragGestureRef.current = false;
      }, 100);

      const displacement = Math.abs(clientX - dragStartXRef.current);
      const slop = isTouchRef.current ? 18 : 10;

      if (wasDragGesture && displacement > slop) {
        const gestureVel = computeGestureVelocity(now) * 1.2;
        const motionVel = springVelocity.get();
        const rawReleaseVel =
          Math.abs(gestureVel) >= Math.abs(motionVel) ? gestureVel : motionVel;
        const releaseVelocity = Math.max(-18, Math.min(18, rawReleaseVel));

        const maxIdx = Math.max(0, items.length - 1);
        const currentPos = springPosition.get();

        const projectedPos =
          currentPos + releaseVelocity * INERTIA_TIME_CONSTANT;
        const targetBook = Math.max(
          0,
          Math.min(maxIdx, Math.round(projectedPos))
        );

        const booksThrown = Math.abs(targetBook - currentPos);
        const springOverrides =
          booksThrown > 1.2
            ? { stiffness: 115, damping: 17.5, mass: 1.0 }
            : SHELF_SPRING_CONFIG;

        setPulledOutBookId(items[targetBook]?.id || null);
        animateShelfToBook(targetBook, releaseVelocity, springOverrides);
      }
    },
    [
      animateShelfToBook,
      computeGestureVelocity,
      items,
      springPosition,
      springVelocity,
    ]
  );

  // Mouse drag handlers (attaches window listeners so dragging works smoothly across the entire screen)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest('[data-shelf-nav-btn="true"]') ||
      (e.target as HTMLElement).closest('[data-lamp="true"]') ||
      (e.target as HTMLElement).closest('[data-shelf-book="true"]')
    ) {
      return;
    }
    beginDragAt(e.clientX, false);
  };

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      moveDragAt(e.clientX);
    };
    const onWindowMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      finishDragAt(e.clientX);
    };
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [moveDragAt, finishDragAt]);

  // Touch drag handlers for mobile/tablet with touch slop awareness
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest('[data-shelf-nav-btn="true"]') ||
      (e.target as HTMLElement).closest('[data-lamp="true"]')
    ) {
      return;
    }
    if (e.touches.length > 0) {
      beginDragAt(e.touches[0].clientX, true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    moveDragAt(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const endX =
      e.changedTouches.length > 0
        ? e.changedTouches[0].clientX
        : dragLastXRef.current;
    finishDragAt(endX);
  };

  // Wheel & Trackpad scrolling with Framer Motion spring inertia & settling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();

      activeAnimationRef.current?.stop();

      const maxIdx = Math.max(0, items.length - 1);
      const rawDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const stepDelta = Math.max(-0.85, Math.min(0.85, rawDelta / 150));

      const currentTarget = targetMotionValue.get();
      const nextTarget = Math.max(
        -0.35,
        Math.min(maxIdx + 0.35, currentTarget + stepDelta)
      );

      targetMotionValue.set(nextTarget);

      if (wheelSettleTimeoutRef.current) {
        window.clearTimeout(wheelSettleTimeoutRef.current);
      }

      wheelSettleTimeoutRef.current = window.setTimeout(() => {
        const vel = springVelocity.get();
        const pos = springPosition.get();
        const projected = pos + vel * 0.2;
        const snapBook = Math.max(0, Math.min(maxIdx, Math.round(projected)));
        animateShelfToBook(snapBook, vel);
      }, 110);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [
    items.length,
    targetMotionValue,
    springPosition,
    springVelocity,
    animateShelfToBook,
  ]);

  // Active cover 3D mouse tilt
  const handleActiveMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || isDraggingRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = -((y - centerY) / centerY) * 4.5;
      const tiltY = ((x - centerX) / centerX) * 5.5;
      setActiveTilt({ x: tiltX, y: tiltY });
    },
    [isMobile]
  );

  const handleActiveMouseLeave = useCallback(() => {
    setActiveTilt({ x: 0, y: 0 });
    onCursorChange?.({ isHoveringActive: false });
  }, [onCursorChange]);

  const handleActiveMouseEnter = useCallback(() => {
    onCursorChange?.({ isHoveringActive: true, label: 'PULL / INSPECT' });
  }, [onCursorChange]);

  if (!items.length) {
    return (
      <div className="h-[360px] md:h-[420px] flex items-center justify-center text-xs md:text-sm text-[#77736B] font-mono">
        NO ARCHIVE VOLUMES IN SELECTED COLLECTION
      </div>
    );
  }

  const visualIndex = visualState.position;
  const currentVelocity = visualState.velocity;

  // 1. Precompute each book's continuous `openFactor` (0 = spine, 1 = active pulled-out cover)
  const activeExtraMargin = isMobile ? 16 : 26;
  const bookLayout = items.map((item, idx) => {
    const app = resolveBookAppearance(item, idx, categoryAppearances);
    const spineW = isMobile
      ? app.sizeConfig.spineWidthMobile
      : isTablet
      ? app.sizeConfig.spineWidthTablet
      : app.sizeConfig.spineWidthDesktop;
    const spineH = baseBookHeight + app.microHeightDelta;

    const distFromFocus = Math.abs(idx - visualIndex);
    const openFactor = smoothStep01(1 - distFromFocus / 0.85);

    const currentWidth = spineW + openFactor * (coverWidth - spineW);
    const currentHeight = spineH + openFactor * (activeCoverHeight - spineH);
    const shelfSlotWidth = currentWidth + 2 + openFactor * activeExtraMargin;

    return {
      app,
      spineW,
      spineH,
      openFactor,
      distFromFocus,
      currentWidth,
      currentHeight,
      shelfSlotWidth,
      centerX: 0,
    };
  });

  // 2. Accumulate continuous book center coordinates along the shelf
  let runningX = 0;
  for (let i = 0; i < bookLayout.length; i++) {
    runningX += bookLayout[i].shelfSlotWidth / 2;
    bookLayout[i].centerX = runningX;
    runningX += bookLayout[i].shelfSlotWidth / 2;
  }

  // 3. Interpolate the continuous camera focus coordinate `rawCameraX` at `visualIndex`
  const maxIdx = bookLayout.length - 1;
  const clampedVisual = Math.max(0, Math.min(maxIdx, visualIndex));
  const leftIdx = Math.floor(clampedVisual);
  const rightIdx = Math.min(maxIdx, leftIdx + 1);
  const frac = clampedVisual - leftIdx;

  let rawCameraX =
    bookLayout[leftIdx].centerX * (1 - frac) +
    bookLayout[rightIdx].centerX * frac;

  if (visualIndex < 0) {
    rawCameraX += visualIndex * bookLayout[0].shelfSlotWidth;
  } else if (visualIndex > maxIdx) {
    rawCameraX += (visualIndex - maxIdx) * bookLayout[maxIdx].shelfSlotWidth;
  }

  // Safe Stage geometry bounded between left botanical ivy and right banker's lamp:
  const leftClearance = isMobile ? 32 : 72;
  const lampClearance = isMobile ? 120 : 180;
  const availableShelfWidth = Math.max(160, containerWidth - leftClearance - lampClearance);
  const totalShelfSpan = runningX;
  const fitsEntirelyOnShelf = totalShelfSpan <= availableShelfWidth;

  const readingCenterShift = (leftClearance - lampClearance) / 2;
  const cameraX = fitsEntirelyOnShelf ? totalShelfSpan / 2 : rawCameraX;

  const velocitySwayDeg = Math.max(-3.2, Math.min(3.2, currentVelocity * 0.28));
  const nearestCenterIndex = Math.round(clampedVisual);

  return (
    <div
      ref={containerRef}
      style={{ touchAction: 'pan-y' }}
      className={`relative w-full h-[365px] sm:h-[420px] md:h-[460px] flex items-end justify-center select-none overflow-hidden shelf-perspective-container pb-7 sm:pb-9 md:pb-10 ${
        isMouseDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onDragStart={(e) => e.preventDefault()}
      aria-label="Marginalia Vintage Academic Bookshelf"
    >
      {/* Warm Library Ambient Spotlight from Above (Or Directional Desk Lamp Beam in Night Mode) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: isNightMode
            ? 'radial-gradient(ellipse 820px 560px at 86% 72%, rgba(254, 240, 138, 0.24) 0%, rgba(245, 158, 11, 0.11) 36%, rgba(14, 13, 12, 0.85) 82%)'
            : 'radial-gradient(ellipse 68% 75% at 50% 25%, rgba(255, 250, 238, 0.55) 0%, rgba(225, 214, 195, 0.18) 60%, rgba(190, 175, 152, 0.25) 100%)',
        }}
      />

      {/* LEFT DECORATIVE BOTANICAL IVY ACCENT */}
      <div className="hidden lg:block absolute left-0 top-4 bottom-4 w-28 pointer-events-none z-40 opacity-90">
        <svg viewBox="0 0 110 420" className="w-full h-full overflow-visible" fill="none">
          <path
            d="M-5 15 Q 38 75, 18 155 T 28 295 Q 15 355, 32 410"
            stroke="#3B4D2B"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M12 36 C 38 24, 58 42, 42 62 C 26 64, 14 52, 12 36 Z"
            fill="#486332"
            stroke="#263818"
            strokeWidth="1"
          />
          <path
            d="M22 92 C 52 80, 68 98, 50 118 C 32 120, 20 108, 22 92 Z"
            fill="#3B5328"
            stroke="#223215"
            strokeWidth="1"
          />
          <path
            d="M15 155 C -5 148, -12 172, 6 186 C 22 184, 24 168, 15 155 Z"
            fill="#55723C"
            stroke="#2B3E1B"
            strokeWidth="1"
          />
          <path
            d="M20 218 C 46 208, 60 226, 44 244 C 28 246, 18 232, 20 218 Z"
            fill="#435D2E"
            stroke="#243516"
            strokeWidth="1"
          />
          <path
            d="M25 288 C 48 282, 58 300, 42 316 C 26 316, 20 302, 25 288 Z"
            fill="#4E6B36"
            stroke="#263818"
            strokeWidth="1"
          />
          <path
            d="M22 355 C 42 352, 50 368, 36 382 C 22 382, 18 368, 22 355 Z"
            fill="#3E572A"
            stroke="#223215"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* RIGHT VINTAGE BANKER'S DESK LAMP SITTING ON WOODEN SHELF PLANK */}
      <div className="absolute right-3 sm:right-6 md:right-8 bottom-[26px] sm:bottom-[34px] md:bottom-[38px] z-[60] pointer-events-auto">
        <VintageBankersLamp
          isLit={isNightMode}
          onToggle={onToggleNightMode || (() => {})}
        />
      </div>

      {/* LEFT CIRCULAR NAVIGATION BUTTON (<) */}
      <button
        type="button"
        data-shelf-nav-btn="true"
        onClick={(e) => {
          e.stopPropagation();
          const prevIdx = Math.max(0, Math.round(targetMotionValue.get()) - 1);
          setPulledOutBookId(items[prevIdx]?.id || null);
          animateShelfToBook(prevIdx, -2.6);
        }}
        disabled={nearestCenterIndex <= 0}
        className="absolute left-3 sm:left-5 md:left-7 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F1E8]/95 hover:bg-white text-[#1E1A16] border border-[#141414]/15 shadow-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:scale-105 active:scale-95"
        aria-label="Previous Book on Shelf"
        title="Previous Book (Left Arrow)"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
      </button>

      {/* RIGHT CIRCULAR NAVIGATION BUTTON (>) */}
      <button
        type="button"
        data-shelf-nav-btn="true"
        onClick={(e) => {
          e.stopPropagation();
          const nextIdx = Math.min(
            items.length - 1,
            Math.round(targetMotionValue.get()) + 1
          );
          setPulledOutBookId(items[nextIdx]?.id || null);
          animateShelfToBook(nextIdx, 2.6);
        }}
        disabled={nearestCenterIndex >= items.length - 1}
        className="absolute right-3 sm:right-5 md:right-7 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F1E8]/95 hover:bg-white text-[#1E1A16] border border-[#141414]/15 shadow-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:scale-105 active:scale-95"
        aria-label="Next Book on Shelf"
        title="Next Book (Right Arrow)"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
      </button>

      {/* REALISTIC HORIZONTAL WOODEN BOOKSHELF PLANK */}
      <div className="absolute bottom-0 inset-x-0 h-9 sm:h-11 pointer-events-none z-20">
        {/* Top Wooden Plank Surface */}
        <div
          className="absolute inset-x-0 -top-3.5 h-4 sm:h-5"
          style={{
            background: woodTheme.topSurface,
            borderTop: `1px solid ${woodTheme.borderTop}`,
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
          }}
        />

        {/* Front Beveled Timber Edge with Wood Grain Texture */}
        <div
          className="absolute inset-x-0 top-0.5 sm:top-1 h-6 sm:h-7 overflow-hidden"
          style={{
            background: woodTheme.frontEdge,
            borderTop: `1px solid ${woodTheme.borderTop}`,
            borderBottom: `2px solid ${woodTheme.bottomLip}`,
            boxShadow: `0 12px 28px ${woodTheme.shadowColor}, inset 0 1px 0 rgba(255,255,255,0.14)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-65"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  1.5deg,
                  transparent 0px,
                  transparent 3px,
                  ${woodTheme.grainColor} 3px,
                  ${woodTheme.grainColor} 4.5px,
                  transparent 4.5px,
                  transparent 9px
                ),
                radial-gradient(ellipse 90px 8px at 22% 45%, ${woodTheme.grainColor} 0%, transparent 70%),
                radial-gradient(ellipse 130px 10px at 68% 55%, ${woodTheme.grainColor} 0%, transparent 75%),
                radial-gradient(ellipse 70px 6px at 86% 35%, ${woodTheme.grainColor} 0%, transparent 70%)
              `,
            }}
          />
        </div>

        {/* Deep Under-Shelf Wall Shadow */}
        <div
          className="absolute inset-x-0 top-6 sm:top-8 h-6 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${woodTheme.shadowColor} 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* 3D BOOKSHELF STAGE — FRAMER MOTION SPRING-DRIVEN BOOK VOLUMES */}
      <div
        className="relative w-full h-full flex items-end justify-center preserve-3d z-30 pointer-events-none"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {items.map((item, index) => {
          const offset = index - visualIndex;
          const absOffset = Math.abs(offset);

          const maxVisible = isMobile ? 8.5 : isTablet ? 12.5 : 18.5;
          if (absOffset > maxVisible) return null;

          const {
            app,
            openFactor,
            currentWidth,
            currentHeight,
            centerX,
          } = bookLayout[index];

          const isCenterActive =
            index === nearestCenterIndex && openFactor > 0.45;
          const isHovered = hoveredIndex === index;
          const isPulledOut = isCenterActive && pulledOutBookId === item.id;

          // Reading Area Alignment: centers active volume between left ivy and right banker's lamp
          const translateX = centerX - cameraX + readingCenterShift;

          // Pull forward realistically: extra Z & slight lift when clicked (`isPulledOut`)
          const baseActiveZ = isMobile ? 44 : 68;
          const pulledExtraZ = isPulledOut ? (isMobile ? 22 : 34) : 0;
          const maxZ = baseActiveZ + pulledExtraZ;

          const spineBaseZ = -Math.min(18, absOffset * 2.2);
          const hoverBoostZ =
            isHovered && !isMobile ? (1 - openFactor) * 18 : 0;
          const translateZ =
            spineBaseZ * (1 - openFactor) + maxZ * openFactor + hoverBoostZ;

          const hoverBoostY =
            isHovered && !isMobile ? (1 - openFactor) * -9 : 0;
          const pulledExtraY = isPulledOut ? -5 : 0;
          const translateY = openFactor * 6 + pulledExtraY + hoverBoostY;

          const spineLean =
            app.microLeanDeg + velocitySwayDeg * (1 - openFactor * 0.7);
          const rotateZ = spineLean * (1 - openFactor);

          const spineYaw =
            offset < 0
              ? Math.min(6, absOffset * 0.8)
              : -Math.min(6, absOffset * 0.8);
          const rotateY =
            spineYaw * (1 - openFactor) -
            velocitySwayDeg * 0.6 * (1 - openFactor);

          const zIndex = Math.round(
            50 + openFactor * 30 + (isPulledOut ? 10 : 0) - absOffset * 3
          );

          const transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, ${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg)`;

          const itemPaperCount = item.bookPaperIds?.length || 1;

          // Screen position check to guarantee books never overlap the banker's lamp:
          const screenX = containerWidth / 2 + translateX;
          const lampBoundary = containerWidth - lampClearance;
          const isNearLamp = screenX + currentWidth / 2 > lampBoundary;
          const lampFade = isNearLamp
            ? Math.max(0, Math.min(1, (lampBoundary + 24 - (screenX - currentWidth / 2)) / 70))
            : 1;

          const handleDirectBookSelect = () => {
            const now = performance.now();
            if (now - lastBookClickTimeRef.current < 350) return;
            lastBookClickTimeRef.current = now;

            playPaperRustle();
            if (index !== safeActiveIndex) {
              onSelectIndex(index);
              setPulledOutBookId(item.id);
              animateShelfToBook(index);
            } else {
              if (pulledOutBookId === item.id) {
                (onReadPaper || onOpenDetail)(item);
              } else {
                setPulledOutBookId(item.id);
              }
            }
          };

          return (
            <motion.div
              key={item.id}
              data-shelf-book="true"
              className="absolute bottom-0 preserve-3d transition-[filter] duration-200 cursor-pointer pointer-events-auto select-none"
              style={{
                width: `${currentWidth.toFixed(1)}px`,
                height: `${currentHeight.toFixed(1)}px`,
                transform,
                zIndex,
                transformOrigin: '50% 100%',
                willChange: 'transform, width, height',
                opacity: lampFade < 0.05 ? 0 : lampFade,
                pointerEvents: lampFade < 0.25 ? 'none' : 'auto',
                filter: isNightMode
                  ? 'drop-shadow(-8px 10px 16px rgba(0,0,0,0.85)) drop-shadow(-2px 4px 6px rgba(0,0,0,0.55))'
                  : undefined,
              }}
              onPointerDown={(e) => {
                if (e.button !== 0 && e.pointerType === 'mouse') return;
                bookClickStartRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  time: performance.now(),
                };
              }}
              onPointerUp={(e) => {
                if (!bookClickStartRef.current) return;
                const dx = Math.abs(e.clientX - bookClickStartRef.current.x);
                const dy = Math.abs(e.clientY - bookClickStartRef.current.y);
                const dt = performance.now() - bookClickStartRef.current.time;
                bookClickStartRef.current = null;
                // If contact stayed within 18px and released within 650ms, it is an intentional click/tap
                if (dx < 18 && dy < 18 && dt < 650) {
                  e.stopPropagation();
                  handleDirectBookSelect();
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDirectBookSelect();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                playTactileClick();
                (onReadPaper || onOpenDetail)(item);
              }}
              onMouseEnter={() => {
                if (!isMobile) {
                  setHoveredIndex(index);
                  if (isCenterActive) {
                    handleActiveMouseEnter();
                  } else {
                    onCursorChange?.({ isInteractive: true });
                  }
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  setHoveredIndex(null);
                  if (isCenterActive) {
                    handleActiveMouseLeave();
                  } else {
                    onCursorChange?.({ isInteractive: false });
                  }
                }
              }}
              onMouseMove={
                isCenterActive && !isMobile ? handleActiveMouseMove : undefined
              }
              role="button"
              tabIndex={0}
              aria-label={`${item.title} (${item.type}, ${item.year})`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDirectBookSelect();
                }
              }}
            >
              {/* Contact Shadow on the Wooden Shelf Directly Under Book */}
              <div
                className="absolute -bottom-2.5 inset-x-0 h-5 pointer-events-none rounded-full"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(10,6,2,0.75) 0%, rgba(10,6,2,0.35) 50%, transparent 80%)',
                  transform: `scaleX(${(1.04 + openFactor * 0.12).toFixed(2)}) translateY(${(openFactor * 3).toFixed(1)}px)`,
                }}
              />

              {isCenterActive ? (
                <div className="relative w-full h-full preserve-3d group">
                  <PhysicalCover
                    item={item}
                    index={index}
                    tiltX={activeTilt.x}
                    tiltY={activeTilt.y - velocitySwayDeg * 1.2}
                    paperCount={itemPaperCount}
                    isPulledOut={isPulledOut}
                    onStartReading={(paper) => {
                      if (onReadPaper) {
                        onReadPaper(paper);
                      } else {
                        onOpenDetail(paper);
                      }
                    }}
                    onOpenDetail={onOpenDetail}
                    categoryAppearances={categoryAppearances}
                  />

                  {onCustomizeBook && (
                    <button
                      type="button"
                      data-shelf-nav-btn="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTactileClick();
                        onCustomizeBook(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute top-2.5 right-2.5 z-40 px-2 py-1 rounded-xs bg-[#1E1A16]/85 hover:bg-[#1F3FB0] text-[#F5F1E8] text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer"
                      title="Customize this book's spine, cover & dimensions"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Style</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full h-full preserve-3d">
                  <PhysicalSpine
                    item={item}
                    index={index}
                    isHovered={isHovered}
                    paperCount={itemPaperCount}
                    categoryAppearances={categoryAppearances}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
