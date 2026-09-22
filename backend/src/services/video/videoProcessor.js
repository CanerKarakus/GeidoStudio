/**
 * Video Processor Service
 * 
 * Handles video metadata probing via ffprobe and conditional adaptive compression via ffmpeg.
 * Adheres to:
 * - Safe child_process.execFile execution (no shell string concatenation)
 * - Explicit separation of original_fps vs analysis_fps
 * - Adaptive FPS decision logic based on Cosmos3 4 FPS baseline
 * - Quality-preserving H.264 CRF encoding with audio stripping
 * - Accurate measured comparison reporting (no fabricated percentages)
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

class VideoProcessor {
  constructor() {
    this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    this.ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';
    this.maxUploadMb = parseInt(process.env.MAX_VIDEO_UPLOAD_SIZE_MB, 10) || 50;
    this.maxPayloadMb = parseInt(process.env.MAX_NVIDIA_PAYLOAD_SIZE_MB, 10) || 20;
    this.maxDurationSeconds = parseInt(process.env.MAX_VIDEO_DURATION_SECONDS, 10) || 180;
  }

  /**
   * Probe video metadata using ffprobe safely
   * @param {string} filePath - Absolute path to video file
   * @returns {Promise<object>} Video stream and format metadata
   */
  async probe(filePath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-show_entries', 'stream=width,height,codec_name,r_frame_rate,avg_frame_rate,duration,pix_fmt,bit_rate:format=duration,size,bit_rate,format_name',
        '-of', 'json',
        filePath,
      ];

      execFile(this.ffprobePath, args, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Video metaverisi okunamadı (ffprobe hatası): ${stderr || error.message}`));
        }

        try {
          const data = JSON.parse(stdout);
          const videoStream = (data.streams || []).find(s => s.codec_name && s.width && s.height) || data.streams?.[0];
          
          if (!videoStream || !videoStream.width || !videoStream.height) {
            return reject(new Error('Dosya içerisinde geçerli bir video akışı tespit edilemedi.'));
          }

          // Calculate frame rate from r_frame_rate (e.g. "60/1" or "30000/1001")
          let originalFps = 24;
          const fpsParts = (videoStream.r_frame_rate || videoStream.avg_frame_rate || '').split('/');
          if (fpsParts.length === 2 && parseFloat(fpsParts[1]) > 0) {
            originalFps = Math.round((parseFloat(fpsParts[0]) / parseFloat(fpsParts[1])) * 10) / 10;
          } else if (parseFloat(fpsParts[0]) > 0) {
            originalFps = parseFloat(fpsParts[0]);
          }

          const duration = parseFloat(videoStream.duration || data.format?.duration || 0);
          const sizeBytes = parseInt(data.format?.size || fs.statSync(filePath).size, 10);
          const bitrate = parseInt(videoStream.bit_rate || data.format?.bit_rate || 0, 10);

          resolve({
            width: videoStream.width,
            height: videoStream.height,
            codec: (videoStream.codec_name || '').toLowerCase(),
            formatName: (data.format?.format_name || '').toLowerCase(),
            pixelFormat: videoStream.pix_fmt || 'yuv420p',
            duration: Math.round(duration * 100) / 100,
            originalFps,
            bitrate,
            sizeBytes,
          });
        } catch (parseErr) {
          reject(new Error(`ffprobe çıktısı ayrıştırılamadı: ${parseErr.message}`));
        }
      });
    });
  }

  /**
   * Determine if optimization is necessary and calculate adaptive parameters
   */
  evaluateCompressionNeed(probeData) {
    const isH264 = probeData.codec === 'h264';
    const isMp4 = probeData.formatName.includes('mp4') || probeData.formatName.includes('mov');
    const isUnderPayloadLimit = (probeData.sizeBytes / (1024 * 1024)) <= this.maxPayloadMb;
    const is1080pOrLess = probeData.width <= 1920 && probeData.height <= 1080;
    const isFpsWithinStandard = probeData.originalFps <= 30;
    const isBitrateReasonable = probeData.bitrate > 0 ? (probeData.bitrate <= 4000000) : isUnderPayloadLimit;

    // Determine target adaptive FPS
    // Baseline: 4 FPS (Cosmos3 recommendation)
    // If original FPS is already <= 4, preserve original FPS.
    // If rapid motion or high temporal complexity is inferred (high bitrate per second, or short clip with very high FPS),
    // we can use 8 FPS if payload limit permits.
    let targetAnalysisFps = 4;
    if (probeData.originalFps <= 4 && probeData.originalFps > 0) {
      targetAnalysisFps = probeData.originalFps;
    } else if (probeData.originalFps >= 60 && probeData.duration <= 10 && (probeData.sizeBytes / (1024 * 1024)) < (this.maxPayloadMb / 2)) {
      targetAnalysisFps = 8; // Adaptive boost for short high-temporal action clips
    }

    // Determine target scale
    // If 4K or 1440p: scale down to max 1080p while preserving aspect ratio.
    // If already 1080p, 720p or lower: preserve resolution.
    let targetScale = null;
    if (probeData.width > 1920 || probeData.height > 1080) {
      targetScale = 'min(1920,iw):-2';
    }

    // If already compliant in all aspects, bypass re-encoding!
    const needsOptimization = !(
      isH264 &&
      isMp4 &&
      isUnderPayloadLimit &&
      is1080pOrLess &&
      isFpsWithinStandard &&
      isBitrateReasonable &&
      probeData.originalFps === targetAnalysisFps
    );

    return {
      needsOptimization,
      targetAnalysisFps,
      targetScale,
    };
  }

  /**
   * Perform adaptive quality-preserving compression to produce an analysis copy
   * @param {string} rawFilePath - Path to raw uploaded video
   * @param {string} optFilePath - Path to output optimized video
   * @param {object} decision - Output of evaluateCompressionNeed
   * @returns {Promise<object>} Compression execution result
   */
  async optimizeVideo(rawFilePath, optFilePath, decision) {
    return new Promise((resolve, reject) => {
      const vfFilters = [];

      if (decision.targetScale) {
        vfFilters.push(`scale=${decision.targetScale}`);
      }

      if (decision.targetAnalysisFps) {
        vfFilters.push(`fps=${decision.targetAnalysisFps}`);
      }

      const args = [
        '-y',
        '-i', rawFilePath,
        ...(vfFilters.length > 0 ? ['-vf', vfFilters.join(',')] : []),
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '24',           // Visually faithful CRF for AI perception
        '-pix_fmt', 'yuv420p',  // Universal compatibility
        '-an',                  // Strip audio track for visual analysis copy
        '-movflags', '+faststart',
        optFilePath,
      ];

      console.log(`[VideoProcessor] Running ffmpeg: ffmpeg ${args.join(' ')}`);

      execFile(this.ffmpegPath, args, { timeout: 180000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('[VideoProcessor] FFmpeg error output:', stderr);
          return reject(new Error(`Video optimizasyon işlemi başarısız oldu (FFmpeg): ${error.message}`));
        }

        if (!fs.existsSync(optFilePath) || fs.statSync(optFilePath).size === 0) {
          return reject(new Error('Optimize edilmiş video dosyası üretilemedi.'));
        }

        resolve({ success: true, optFilePath });
      });
    });
  }

  /**
   * Main pipeline: Probes, decides, and prepares the final analysis video
   * @param {string} rawFilePath - Original uploaded video
   * @param {string} optFilePath - Path to store optimized video if needed
   * @returns {Promise<object>} Complete comparison metadata and analysis file path
   */
  async prepareForAnalysis(rawFilePath, optFilePath) {
    const originalMeta = await this.probe(rawFilePath);

    // Duration limit check
    if (originalMeta.duration > this.maxDurationSeconds) {
      throw new Error(`Video süresi (${originalMeta.duration}s) belirlenen maksimum sınırı (${this.maxDurationSeconds}s) aşıyor.`);
    }

    const decision = this.evaluateCompressionNeed(originalMeta);

    let finalAnalysisPath = rawFilePath;
    let analysisMeta = { ...originalMeta, analysisFps: originalMeta.originalFps };
    let wasOptimized = false;

    if (decision.needsOptimization) {
      await this.optimizeVideo(rawFilePath, optFilePath, decision);
      const probedOpt = await this.probe(optFilePath);
      finalAnalysisPath = optFilePath;
      wasOptimized = true;
      analysisMeta = {
        ...probedOpt,
        analysisFps: decision.targetAnalysisFps,
      };
    } else {
      console.log('[VideoProcessor] Video matches optimal analysis criteria. Bypassing re-encoding.');
    }

    // Format sizes and calculate real mathematical difference
    const originalMb = Math.round((originalMeta.sizeBytes / (1024 * 1024)) * 100) / 100;
    const analysisMb = Math.round((analysisMeta.sizeBytes / (1024 * 1024)) * 100) / 100;
    const reductionPercent = wasOptimized && originalMeta.sizeBytes > 0
      ? Math.round(((originalMeta.sizeBytes - analysisMeta.sizeBytes) / originalMeta.sizeBytes) * 1000) / 10
      : 0;

    const formatBitrate = (bps) => bps > 0 ? `${(bps / 1000000).toFixed(1)} Mbps` : 'N/A';

    const comparison = {
      was_optimized: wasOptimized,
      reduction_percent: reductionPercent,
      original: {
        resolution: `${originalMeta.width}x${originalMeta.height}`,
        fps: originalMeta.originalFps,
        codec: originalMeta.codec,
        bitrate_formatted: formatBitrate(originalMeta.bitrate),
        size_formatted: `${originalMb.toFixed(2)} MB`,
        size_bytes: originalMeta.sizeBytes,
        duration_seconds: originalMeta.duration,
      },
      analysis: {
        resolution: `${analysisMeta.width}x${analysisMeta.height}`,
        fps: analysisMeta.analysisFps || decision.targetAnalysisFps,
        codec: analysisMeta.codec,
        bitrate_formatted: formatBitrate(analysisMeta.bitrate),
        size_formatted: `${analysisMb.toFixed(2)} MB`,
        size_bytes: analysisMeta.sizeBytes,
        duration_seconds: analysisMeta.duration,
      },
    };

    return {
      finalAnalysisPath,
      wasOptimized,
      comparison,
      originalMeta,
      analysisMeta,
    };
  }

  /**
   * Safely deletes an array of files, ignoring missing files
   * @param {string[]} paths 
   */
  cleanup(paths) {
    if (!Array.isArray(paths)) return;
    for (const p of paths) {
      if (p && typeof p === 'string') {
        try {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
            console.log(`[VideoProcessor] Cleaned up temporary file: ${path.basename(p)}`);
          }
        } catch (err) {
          console.warn(`[VideoProcessor] Could not delete temp file ${p}: ${err.message}`);
        }
      }
    }
  }
}

module.exports = new VideoProcessor();
