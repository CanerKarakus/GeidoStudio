/**
 * Frame Extractor & Quality Benchmark Service
 * 
 * Extracts representative frames from original and optimized videos at relative timestamps
 * (e.g. 20%, 50%, 80% of total duration) to allow visual and temporal quality comparison.
 * Gracefully degrades if FFmpeg is unavailable.
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

class FrameExtractor {
  constructor() {
    const localFfmpeg = path.join(__dirname, '../../../bin/linux-x64/ffmpeg');
    this.ffmpegPath = fs.existsSync(localFfmpeg) ? localFfmpeg : (process.env.FFMPEG_PATH || 'ffmpeg');
  }

  /**
   * Extract a single frame at a specific timestamp
   * @param {string} videoPath - Video file path
   * @param {number} timestampSec - Timestamp in seconds
   * @param {string} outputPath - Output image path (.png or .jpg)
   * @returns {Promise<string>} Output image path
   */
  async extractFrameAt(videoPath, timestampSec, outputPath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-ss', timestampSec.toString(),
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '2',
        outputPath,
      ];

      execFile(this.ffmpegPath, args, { timeout: 15000 }, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Kare çıkarımı başarısız oldu: ${stderr || error.message}`));
        }
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
          return reject(new Error('Kare dosyası üretilemedi veya boş.'));
        }
        resolve(outputPath);
      });
    });
  }

  /**
   * Extract comparison frames at 25%, 50%, and 75% for original vs optimized videos
   * @param {string} originalPath 
   * @param {string} optimizedPath 
   * @param {number} duration 
   * @param {string} outputDir 
   * @returns {Promise<Array>} Map of extracted frame paths
   */
  async extractBenchmarkPairs(originalPath, optimizedPath, duration, outputDir) {
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const safeDuration = Math.max(1, duration);
      const timestamps = [
        Math.round(safeDuration * 0.25 * 100) / 100,
        Math.round(safeDuration * 0.50 * 100) / 100,
        Math.round(safeDuration * 0.75 * 100) / 100,
      ];

      const results = [];

      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        const origFrame = path.join(outputDir, `orig_frame_${i + 1}_${t}s.png`);
        const optFrame = path.join(outputDir, `opt_frame_${i + 1}_${t}s.png`);

        await this.extractFrameAt(originalPath, t, origFrame);
        await this.extractFrameAt(optimizedPath, t, optFrame);

        results.push({
          timestamp: t,
          originalFrame: origFrame,
          optimizedFrame: optFrame,
          origSizeBytes: fs.statSync(origFrame).size,
          optSizeBytes: fs.statSync(optFrame).size,
        });
      }

      return results;
    } catch (err) {
      console.warn('[FrameExtractor] Frame extraction bypassed (ffmpeg unavailable or error):', err.message);
      return [];
    }
  }
}

module.exports = new FrameExtractor();
