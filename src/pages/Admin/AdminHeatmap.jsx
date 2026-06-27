import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/db';
import styles from './AdminHeatmap.module.scss';
import { RefreshCw, Monitor, Search, Trash2, ChevronDown } from 'lucide-react';
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
  const viewerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current) {
        const parentWidth = viewerRef.current.clientWidth;
        setScale(Math.min(parentWidth / 1440, 1)); // Max 1 ölçek, küçük ekranlarda küçült
      }
    };
    // Bekleyip resize hesapla ki layout otursun
    setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        canvas.style.opacity = '0.65'; // Normal opacity, no multiply blending
        doc.body.appendChild(canvas);
      }

      const width = doc.documentElement.scrollWidth || window.innerWidth;
      const height = doc.documentElement.scrollHeight || 3000;
      canvas.width = width;
      canvas.height = height;

      if (!heatRef.current || heatRef.current._canvas !== canvas) {
        heatRef.current = simpleheat(canvas);
      }

      // X ekseni direkt olarak kullanılıyor
      const heatData = points.map(p => {
        // Eski ofsetli verileri (negatif veya küçük değerli) düzeltmek için
        // Eğer veri -300 gibi merkez ofsetliyse onu orjinaline çevir
        const isOffset = p.x < 0 || (p.x > 0 && p.x < window.innerWidth / 2 && points.some(pt => pt.x < 0));
        const drawX = isOffset ? p.x + (width / 2) : p.x;
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
          <div className={styles.customSelectContainer}>
            <div 
              className={styles.customSelectTrigger} 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Search size={16} />
              <span>{PAGES_TO_TRACK.find(p => p.path === selectedPath)?.label} ({selectedPath})</span>
              <ChevronDown size={14} className={`${styles.chevron} ${menuOpen ? styles.open : ''}`} />
            </div>
            
            {menuOpen && (
              <>
                <div className={styles.selectBackdrop} onClick={() => setMenuOpen(false)} />
                <div className={styles.customSelectDropdown}>
                  {PAGES_TO_TRACK.map(p => (
                    <div 
                      key={p.path}
                      className={`${styles.customOption} ${p.path === selectedPath ? styles.selected : ''}`}
                      onClick={() => {
                        setSelectedPath(p.path);
                        setMenuOpen(false);
                      }}
                    >
                      {p.label} <span className={styles.pathHint}>({p.path})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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

      <div className={styles.viewer} ref={viewerRef}>
        <div className={styles.iframeWrapper} style={{ height: scale < 1 ? `${100 / scale}%` : '100%' }}>
          <div 
            style={{ 
              width: '1440px', 
              height: '100%', 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left' 
            }}
          >
            <iframe 
              ref={iframeRef}
              src={`${window.location.origin}${selectedPath}${selectedPath.includes('?') ? '&' : '?'}adminPreview=true`} 
              className={styles.iframe}
              title="Heatmap Preview"
              onLoad={handleIframeLoad}
            />
          </div>
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
