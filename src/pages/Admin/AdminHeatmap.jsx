import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/db';
import styles from './AdminHeatmap.module.scss';
import { RefreshCw, Monitor, Search, Trash2 } from 'lucide-react';
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

  const drawHeatmap = () => {
    if (points.length === 0) return;
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (!doc || !doc.body) return;

      let canvas = doc.getElementById('heatmap-canvas');
      if (!canvas) {
        canvas = doc.createElement('canvas');
        canvas.id = 'heatmap-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        canvas.style.opacity = '0.85';
        canvas.style.mixBlendMode = 'multiply';
        doc.body.appendChild(canvas);
      }

      const width = doc.documentElement.scrollWidth || window.innerWidth;
      const height = doc.documentElement.scrollHeight || 3000;
      canvas.width = width;
      canvas.height = height;

      if (!heatRef.current || heatRef.current._canvas !== canvas) {
        heatRef.current = simpleheat(canvas);
      }

      // x koordinatı ekranın ortasına göre (- / +) kaydedildiği için
      // canvas genişliğinin yarısını ekleyerek asıl pozisyonunu buluyoruz.
      const heatData = points.map(p => {
        // Eski verileri (x > 1000 gibi pozitif büyük sayılar) filtrele veya düzelt 
        // Ama basitçe her zaman iframe genişliğinin ortasını referans alıyoruz
        const drawX = p.x > window.innerWidth / 2 ? p.x : p.x + (width / 2);
        return [drawX, p.y, p.value];
      });

      const maxDensity = Math.max(...points.map(p => p.value), 2);
      
      heatRef.current.data(heatData);
      heatRef.current.max(maxDensity);
      heatRef.current.radius(30, 20);
      heatRef.current.draw();
    } catch (err) {
      console.error('Failed to draw heatmap in iframe', err);
    }
  };

  useEffect(() => {
    drawHeatmap();
  }, [points, loading]);

  const handleRefresh = () => {
    fetchHeatmap(selectedPath);
  };

  const handleClear = async () => {
    if (window.confirm('Tüm sayfaların ısı haritası verilerini kalıcı olarak silmek istediğinize emin misiniz?')) {
      try {
        setLoading(true);
        await api.clearHeatmap();
        setPoints([]);
        if (heatRef.current) {
          heatRef.current.clear().draw();
        }
        alert('Tüm ısı haritası verileri başarıyla silindi!');
      } catch (err) {
        console.error('Failed to clear heatmap:', err);
        alert('Veriler silinirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        // Tıklamaları yakalayıp iptal et
        doc.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, true);
      }
      drawHeatmap();
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
          
          <div className={styles.actions}>
            <button onClick={handleRefresh} className={styles.refreshBtn} disabled={loading}>
              <RefreshCw size={16} className={loading ? styles.spinning : ''} />
              Yenile
            </button>
            <button onClick={handleClear} className={styles.clearBtn} disabled={loading}>
              <Trash2 size={16} />
              Temizle
            </button>
          </div>
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
