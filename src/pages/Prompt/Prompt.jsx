// src/pages/Prompt/Prompt.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Upload, Film, Play, RotateCcw, Check, Copy, Download,
  Camera, Eye, Layers, Sun, Palette, Activity, Sparkles,
  Scissors, ShieldAlert, ChevronDown, Clock, Cpu, FileText,
  AlertTriangle, CheckCircle2, Video
} from 'lucide-react';
import SEO from '../../components/SEO/SEO';
import { api } from '../../api/db';
import styles from './Prompt.module.scss';

const Prompt = () => {
  const { t } = useTranslation();

  // File & Preview state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [videoMeta, setVideoMeta] = useState({ duration: 0, width: 0, height: 0, sizeMb: 0 });
  const [dragActive, setDragActive] = useState(false);

  // Status & Progress
  // State: 'IDLE' | 'READY' | 'UPLOADING' | 'VALIDATING' | 'OPTIMIZING_VIDEO' | 'ANALYZING_VIDEO' | 'PROCESSING_RESULT' | 'COMPLETED' | 'ERROR'
  const [analysisState, setAnalysisState] = useState('IDLE');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [comparisonMetadata, setComparisonMetadata] = useState(null);

  // UI Accordion & Modal States
  const [openSections, setOpenSections] = useState({
    timeline: true,
    camera: true,
    optics: false,
    focus: false,
    subjects: true,
    objects: false,
    environment: false,
    composition: false,
    lighting: false,
    color: false,
    motion: false,
    effects: false,
    editing: false,
    visual_style: false,
    continuity: false,
    uncertainties: true,
  });
  const [copiedKey, setCopiedKey] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [previewUrl]);

  // Polling effect
  useEffect(() => {
    if (!activeJobId || analysisState === 'COMPLETED' || analysisState === 'ERROR') {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await api.getAnalysisStatus(activeJobId);
        if (res.status === 'error') {
          clearInterval(pollTimerRef.current);
          setAnalysisState('ERROR');
          setErrorMessage(res.error?.message || 'Analiz sırasında hata oluştu.');
        } else if (res.status === 'completed') {
          clearInterval(pollTimerRef.current);
          setAnalysisResult(res.analysis);
          setComparisonMetadata(res.comparison_metadata);
          setAnalysisState('COMPLETED');
        } else if (res.status) {
          // 'optimizing_video' | 'analyzing_video' | 'processing_result'
          const stateUpper = res.status.toUpperCase();
          setAnalysisState(stateUpper);
        }
      } catch (err) {
        console.warn('[Polling Error]', err.message);
      }
    }, 2000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeJobId, analysisState]);

  // Handle file selection
  const handleFile = (file) => {
    if (!file) return;

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const validExts = ['.mp4', '.mov', '.webm'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      setErrorMessage('Yalnızca MP4, MOV veya WebM video formatları desteklenmektedir.');
      setAnalysisState('ERROR');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setErrorMessage('');
    setAnalysisState('READY');
    setAnalysisResult(null);
    setComparisonMetadata(null);

    // Read metadata
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setVideoMeta({
        duration: Math.round(tempVideo.duration * 100) / 100,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        sizeMb: Math.round((file.size / (1024 * 1024)) * 100) / 100,
      });
    };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    setVideoMeta({ duration: 0, width: 0, height: 0, sizeMb: 0 });
    setAnalysisState('IDLE');
    setErrorMessage('');
    setActiveJobId(null);
    setAnalysisResult(null);
    setComparisonMetadata(null);
  };

  // Helper to extract a high-quality keyframe (from active player or offscreen video)
  const extractKeyframe = async (vElem, file) => {
    try {
      if (vElem && vElem.videoWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(vElem.videoWidth, 1280);
        canvas.height = Math.min(vElem.videoHeight, 720);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(vElem, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (dataUrl && dataUrl.length > 1000) return dataUrl;
      }
    } catch (e) {
      console.warn('Direct keyframe extraction error:', e.message);
    }

    return new Promise((resolve) => {
      try {
        const offscreenVideo = document.createElement('video');
        offscreenVideo.preload = 'auto';
        offscreenVideo.muted = true;
        offscreenVideo.playsInline = true;
        const blobUrl = URL.createObjectURL(file);
        offscreenVideo.src = blobUrl;

        let finished = false;
        const finish = (res) => {
          if (!finished) {
            finished = true;
            URL.revokeObjectURL(blobUrl);
            resolve(res);
          }
        };

        offscreenVideo.onloadeddata = () => {
          // Capture a frame exactly in the middle of the video (50%)
          // This avoids capturing intro titles or black frames at the beginning.
          const seekSec = (offscreenVideo.duration || 5) * 0.5;
          offscreenVideo.currentTime = seekSec;
        };

        offscreenVideo.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(offscreenVideo.videoWidth || 1280, 1280);
            canvas.height = Math.min(offscreenVideo.videoHeight || 720, 720);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(offscreenVideo, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            finish(dataUrl);
          } catch (err) {
            finish(null);
          }
        };

        offscreenVideo.onerror = () => finish(null);
        setTimeout(() => finish(null), 3500);
      } catch (err) {
        resolve(null);
      }
    });
  };

  // Start analysis upload
  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setErrorMessage('');
    setAnalysisState('UPLOADING');
    setUploadPercent(0);

    const keyframeDataUrl = await extractKeyframe(videoRef.current, selectedFile);

    try {
      const response = await api.analyzeVideo(selectedFile, (percent) => {
        setUploadPercent(percent);
        if (percent >= 100) {
          setAnalysisState('VALIDATING');
        }
      }, keyframeDataUrl);

      if (response.success && response.jobId) {
        setActiveJobId(response.jobId);
        setAnalysisState('OPTIMIZING_VIDEO');
      } else {
        throw new Error(response.error || 'İşlem başlatılamadı.');
      }
    } catch (err) {
      setAnalysisState('ERROR');
      setErrorMessage(err.message || 'Video yükleme sırasında bir hata oluştu.');
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Copy helper
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Copy formats
  const getTimelineText = () => {
    if (!analysisResult?.timeline) return '';
    return analysisResult.timeline.map((item, idx) => {
      return `[${item.start_timestamp} — ${item.end_timestamp}] ${item.event}\n` +
             `Sahne: ${item.scene_description}\n` +
             `Kamera: ${item.camera_behavior}\n` +
             `Özne: ${item.subject_actions}\n` +
             `Işık: ${item.lighting_state}\n` +
             `Kompozisyon: ${item.composition}\n`;
    }).join('\n--------------------\n');
  };

  const getTechnicalBreakdownText = () => {
    if (!analysisResult) return '';
    const c = analysisResult.camera || {};
    const o = analysisResult.optics || {};
    const l = analysisResult.lighting || {};
    const comp = analysisResult.composition || {};
    const m = analysisResult.motion || {};

    return `=== KAMERA & HAREKET ===\n` +
           `Plan Türleri: ${(c.shot_types || []).join(', ')}\n` +
           `Açılar: ${(c.angles || []).join(', ')}\n` +
           `Konum / Yükseklik: ${c.position_and_height || ''}\n` +
           `Stabilizasyon: ${c.stabilization || ''}\n\n` +
           `=== OPTİK & ODAK ===\n` +
           `Perspektif: ${o.perspective || ''}\n` +
           `Derinlik: ${o.depth_of_field || ''}\n` +
           `Bokeh: ${o.bokeh_characteristics || ''}\n\n` +
           `=== IŞIK & RENK ===\n` +
           `Ana Işık: ${l.key_light || ''}\n` +
           `Dolgu Işığı: ${l.fill_light || ''}\n` +
           `Kontrast: ${l.contrast_ratio || ''}\n` +
           `Renk Sıcaklığı: ${l.color_temperature || ''}\n\n` +
           `=== KOMPOZİSYON & HAREKET ===\n` +
           `Kadraj: ${comp.framing_approach || ''}\n` +
           `Görsel Denge: ${comp.visual_balance || ''}\n` +
           `Özne Hareketi: ${m.subject_motion || ''}\n` +
           `Kamera Hareketi: ${m.camera_motion || ''}\n`;
  };

  const getAllAnalysisText = () => {
    if (!analysisResult) return '';
    return `AI VIDEO TEKNİK ANALİZ RAPORU\n` +
           `============================\n` +
           `Süre: ${analysisResult.video_metadata?.duration_seconds}s | Çözünürlük: ${analysisResult.video_metadata?.resolution} | Oran: ${analysisResult.video_metadata?.aspect_ratio}\n` +
           `Kaynak FPS: ${analysisResult.video_metadata?.original_fps} | Analiz FPS: ${analysisResult.video_metadata?.analysis_fps}\n\n` +
           `GENEL BAKIŞ:\n${analysisResult.overview?.visual_summary}\n\n` +
           `ZAMAN ÇİZELGESİ:\n${getTimelineText()}\n\n` +
           `TEKNİK AYRINTILAR:\n${getTechnicalBreakdownText()}\n\n` +
           `BELİRSİZLİKLER:\n${(analysisResult.uncertainties || []).map(u => `- ${u}`).join('\n')}\n`;
  };

  const downloadJson = () => {
    if (!analysisResult) return;
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStateText = () => {
    switch (analysisState) {
      case 'UPLOADING':
        return { label: 'Video Yükleniyor...', desc: `Dosya sunucuya aktarılıyor (%${uploadPercent})` };
      case 'VALIDATING':
        return { label: 'Doğrulanıyor...', desc: 'Video başlıkları, codec ve güvenlik kontrolleri yapılıyor.' };
      case 'OPTIMIZING_VIDEO':
        return { label: 'Akıllı Optimizasyon Yapılıyor...', desc: 'Görsel kalite azami oranda korunarak analiz için 4 FPS adaptif kopya hazırlanıyor.' };
      case 'ANALYZING_VIDEO':
        return { label: 'NVIDIA Cosmos3 İnceliyor...', desc: 'Yapay zeka modeli videoyu baştan sona kare kare teknik analize tabi tutuyor.' };
      case 'PROCESSING_RESULT':
        return { label: 'Sonuçlar İşleniyor...', desc: 'Teknik analiz şeması doğrulanıyor ve zaman çizelgesi yapılandırılıyor.' };
      default:
        return { label: 'İşleniyor...', desc: 'Lütfen bekleyin.' };
    }
  };

  return (
    <div className={styles.promptPage}>
      <SEO
        title="AI Video Teknik Analiz — Geido Studio"
        description="Referans videonuzun kamera hareketi, optik, kadraj, ışık ve kompozisyonunu NVIDIA Cosmos multimodal yapay zeka ile teknik olarak çözümleyin."
      />
      <div className={styles.container}>
        {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          AI Video Technical Analyzer
        </div>
        <h1 className={styles.title}>
          <span>Referans Videonuzu</span> Teknik Olarak Çözümleyin
        </h1>
        <p className={styles.subtitle}>
          Kameranın nasıl hareket ettiğini, kadrajı, ışığı, optik özellikleri, özneleri ve kompozisyonu
          NVIDIA Cosmos multimodal modeliyle baştan sona objektif ve yapılandırılmış biçimde ortaya çıkarın.
        </p>
      </header>

      {/* Upload & Staging Area */}
      <div className={styles.stageCard}>
        {analysisState === 'IDLE' && (
          <div
            className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/quicktime,video/webm"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className={styles.iconWrap}>
              <Upload size={28} />
            </div>
            <h3 className={styles.dropTitle}>Referans videonuzu buraya sürükleyin</h3>
            <p className={styles.dropHint}>veya bilgisayarınızdan seçin (MP4, MOV, WebM — Maks 50 MB)</p>
          </div>
        )}

        {analysisState !== 'IDLE' && previewUrl && (
          <div className={styles.previewGrid}>
            <div className={styles.videoPlayerWrap}>
              <video ref={videoRef} src={previewUrl} controls playsInline crossOrigin="anonymous" />
            </div>

            <div className={styles.previewMeta}>
              <div className={styles.fileDetails}>
                <h4 className={styles.fileName}>{selectedFile?.name}</h4>

                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Süre</div>
                    <div className={styles.metaValue}>{videoMeta.duration}s</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Çözünürlük</div>
                    <div className={styles.metaValue}>{videoMeta.width > 0 ? `${videoMeta.width}x${videoMeta.height}` : '—'}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Dosya Boyutu</div>
                    <div className={styles.metaValue}>{videoMeta.sizeMb} MB</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Hedef Model</div>
                    <div className={styles.metaValue}>Cosmos3-Nano</div>
                  </div>
                </div>

                <div className={styles.fixedModeTag}>
                  <span>Analiz Modu:</span>
                  <strong>Detailed Technical Analysis</strong>
                </div>
              </div>

              {analysisState === 'READY' && (
                <div className={styles.btnActions}>
                  <button className={styles.resetBtn} onClick={handleReset}>
                    Farklı Video Seç
                  </button>
                  <button className={styles.analyzeBtn} onClick={handleStartAnalysis}>
                    <Play size={18} />
                    Videoyu Analiz Et
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* In-Progress State Box */}
        {['UPLOADING', 'VALIDATING', 'OPTIMIZING_VIDEO', 'ANALYZING_VIDEO', 'PROCESSING_RESULT'].includes(analysisState) && (
          <div className={styles.progressBox}>
            <div className={styles.spinnerWrap}>
              <Activity size={26} />
            </div>
            <h4 className={styles.stateLabel}>{renderStateText().label}</h4>
            <p className={styles.stateDesc}>{renderStateText().desc}</p>
            {analysisState === 'UPLOADING' && (
              <div className={styles.progressBarOuter}>
                <div className={styles.progressBarInner} style={{ width: `${uploadPercent}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {analysisState === 'ERROR' && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={20} />
            <div className={styles.errorText}>{errorMessage || 'Analiz başarısız oldu.'}</div>
            <button className={styles.retryBtn} onClick={handleReset}>
              Tekrar Dene
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysisState === 'COMPLETED' && analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Side-by-Side Comparison Card (Real Measured Stats) */}
          {comparisonMetadata && (
            <div className={styles.comparisonSection}>
              <div className={styles.compHeader}>
                <div className={styles.compTitle}>
                  <Cpu size={18} />
                  Video Optimizasyon Metrikleri (Gerçek Ölçümler)
                </div>
                {comparisonMetadata.was_optimized && comparisonMetadata.reduction_percent > 0 && (
                  <span className={styles.savingPill}>
                    %{comparisonMetadata.reduction_percent} Boyut Azalımı
                  </span>
                )}
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Parametre</th>
                      <th>Orijinal Kaynak Video</th>
                      <th>NVIDIA Analiz Kopyası</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Çözünürlük</td>
                      <td>{comparisonMetadata.original?.resolution}</td>
                      <td className={styles.highlight}>{comparisonMetadata.analysis?.resolution}</td>
                    </tr>
                    <tr>
                      <td>Kare Hızı (FPS)</td>
                      <td>{comparisonMetadata.original?.fps} FPS (original_fps)</td>
                      <td className={styles.highlight}>{comparisonMetadata.analysis?.fps} FPS (analysis_fps)</td>
                    </tr>
                    <tr>
                      <td>Dosya Boyutu</td>
                      <td>{comparisonMetadata.original?.size_formatted}</td>
                      <td className={styles.highlight}>{comparisonMetadata.analysis?.size_formatted}</td>
                    </tr>
                    <tr>
                      <td>Bitrate</td>
                      <td>{comparisonMetadata.original?.bitrate_formatted}</td>
                      <td>{comparisonMetadata.analysis?.bitrate_formatted}</td>
                    </tr>
                    <tr>
                      <td>Codec / Format</td>
                      <td>{comparisonMetadata.original?.codec?.toUpperCase()}</td>
                      <td>{comparisonMetadata.analysis?.codec?.toUpperCase()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Toolbar with Copy Actions */}
          <div className={styles.toolbar}>
            <h2 className={styles.toolbarTitle}>Teknik Analiz Raporu</h2>
            <div className={styles.actionBtns}>
              <button
                className={`${styles.toolBtn} ${copiedKey === 'timeline' ? styles.copied : ''}`}
                onClick={() => copyToClipboard(getTimelineText(), 'timeline')}
              >
                {copiedKey === 'timeline' ? <Check size={14} /> : <Copy size={14} />}
                Zaman Çizelgesini Kopyala
              </button>

              <button
                className={`${styles.toolBtn} ${copiedKey === 'technical' ? styles.copied : ''}`}
                onClick={() => copyToClipboard(getTechnicalBreakdownText(), 'technical')}
              >
                {copiedKey === 'technical' ? <Check size={14} /> : <Copy size={14} />}
                Teknik Analizi Kopyala
              </button>

              <button
                className={`${styles.toolBtn} ${copiedKey === 'all' ? styles.copied : ''}`}
                onClick={() => copyToClipboard(getAllAnalysisText(), 'all')}
              >
                {copiedKey === 'all' ? <Check size={14} /> : <Copy size={14} />}
                Tüm Analizi Kopyala
              </button>

              <button className={styles.toolBtn} onClick={() => setShowJsonModal(true)}>
                <FileText size={14} />
                Ham JSON
              </button>

              <button className={styles.toolBtn} onClick={handleReset}>
                <RotateCcw size={14} />
                Yeni Analiz
              </button>
            </div>
          </div>

          {/* 18 Structured Categories */}
          <div className={styles.accordionList}>
            {/* 1. Overview */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('overview')}>
                <div className={styles.headerLeft}>
                  <Film className={styles.catIcon} size={18} />
                  <span className={styles.catName}>1. Video Genel Bakış</span>
                  <span className={styles.catCount}>{analysisResult.overview?.scene_count || 1} Sahne</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.overview ? styles.open : ''}`} size={18} />
              </button>
              {openSections.overview && (
                <div className={styles.cardBody}>
                  <p>{analysisResult.overview?.visual_summary}</p>
                </div>
              )}
            </div>

            {/* 2. Timeline */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('timeline')}>
                <div className={styles.headerLeft}>
                  <Clock className={styles.catIcon} size={18} />
                  <span className={styles.catName}>2. Zaman Çizelgesi (Timeline)</span>
                  <span className={styles.catCount}>{(analysisResult.timeline || []).length} Aralık</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.timeline ? styles.open : ''}`} size={18} />
              </button>
              {openSections.timeline && (
                <div className={styles.cardBody}>
                  <div className={styles.timelineList}>
                    {(analysisResult.timeline || []).map((tItem, idx) => (
                      <div key={idx} className={styles.timelineItem}>
                        <div className={styles.timeRange}>
                          {tItem.start_timestamp} — {tItem.end_timestamp}
                        </div>
                        <div className={styles.eventTitle}>{tItem.event}</div>
                        <div className={styles.eventDesc}>{tItem.scene_description}</div>
                        <div className={styles.eventDetailsGrid}>
                          {tItem.camera_behavior && (
                            <div>
                              <span className={styles.detailLabel}>Kamera: </span>
                              <span className={styles.detailVal}>{tItem.camera_behavior}</span>
                            </div>
                          )}
                          {tItem.subject_actions && (
                            <div>
                              <span className={styles.detailLabel}>Özne: </span>
                              <span className={styles.detailVal}>{tItem.subject_actions}</span>
                            </div>
                          )}
                          {tItem.lighting_state && (
                            <div>
                              <span className={styles.detailLabel}>Işık: </span>
                              <span className={styles.detailVal}>{tItem.lighting_state}</span>
                            </div>
                          )}
                          {tItem.composition && (
                            <div>
                              <span className={styles.detailLabel}>Kompozisyon: </span>
                              <span className={styles.detailVal}>{tItem.composition}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Camera */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('camera')}>
                <div className={styles.headerLeft}>
                  <Camera className={styles.catIcon} size={18} />
                  <span className={styles.catName}>3. Kamera & Çekim Açıları</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.camera ? styles.open : ''}`} size={18} />
              </button>
              {openSections.camera && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Plan Ölçekleri</div>
                      <div className={styles.kvValue}>{(analysisResult.camera?.shot_types || []).join(', ') || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Açılar</div>
                      <div className={styles.kvValue}>{(analysisResult.camera?.angles || []).join(', ') || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Konum & Yükseklik</div>
                      <div className={styles.kvValue}>{analysisResult.camera?.position_and_height || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Stabilizasyon</div>
                      <div className={styles.kvValue}>{analysisResult.camera?.stabilization || 'Belirtilmedi'}</div>
                    </div>
                  </div>

                  {(analysisResult.camera?.movements || []).length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kamera Hareketleri:</strong>
                      <div className={styles.pillContainer}>
                        {analysisResult.camera.movements.map((m, i) => (
                          <div key={i} className={styles.pill}>
                            {m.type} ({m.direction || 'durağan'}) — {m.speed || 'orta'} [{m.start || ''} - {m.end || ''}]
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Optics & Lens */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('optics')}>
                <div className={styles.headerLeft}>
                  <Eye className={styles.catIcon} size={18} />
                  <span className={styles.catName}>4. Optik & Lens Özellikleri</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.optics ? styles.open : ''}`} size={18} />
              </button>
              {openSections.optics && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Perspektif Hissi</div>
                      <div className={styles.kvValue}>{analysisResult.optics?.perspective || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Perspektif Sıkışması</div>
                      <div className={styles.kvValue}>{analysisResult.optics?.perspective_compression || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Alan Derinliği (DOF)</div>
                      <div className={styles.kvValue}>{analysisResult.optics?.depth_of_field || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Bokeh Karakteri</div>
                      <div className={styles.kvValue}>{analysisResult.optics?.bokeh_characteristics || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Subjects */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('subjects')}>
                <div className={styles.headerLeft}>
                  <Film className={styles.catIcon} size={18} />
                  <span className={styles.catName}>5. Özneler & Karakterler</span>
                  <span className={styles.catCount}>{(analysisResult.subjects || []).length} Özne</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.subjects ? styles.open : ''}`} size={18} />
              </button>
              {openSections.subjects && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    {(analysisResult.subjects || []).map((sub, i) => (
                      <div key={i} className={styles.kvCard}>
                        <div className={styles.kvKey}>{sub.identifier || `Özne ${i + 1}`}</div>
                        <div className={styles.kvValue} style={{ marginBottom: '8px' }}>
                          {sub.apparent_presentation || 'Belirtilmedi'}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          <strong>Kıyafet:</strong> {sub.clothing || '—'}<br />
                          <strong>Poz / Yön:</strong> {sub.pose_and_orientation || '—'}<br />
                          <strong>Eylem:</strong> {sub.actions || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Lighting */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('lighting')}>
                <div className={styles.headerLeft}>
                  <Sun className={styles.catIcon} size={18} />
                  <span className={styles.catName}>6. Işık & Aydınlatma</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.lighting ? styles.open : ''}`} size={18} />
              </button>
              {openSections.lighting && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Ana Işık (Key Light)</div>
                      <div className={styles.kvValue}>{analysisResult.lighting?.key_light || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Dolgu Işığı (Fill Light)</div>
                      <div className={styles.kvValue}>{analysisResult.lighting?.fill_light || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Doğal vs Yapay</div>
                      <div className={styles.kvValue}>{analysisResult.lighting?.natural_vs_artificial || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Renk Sıcaklığı</div>
                      <div className={styles.kvValue}>{analysisResult.lighting?.color_temperature || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Color */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('color')}>
                <div className={styles.headerLeft}>
                  <Palette className={styles.catIcon} size={18} />
                  <span className={styles.catName}>7. Renk & Derecelendirme</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.color ? styles.open : ''}`} size={18} />
              </button>
              {openSections.color && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Sıcak/Soğuk Dengesi</div>
                      <div className={styles.kvValue}>{analysisResult.color?.warm_cool_balance || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Doygunluk</div>
                      <div className={styles.kvValue}>{analysisResult.color?.saturation || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Renk Tonlama Stili</div>
                      <div className={styles.kvValue}>{analysisResult.color?.grading_style || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                  {(analysisResult.color?.dominant_colors || []).length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hakim Renkler:</strong>
                      <div className={styles.pillContainer}>
                        {analysisResult.color.dominant_colors.map((c, i) => (
                          <div key={i} className={styles.pill}>{c}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 8. Composition */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('composition')}>
                <div className={styles.headerLeft}>
                  <Layers className={styles.catIcon} size={18} />
                  <span className={styles.catName}>8. Kompozisyon & Kadraj</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.composition ? styles.open : ''}`} size={18} />
              </button>
              {openSections.composition && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Kadraj Yaklaşımı</div>
                      <div className={styles.kvValue}>{analysisResult.composition?.framing_approach || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Görsel Denge</div>
                      <div className={styles.kvValue}>{analysisResult.composition?.visual_balance || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Negatif Alan</div>
                      <div className={styles.kvValue}>{analysisResult.composition?.negative_space || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Odak Noktası</div>
                      <div className={styles.kvValue}>{analysisResult.composition?.dominant_focal_point || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 9. Motion */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('motion')}>
                <div className={styles.headerLeft}>
                  <Activity className={styles.catIcon} size={18} />
                  <span className={styles.catName}>9. Hareket & Dinamikler</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.motion ? styles.open : ''}`} size={18} />
              </button>
              {openSections.motion && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Özne Hareketi</div>
                      <div className={styles.kvValue}>{analysisResult.motion?.subject_motion || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Kamera Hareketi</div>
                      <div className={styles.kvValue}>{analysisResult.motion?.camera_motion || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Ortam Hareketi</div>
                      <div className={styles.kvValue}>{analysisResult.motion?.environmental_motion || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>İkincil Hareket (Saç/Kıyafet)</div>
                      <div className={styles.kvValue}>{analysisResult.motion?.secondary_motion || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 10. Effects */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('effects')}>
                <div className={styles.headerLeft}>
                  <Sparkles className={styles.catIcon} size={18} />
                  <span className={styles.catName}>10. Görsel Efektler (VFX)</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.effects ? styles.open : ''}`} size={18} />
              </button>
              {openSections.effects && (
                <div className={styles.cardBody}>
                  <div className={styles.pillContainer}>
                    {(analysisResult.effects || []).length > 0 ? (
                      analysisResult.effects.map((eff, i) => (
                        <div key={i} className={styles.pill}>
                          {eff.type} ({eff.intensity || 'hafif'}) — {eff.notes || ''}
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#64748b' }}>Belirgin yapay görsel efekt tespit edilmedi.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 11. Editing */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('editing')}>
                <div className={styles.headerLeft}>
                  <Scissors className={styles.catIcon} size={18} />
                  <span className={styles.catName}>11. Kurgu & Geçişler</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.editing ? styles.open : ''}`} size={18} />
              </button>
              {openSections.editing && (
                <div className={styles.cardBody}>
                  <div className={styles.kvGrid}>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Kesme Sayısı</div>
                      <div className={styles.kvValue}>{analysisResult.editing?.cut_count ?? 0}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Geçişler</div>
                      <div className={styles.kvValue}>{(analysisResult.editing?.transitions || []).join(', ') || 'Belirtilmedi'}</div>
                    </div>
                    <div className={styles.kvCard}>
                      <div className={styles.kvKey}>Tempo</div>
                      <div className={styles.kvValue}>{analysisResult.editing?.pacing || 'Belirtilmedi'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 12. Uncertainties */}
            <div className={styles.categoryCard}>
              <button className={styles.cardHeader} onClick={() => toggleSection('uncertainties')}>
                <div className={styles.headerLeft}>
                  <ShieldAlert className={styles.catIcon} size={18} />
                  <span className={styles.catName}>12. Belirsizlikler (Uncertainties)</span>
                  <span className={styles.catCount}>{(analysisResult.uncertainties || []).length} Uyarı</span>
                </div>
                <ChevronDown className={`${styles.chevron} ${openSections.uncertainties ? styles.open : ''}`} size={18} />
              </button>
              {openSections.uncertainties && (
                <div className={styles.cardBody}>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>
                    Model, görüntüde kanıtla desteklenmeyen hiçbir donanım veya gizli bilgiyi uydurmaz. Aşağıdaki maddeler görsel olarak kesinliği doğrulanamayan ayrıntılardır:
                  </p>
                  <div className={styles.pillContainer}>
                    {(analysisResult.uncertainties || []).map((u, i) => (
                      <div key={i} className={`${styles.pill} ${styles.uncertainty}`}>
                        {u}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Raw JSON Modal for Developers */}
      <AnimatePresence>
        {showJsonModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowJsonModal(false)}>
            <motion.div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>Yapılandırılmış Ham JSON Analizi</h3>
                <button className={styles.closeBtn} onClick={() => setShowJsonModal(false)}>✕</button>
              </div>
              <pre className={styles.jsonPre}>
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
              <div className={styles.modalFooter}>
                <button
                  className={styles.toolBtn}
                  onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2), 'raw-json')}
                >
                  {copiedKey === 'raw-json' ? <Check size={14} /> : <Copy size={14} />}
                  JSON Kopyala
                </button>
                <button className={styles.toolBtn} onClick={downloadJson}>
                  <Download size={14} />
                  JSON İndir (.json)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Prompt;
