import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Refs for Direct DOM Manipulation (High Performance)
  const contentRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  
  // Logic Refs
  const pullStartY = useRef(0);
  const isDragging = useRef(false);
  const currentPull = useRef(0);

  useEffect(() => {
    // Helper to update styles without React Render Cycle
    const updateDOM = (y: number, rotate: number, opacity: number) => {
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${y}px)`;
        contentRef.current.style.transition = y === 0 ? 'transform 0.3s ease-out' : 'none';
      }
      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `translateY(${y - 60}px)`;
        spinnerRef.current.style.opacity = opacity.toString();
      }
      if (iconRef.current) {
        iconRef.current.style.transform = `rotate(${rotate}deg)`;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = window.scrollY;
      if (scrollTop <= 5 && !refreshing) {
        pullStartY.current = e.touches[0].screenY;
        isDragging.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      
      const touchY = e.touches[0].screenY;
      const pullLength = touchY - pullStartY.current;

      if (pullLength > 0) {
        // Resistance effect: pull harder to move less
        const dampening = 0.4; 
        const moveY = Math.min(pullLength * dampening, 100); 
        currentPull.current = moveY;

        // Direct DOM update (No State Change = No Re-render = No Crash)
        requestAnimationFrame(() => {
            updateDOM(moveY, moveY * 2, moveY > 10 ? 1 : 0);
        });
        
        // Prevent default only if pulling down significantly to avoid browser native refresh
        if (pullLength > 20 && e.cancelable) {
            e.preventDefault(); 
        }
      } else {
        currentPull.current = 0;
        requestAnimationFrame(() => updateDOM(0, 0, 0));
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (currentPull.current > 60) { // Threshold met
        setRefreshing(true);
        // Snap to loading position
        requestAnimationFrame(() => updateDOM(60, 0, 1));
        
        // Trigger Reload logic
        setTimeout(() => {
           window.location.reload(); 
        }, 800);
      } else {
        // Reset
        currentPull.current = 0;
        requestAnimationFrame(() => updateDOM(0, 0, 0));
      }
    };

    // Use passive: false to allow preventDefault
    const passiveOpts = { passive: false }; 
    const activeOpts = { passive: true };

    window.addEventListener('touchstart', handleTouchStart, activeOpts);
    window.addEventListener('touchmove', handleTouchMove, passiveOpts);
    window.addEventListener('touchend', handleTouchEnd, activeOpts);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing]);

  return (
    <div className="relative min-h-screen">
      {/* Spinner Element - Controlled via Ref */}
      <div 
        ref={spinnerRef}
        className="fixed top-0 left-0 w-full flex justify-center items-center pointer-events-none z-[9999] opacity-0"
        style={{ transform: 'translateY(-60px)' }}
      >
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 ${refreshing ? 'animate-spin' : ''}`}>
           <RefreshCw ref={iconRef} size={24} className="text-primary-600" />
        </div>
      </div>

      {/* Content Wrapper - Controlled via Ref */}
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;