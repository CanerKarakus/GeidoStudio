import React, { useState, useRef } from 'react';
import styles from './ImageUploader.module.scss';
import { api } from '../../api/db';
import { Upload, Link as LinkIcon, Loader2, Trash2 } from 'lucide-react';

const ImageUploader = ({ value, onChange, label = 'Görsel URL', placeholder = 'https://...' }) => {
  const [mode, setMode] = useState('link'); // 'link' or 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen sadece görsel dosyası seçin.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      const url = await api.uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.imageUploader}>
      <div className={styles.header}>
        <label>{label}</label>
        <div className={styles.modeToggle}>
          <button 
            type="button" 
            className={mode === 'link' ? styles.active : ''} 
            onClick={() => setMode('link')}
          >
            <LinkIcon size={14} /> Link
          </button>
          <button 
            type="button" 
            className={mode === 'upload' ? styles.active : ''} 
            onClick={() => setMode('upload')}
          >
            <Upload size={14} /> Cihazdan
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.inputArea} style={{ flex: 1 }}>
          {mode === 'link' ? (
            <input 
              type="text" 
              value={value || ''} 
              onChange={e => onChange(e.target.value)} 
              placeholder={placeholder}
              className={styles.textInput}
            />
          ) : (
            <div className={styles.uploadArea}>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*"
                className={styles.fileInput}
                id={`file-upload-${label.replace(/\s+/g, '-')}`}
              />
              <label htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`} className={styles.uploadBtn}>
                {isUploading ? (
                  <><Loader2 size={18} className={styles.spinner} /> Yükleniyor...</>
                ) : (
                  <><Upload size={18} /> Bilgisayardan Seç</>
                )}
              </label>
              <div className={styles.uploadHelp}>Maksimum boyut: 10MB</div>
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {value && (
          <div className={styles.previewWrapper}>
            <div className={styles.preview} style={{ backgroundImage: `url(${value})` }}></div>
            <button 
              type="button" 
              className={styles.removeBtn} 
              onClick={() => onChange('')}
              title="Görseli Kaldır"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
