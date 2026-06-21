import React from 'react';
import '@google/model-viewer';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ARViewer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 999999, // Above EasterEggTerminal (99999)
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000000,
          }}
        >
          <X size={24} />
        </button>

        <div style={{ width: '100%', height: '80%', position: 'relative' }}>
          {/* 
            model-viewer handles both 3D rendering in the browser 
            AND native AR triggers (Scene Viewer for Android, Quick Look for iOS).
            ar-modes="webxr scene-viewer quick-look" enables all native triggers.
          */}
          <model-viewer
            src="/3dmodels/zeus.glb"
            ios-src="/3dmodels/zeus.usdz"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1"
            style={{ width: '100%', height: '100%', outline: 'none' }}
          >
            <button slot="ar-button" style={{
              backgroundColor: '#ef4444',
              borderRadius: '30px',
              border: 'none',
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              padding: '12px 24px',
              fontFamily: 'system-ui',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)'
            }}>
              AR ile Odamda Gör 👁️
            </button>
          </model-viewer>
        </div>
        
        <p style={{ color: '#a0a0a0', marginTop: '20px', fontFamily: 'system-ui', textAlign: 'center', padding: '0 20px' }}>
          Modeli döndürmek için kaydırın. Gerçek dünyada görmek için "AR ile Odamda Gör" butonuna tıklayın.
        </p>
      </m.div>
    </AnimatePresence>
  );
};

export default ARViewer;
