/**
 * Video Analysis Routes
 * 
 * POST /api/analyze         - Upload video and initiate asynchronous analysis job
 * GET  /api/analyze/:jobId  - Poll job status, comparison metadata, and final technical analysis
 * GET  /api/analyze/limits  - Retrieve current upload and duration limits
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const videoProcessor = require('../services/video/videoProcessor');
const nvidiaClient = require('../services/nvidia/nvidiaClient');

const router = express.Router();

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Upload configuration
const maxUploadMb = parseInt(process.env.MAX_VIDEO_UPLOAD_SIZE_MB, 10) || 50;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const jobId = uuidv4();
    req.generatedJobId = jobId;
    cb(null, `raw_${jobId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.mp4', '.mov', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isVideoExt = allowedExts.includes(ext);
  const isVideoMime = mime.startsWith('video/') || mime === 'application/octet-stream';

  if (isVideoExt && isVideoMime) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya formatı. Yalnızca MP4, MOV veya WebM video dosyaları kabul edilmektedir.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
  fileFilter,
});

// In-Memory Job State Store
// Note: In case of Node.js restart, active jobs are reset.
const jobs = new Map();

// Periodic cleanup of jobs older than 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [id, job] of jobs.entries()) {
    if (job.createdAt < oneHourAgo) {
      jobs.delete(id);
    }
  }
}, 15 * 60 * 1000);

function calculateAspectRatio(width, height) {
  if (!width || !height) return '16:9';
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;
  if ((w === 16 && h === 9) || (w === 9 && h === 16) || (w === 4 && h === 3) || (w === 1 && h === 1)) {
    return `${w}:${h}`;
  }
  const ratio = (width / height).toFixed(2);
  return `${ratio}:1`;
}

/**
 * POST /api/analyze
 * Initiates video analysis job
 */
router.post('/', (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: `Yüklenen video dosya boyutu sınırı (${maxUploadMb} MB) aşıyor.`,
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Video yüklenirken hata oluştu.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen analiz edilecek bir video dosyası seçin.',
      });
    }

    const jobId = req.generatedJobId || uuidv4();
    const rawPath = req.file.path;
    const optPath = path.join(tempDir, `opt_${jobId}.mp4`);

    // Create initial job entry
    const job = {
      id: jobId,
      status: 'validating', // 'validating' -> 'optimizing_video' -> 'analyzing_video' -> 'processing_result' -> 'completed' | 'error'
      originalFileName: req.file.originalname,
      createdAt: Date.now(),
      comparison_metadata: null,
      analysis: null,
      error: null,
    };
    jobs.set(jobId, job);

    // Respond immediately with Job ID so client can begin polling
    res.status(202).json({
      success: true,
      jobId,
      status: job.status,
      message: 'Video sunucuya ulaştı ve analiz kuyruğuna alındı.',
    });

    // Run background pipeline
    (async () => {
      let finalPath = rawPath;
      try {
        job.status = 'optimizing_video';
        const prepared = await videoProcessor.prepareForAnalysis(rawPath, optPath);
        finalPath = prepared.finalAnalysisPath;
        job.comparison_metadata = prepared.comparison;

        job.status = 'analyzing_video';
        const analysisResult = await nvidiaClient.analyzeVideo(finalPath, {
          duration: prepared.originalMeta.duration,
        });

        job.status = 'processing_result';

        // Combine top-level video metadata with strict separation of original_fps vs analysis_fps
        const completeAnalysis = {
          video_metadata: {
            duration_seconds: prepared.originalMeta.duration,
            resolution: prepared.comparison.original.resolution,
            aspect_ratio: calculateAspectRatio(prepared.originalMeta.width, prepared.originalMeta.height),
            original_fps: prepared.comparison.original.fps,
            analysis_fps: prepared.comparison.analysis.fps,
            orientation: prepared.originalMeta.width >= prepared.originalMeta.height ? 'landscape' : 'portrait',
          },
          ...analysisResult,
        };

        job.analysis = completeAnalysis;
        job.status = 'completed';
        console.log(`[Analyze Route] Job ${jobId} completed successfully!`);
      } catch (pipelineErr) {
        console.error(`[Analyze Route] Job ${jobId} failed:`, pipelineErr.message);
        job.status = 'error';
        job.error = {
          message: pipelineErr.message || 'Video analizi sırasında beklenmeyen bir hata oluştu.',
        };
      } finally {
        // Guaranteed cleanup of temporary files
        videoProcessor.cleanup([rawPath, optPath]);
      }
    })();
  });
});

/**
 * GET /api/analyze/limits
 */
router.get('/limits', (req, res) => {
  res.json({
    success: true,
    maxUploadMb,
    maxDurationSeconds: parseInt(process.env.MAX_VIDEO_DURATION_SECONDS, 10) || 180,
    supportedFormats: ['mp4', 'mov', 'webm'],
  });
});

/**
 * GET /api/analyze/:jobId
 * Polls status and retrieves final report
 */
router.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Analiz görevi bulunamadı veya süresi doldu.',
    });
  }

  if (job.status === 'error') {
    return res.status(200).json({
      success: false,
      status: 'error',
      error: job.error,
    });
  }

  if (job.status === 'completed') {
    return res.status(200).json({
      success: true,
      status: 'completed',
      comparison_metadata: job.comparison_metadata,
      analysis: job.analysis,
    });
  }

  return res.status(200).json({
    success: true,
    status: job.status,
  });
});

module.exports = router;
