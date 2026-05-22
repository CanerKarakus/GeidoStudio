import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/db';
import styles from './AdminDatabase.module.scss';
import { Save, AlertCircle, CheckCircle, Database, FileJson, RefreshCw } from 'lucide-react';

const AdminDatabase = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch available files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // 2. Fetch file content when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile);
    } else {
      setContent('');
      setOriginalContent('');
    }
  }, [selectedFile]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.getDatabaseFiles();
      setFiles(res.files || []);
      if (res.files && res.files.length > 0 && !selectedFile) {
        setSelectedFile(res.files[0]);
      }
    } catch (err) {
      setError('Dosya listesi alınamadı: ' + (err.message || 'Hata'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileContent = async (filename) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      const res = await api.getDatabaseFile(filename);
      // Format the JSON nicely if possible
      let formattedContent = res.content;
      try {
        const parsed = JSON.parse(res.content);
        formattedContent = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // Not a valid JSON, just show as is
      }
      setContent(formattedContent);
      setOriginalContent(formattedContent);
    } catch (err) {
      setError('Dosya içeriği okunamadı: ' + (err.message || 'Hata'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    // Validate JSON before saving
    try {
      JSON.parse(content);
    } catch (e) {
      setError('Kayıt yapılamadı: Geçersiz JSON formatı. Lütfen sözdizimini (syntax) düzeltin.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      await api.updateDatabaseFile(selectedFile, content);
      setSuccess('Veritabanı dosyası başarıyla kaydedildi!');
      setOriginalContent(content); // Reset dirty state
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Kayıt sırasında hata: ' + (err.message || 'Hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError('Formatlanamadı: Geçersiz JSON.');
    }
  };

  const isDirty = content !== originalContent;

  return (
    <motion.div
      className={styles.databaseContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <Database size={24} className={styles.titleIcon} />
          <div>
            <h2>Veritabanı Düzenleyici (Raw JSON)</h2>
            <p>Sistem verilerinin tutulduğu temel dosyaları doğrudan düzenleyin. <strong>Dikkat:</strong> Hatalı değişiklikler sistemin bozulmasına yol açabilir.</p>
          </div>
        </div>
      </div>

      <div className={styles.contentLayout}>
        {/* Sidebar: File List */}
        <div className={styles.fileList}>
          <h3>Tablolar (Dosyalar)</h3>
          {isLoading && !files.length ? (
            <div className={styles.loading}>Yükleniyor...</div>
          ) : (
            <ul className={styles.files}>
              {files.map(file => (
                <li
                  key={file}
                  className={selectedFile === file ? styles.activeFile : ''}
                  onClick={() => setSelectedFile(file)}
                >
                  <FileJson size={16} />
                  {file}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main: Editor */}
        <div className={styles.editorArea}>
          <div className={styles.editorToolbar}>
            <div className={styles.editorInfo}>
              {selectedFile ? `Düzenleniyor: ${selectedFile}` : 'Bir dosya seçin'}
              {isDirty && <span className={styles.dirtyBadge}>Değiştirildi</span>}
            </div>
            
            <div className={styles.editorActions}>
              <button 
                className={styles.formatBtn} 
                onClick={handleFormat}
                disabled={!selectedFile || isLoading}
                title="JSON formatını düzenle (Prettier)"
              >
                <RefreshCw size={16} />
                Format
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!selectedFile || !isDirty || isSaving || isLoading}
              >
                <Save size={16} />
                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.alertError}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className={styles.alertSuccess}>
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          <div className={styles.textareaWrapper}>
            {isLoading && selectedFile && <div className={styles.textareaOverlay}>İçerik yükleniyor...</div>}
            <textarea
              className={styles.jsonTextarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="JSON verisi..."
              disabled={isLoading || !selectedFile}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDatabase;
