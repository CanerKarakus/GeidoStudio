import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/db';
import styles from './AdminHeatmap.module.scss';
import { RefreshCw, Monitor, Search } from 'lucide-react';
import simpleheat from '../../utils/simpleheat';

const PAGES_TO_TRACK = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/hakkinda', label: 'Hakkımızda' },
  { path: '/projeler', label: 'Projeler' },
  { path: '/iletisim', label: 'İletişim' },
];

const AdminHeatmap = () => {
  const [selectedPath, setSelectedPath] = useState('/');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const heatRef = useRef(null);
  const iframeRef = useRef(null);

  const fetchHeatmap = async (path) => {
    setLoading(true);
    try {
      const data = await api.getHeatmap(path);
      setPoints(data.points || []);
    } catch (err) {
      console.error('Failed to load heatmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap(selectedPath);
  }, [selectedPath]);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    // Resize canvas to match iframe content if possible, or just window size
    // In a real scenario, we might want to sync iframe height with canvas height.
    const canvas = canvasRef.current;
    
    // We assume a fixed height for now, or match iframe
    const height = 3000; // Large enough for typical pages
    canvas.width = iframeRef.current?.offsetWidth || window.innerWidth;
    canvas.height = height;

    if (!heatRef.current) {
      heatRef.current = simpleheat(canvas);
    }

    // simpleheat expects [x, y, value]
    const heatData = points.map(p => [p.x, p.y, p.value]);
    
    // Find the highest density point to set max value dynamically (minimum 2)
    const maxDensity = Math.max(...points.map(p => p.value), 2);
    
    heatRef.current.data(heatData);
    heatRef.current.max(maxDensity); // max density
    heatRef.current.radius(30, 20); // slightly larger radius for better visibility
    heatRef.current.draw();

  }, [points, loading]);

  const handleRefresh = () => {
    fetchHeatmap(selectedPath);
  };

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        // Tıklamaları yakalayıp iptal et (Sayfa yönlendirmelerini engelle, ama scroll çalışsın)
        doc.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, true);
      }
    } catch (err) {
      console.error('Cannot access iframe document', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.controls}>
          <div className={styles.selectGroup}>
            <Search size={16} />
            <select 
              value={selectedPath} 
              onChange={(e) => setSelectedPath(e.target.value)}
              className={styles.select}
            >
              {PAGES_TO_TRACK.map(p => (
                <option key={p.path} value={p.path}>{p.label} ({p.path})</option>
              ))}
            </select>
          </div>
          
          <button onClick={handleRefresh} className={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            Yenile
          </button>
        </div>
        <div className={styles.info}>
          <Monitor size={16} />
          <span>Masaüstü görünümü baz alınmıştır. Sayfa içindeki fare ve tıklama yoğunluğunu gösterir.</span>
        </div>
      </header>

      <div className={styles.viewer}>
        <iframe 
          ref={iframeRef}
          src={`${window.location.origin}${selectedPath}${selectedPath.includes('?') ? '&' : '?'}adminPreview=true`} 
          className={styles.iframe}
          title="Heatmap Preview"
          onLoad={handleIframeLoad}
        />
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeatmap;
