import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/db';

const FLUSH_INTERVAL = 10000; // 10 seconds
const THROTTLE_MS = 200; // Throttle mousemove events

const HeatmapTracker = () => {
  const location = useLocation();
  const bufferRef = useRef([]);
  const lastMoveRef = useRef(0);
  const flushTimerRef = useRef(null);

  // Send data to backend
  const flushBuffer = async () => {
    if (bufferRef.current.length === 0) return;

    // Make a copy and clear buffer
    const points = [...bufferRef.current];
    bufferRef.current = [];

    // Filter out undefined/invalid coordinates
    const validPoints = points.filter(p => p.x !== undefined && p.y !== undefined);
    
    if (validPoints.length > 0) {
      try {
        await api.recordHeatmap({
          path: location.pathname,
          points: validPoints
        });
      } catch (err) {
        console.error('[HeatmapTracker] Failed to flush data:', err);
      }
    }
  };

  useEffect(() => {
    // Sadece admin preview olmayan normal ziyaretçileri takip et
    if (location.pathname.startsWith('/admin') || window.location.search.includes('adminPreview=true')) {
      return;
    }

    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return; // Sadece masaüstü verilerini al

      const now = Date.now();
      if (now - lastMoveRef.current > THROTTLE_MS) {
        lastMoveRef.current = now;
        
        bufferRef.current.push({
          x: Math.round(e.pageX),
          y: Math.round(e.pageY),
          value: 1
        });
      }
    };

    const handleClick = (e) => {
      if (window.innerWidth < 768) return;
      
      const x = Math.round(e.pageX);
      const y = Math.round(e.pageY);
      
      bufferRef.current.push({ x, y, value: 4 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    flushTimerRef.current = setInterval(flushBuffer, FLUSH_INTERVAL);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearInterval(flushTimerRef.current);
      // Flush son kalanları
      flushBuffer();
    };
  }, [location.pathname]);

  return null; // Görünmez bir bileşen
};

export default HeatmapTracker;
