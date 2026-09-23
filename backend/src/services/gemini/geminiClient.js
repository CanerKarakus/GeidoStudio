const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const path = require('path');

class GeminiClient {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[GeminiClient] GEMINI_API_KEY is missing in env!');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.fileManager = new GoogleAIFileManager(this.apiKey);
    this.model = 'gemini-flash-lite-latest';
  }

  /**
   * Waits for a file to be processed by Google AI File Manager
   */
  async waitForFileProcessing(name) {
    let file = await this.fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      file = await this.fileManager.getFile(name);
    }
    
    if (file.state === "FAILED") {
      throw new Error("Video işlenirken bir hata oluştu (Google AI API).");
    }
    console.log(`\n[GeminiClient] File ${file.displayName} is ready for analysis.`);
    return file;
  }

  _parseTimestampToSeconds(ts) {
    try {
      if (!ts) return 0;
      const parts = ts.split(':');
      if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
      }
      return parseFloat(ts) || 0;
    } catch (e) {
      return 0;
    }
  }

  _validateOutput(jsonOutput, videoDuration) {
    const errors = [];
    
    // 1. Timeline Coverage
    if (!jsonOutput.timeline || !Array.isArray(jsonOutput.timeline) || jsonOutput.timeline.length === 0) {
      errors.push("Timeline array is missing or empty.");
    } else {
      const firstEvent = jsonOutput.timeline[0];
      const lastEvent = jsonOutput.timeline[jsonOutput.timeline.length - 1];
      
      const startSec = this._parseTimestampToSeconds(firstEvent.start_timestamp);
      const endSec = this._parseTimestampToSeconds(lastEvent.end_timestamp);
      
      if (startSec > 1.0) {
        errors.push(`Timeline does not start near 0.00. First event starts at ${firstEvent.start_timestamp}.`);
      }
      
      if (videoDuration && videoDuration > 0) {
        const tolerance = 1.0; 
        if (endSec < videoDuration - tolerance) {
          errors.push(`Timeline is incomplete. Video duration is ${videoDuration}s, but timeline ends at ${lastEvent.end_timestamp}. Missing ${lastEvent.end_timestamp} -> ${videoDuration.toFixed(2)}s.`);
        }
      }
    }
    
    // 2. Empty fields and Exact Values checking
    const exactValueStrings = ['K', 'Kelvin', 'mm', 'tripod', 'gimbal', 'motorized'];
    const traverse = (obj, path = "") => {
      if (obj === null) {
        errors.push(`Field '${path}' is null. Use the status object schema instead.`);
        return;
      }
      if (typeof obj === 'string') {
        if (obj.trim() === "") {
          errors.push(`Field '${path}' is an empty string. Use 'none_detected' or similar instead.`);
        } else {
          // Check for exact unsupported physical observations if it's not a status field
          if (!path.endsWith('.status')) {
            const lower = obj.toLowerCase();
            for (const word of exactValueStrings) {
              if (lower.includes(word) && !lower.includes('uncertain') && !lower.includes('appears to be')) {
                errors.push(`Field '${path}' contains unsupported exact/physical observation '${word}' without 'uncertain' or 'appears to be'. Refrain from hallucinating exact physical equipment.`);
                break;
              }
            }
          }
        }
      } else if (Array.isArray(obj)) {
        if (obj.length === 0 && path !== 'uncertainties') {
          errors.push(`Array '${path}' is empty. Must contain values or status objects.`);
        }
        obj.forEach((val, i) => traverse(val, `${path}[${i}]`));
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(k => traverse(obj[k], path ? `${path}.${k}` : k));
      }
    };
    
    traverse(jsonOutput);
    return errors;
  }

  _normalizeOutput(json) {
    if (!json) return json;

    const unwrapDeep = (obj) => {
      if (obj === null || obj === undefined) return '';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (Array.isArray(obj)) {
        return obj.map(unwrapDeep);
      }
      if (typeof obj === 'object') {
        if (obj.value !== undefined) return unwrapDeep(obj.value);
        if (obj.type || obj.direction) {
          return [obj.type, obj.direction, obj.relative_speed, obj.smoothness].filter(Boolean).join(' — ');
        }
        if (obj.primary_action || obj.secondary_motion) {
          const parts = [obj.primary_action];
          if (obj.secondary_motion && obj.secondary_motion !== 'none_detected') {
            parts.push(`İkincil: ${obj.secondary_motion}`);
          }
          return parts.filter(Boolean).join(' | ');
        }
        const res = {};
        for (const [k, v] of Object.entries(obj)) {
          res[k] = unwrapDeep(v);
        }
        return res;
      }
      return String(obj);
    };

    const res = unwrapDeep(json);

    if (res.composition) {
      res.composition.framing_approach = res.composition.framing_approach || res.composition.spatial_arrangement || '';
    }
    if (res.motion) {
      res.motion.subject_motion = res.motion.subject_motion || res.motion.subject_movement || '';
      res.motion.camera_motion = res.motion.camera_motion || res.motion.camera_movement || '';
    }

    return res;
  }

  /**
   * Analyzes a video using Gemini 1.5 Flash
   * @param {string} videoPath 
   * @param {object} options 
   * @returns {Promise<object>} JSON analysis report
   */
  async analyzeVideo(videoPath, options = {}) {
    let uploadedFile = null;
    try {
      console.log(`[GeminiClient] Uploading video to Google AI API: ${videoPath}`);
      const uploadResult = await this.fileManager.uploadFile(videoPath, {
        mimeType: "video/mp4",
        displayName: path.basename(videoPath),
      });
      uploadedFile = uploadResult.file;

      console.log(`[GeminiClient] Upload successful. Waiting for processing...`);
      await this.waitForFileProcessing(uploadedFile.name);

      const basePromptText = `Sen profesyonel bir "Cinematographer", "Director of Photography", "Camera Operator" ve "VFX/Motion Analyst" sin.
Görevin videoyu sıradan bir izleyici gibi "anlatmak" değil, profesyonel bir gözle görsel, zamansal, kamera, kompozisyon, ışık, hareket ve çevresel bilgileri teknik olarak "reverse-engineer" (tersine mühendislik) etmektir. Bir kullanıcı bu videoyu başka bir video üretim modelinde yeniden oluşturmak istediğinde senin analizine ihtiyaç duyacaktır.

LÜTFEN AŞAĞIDAKİ KATI KURALLARA UY:

1. WHOLE VIDEO COVERAGE: Videoyu 00:00.00'dan tam son saniyesine kadar analiz et. 
2. DO NOT LEAVE FIELDS EMPTY: Hiçbir alanı "", null veya boş dizi [] bırakma (uncertainties hariç). Eğer bir bilgi yoksa, ilgili nesnede "status" alanını ("none_detected", "not_visible", "uncertain") kullan.
3. FACT VS INFERENCE: Exact Kelvin, focal length, tripod, gimbal, camera model gibi verileri uydurma. Kameranın hareket karakteristiğini tanımla.
4. CAMERA MOVEMENT: Optical zoom ile physical movement (dolly/pan/tilt) kavramlarını net ayır. Yön, hız ve yumuşaklık belirt.
5. SPATIAL COMPOSITION: Sol, sağ, ön plan (foreground), arka plan, negatif alan (negative space), derinlik, simetri ve görsel hiyerarşiyi somut olarak analiz et.
6. SECONDARY MOTION: Kumaş, saç, rüzgar, gölge, yansıma gibi ikincil hareketleri kaçırma. Yoksa none_detected de.
7. TIMELINE GRANULARITY: Her saniyede değil, "kamera hareketi", "kompozisyon değişimi", "ışık/sahne değişimi" yaşandıkça yeni event/interval oluştur.
8. QUALITY STANDARD: "Minimalist studio advertisement" gibi yüzeysel anlatılar yerine spatial arrangement, timing ve optics detaylarına odaklan.

Yalnızca aşağıdaki JSON yapısında pürüzsüz bir çıktı ver (Markdown '''json blokları kullanma):

{
  "overview": {
    "visual_summary": "Kısa genel teknik özet"
  },
  "timeline": [
    {
      "start_timestamp": "00:00.00",
      "end_timestamp": "00:03.00",
      "event": "Olayın Adı",
      "scene_description": {
        "status": "observed",
        "value": "Arka plan, ortam ve genel hissiyat"
      },
      "camera_behavior": {
        "type": "dolly_backward | pan_right | static | optical_zoom_in | vb",
        "direction": "hareket yönü",
        "relative_speed": "hız",
        "smoothness": "pürüzsüzlük"
      },
      "subject_actions": {
        "primary_action": "öznenin ana hareketi",
        "secondary_motion": "gölge, yansıma, kumaş dalgalanması vb. (yoksa none_detected)"
      },
      "lighting_state": {
        "status": "observed",
        "value": "Bu sahnedeki ışık yönü ve karakteri"
      },
      "composition": {
        "status": "observed",
        "value": "Kadrajlama, foreground/background ilişkisi, left/center/right yerleşimleri"
      }
    }
  ],
  "camera": {
    "shot_types": [
      {"status": "observed", "value": "Close-up vb."}
    ],
    "angles": [
      {"status": "observed", "value": "Eye-level vb."}
    ],
    "position_and_height": {
      "status": "observed",
      "value": "Kamera konumu"
    },
    "stabilization": {
      "status": "observed",
      "value": "Görsel stabilizasyon karakteristiği"
    }
  },
  "optics": {
    "perspective": {
      "status": "observed",
      "value": "Wide, Telephoto, Normal vb."
    },
    "depth_of_field": {
      "status": "observed",
      "value": "Alan Derinliği (Shallow, Deep vb.)"
    },
    "focus_characteristics": {
      "status": "none_detected",
      "value": "Odak geçişi varsa belirt"
    }
  },
  "lighting": {
    "key_light": {
      "status": "observed",
      "value": "Ana Işık yönü ve karakteri"
    },
    "fill_light": {
      "status": "observed",
      "value": "Dolgu Işığı"
    },
    "contrast_ratio": {
      "status": "observed",
      "value": "Kontrast Oranı"
    },
    "color_temperature": {
      "status": "uncertain",
      "value": "Renk Sıcaklığı tahmini (kesin değer uydurma)"
    }
  },
  "composition": {
    "spatial_arrangement": {
      "status": "observed",
      "value": "Sol, sağ, alt, üst, merkez ilişkileri"
    },
    "depth_and_layering": {
      "status": "observed",
      "value": "Ön, orta, arka plan katmanları"
    },
    "visual_balance": {
      "status": "observed",
      "value": "Simetrik, Asimetrik vb."
    }
  },
  "motion": {
    "subject_movement": {
      "status": "observed",
      "value": "Özne Hareketi"
    },
    "camera_movement": {
      "status": "observed",
      "value": "Kamera Hareketi özeti"
    }
  },
  "uncertainties": [
    "Emin olamadığın detaylar veya tahmin yürütülen veriler"
  ]
}`;

      let currentPrompt = basePromptText;
      if (options.duration) {
        currentPrompt += `\n\nVideo Duration: ${options.duration.toFixed(2)} seconds. TIMELINE MUST REACH THIS DURATION EXACTLY.`;
      }

      console.log(`[GeminiClient] Sending first prompt to Gemini...`);
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      let result = await model.generateContent([
        {
          fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri }
        },
        { text: currentPrompt }
      ]);

      let responseText = result.response.text();
      let cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedJson = JSON.parse(cleanedJson);
      
      const validationErrors = this._validateOutput(parsedJson, options.duration);
      
      if (validationErrors.length > 0) {
        console.warn(`[GeminiClient] First pass validation failed. Errors:`, validationErrors);
        console.log(`[GeminiClient] Requesting Correction Pass...`);
        
        const correctionPrompt = `Your previous output failed validation.
Video duration: ${options.duration ? options.duration.toFixed(2) : "Unknown"} seconds.
Timeline currently ends at: ${parsedJson.timeline ? parsedJson.timeline[parsedJson.timeline.length - 1].end_timestamp : "Unknown"}.

Validation Errors:
${validationErrors.map(e => "- " + e).join("\n")}

Fix all these errors. 
Ensure timeline fully covers up to the video duration.
Use status objects {"status": "none_detected", "value": "..."} instead of empty strings.
Remove any exact physical equipment hallucinations.
Return corrected JSON only.
Do not explain the correction.
`;

        result = await model.generateContent([
          {
            fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri }
          },
          { text: basePromptText },
          { text: "Here is your previous invalid output for context: " + cleanedJson },
          { text: correctionPrompt }
        ]);

        responseText = result.response.text();
        cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleanedJson);
        
        const finalValidation = this._validateOutput(parsedJson, options.duration);
        if (finalValidation.length > 0) {
            console.error(`[GeminiClient] Correction pass also failed validation:`, finalValidation);
            throw new Error(`Video analizi kalite kontrolünden geçemedi:\n${finalValidation.join('\n')}`);
        } else {
            console.log(`[GeminiClient] Correction pass succeeded!`);
        }
      }

      return this._normalizeOutput(parsedJson);
    } catch (err) {
      console.error(`[GeminiClient] Error analyzing video:`, err.message);
      throw new Error(`Gemini API Hatası: ${err.message}`);
    } finally {
      if (uploadedFile && uploadedFile.name) {
        try {
          console.log(`[GeminiClient] Deleting temporary file from Google servers...`);
          await this.fileManager.deleteFile(uploadedFile.name);
        } catch (delErr) {
          console.warn(`[GeminiClient] Failed to delete file ${uploadedFile.name}:`, delErr.message);
        }
      }
    }
  }
}

module.exports = new GeminiClient();
