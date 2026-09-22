/**
 * NVIDIA API Client
 * 
 * Interacts with NVIDIA's OpenAI-compatible multimodal endpoint for Cosmos3-Nano-Reasoner.
 * Supports configurable base URL, timeout, max output tokens, and base64 video transport.
 */

const fs = require('fs');
const { SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE } = require('./prompts/technicalVideoAnalysis');
const { parseAndValidateAnalysis } = require('./parser');

class NvidiaClient {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.baseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
    this.model = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';
    this.timeoutMs = parseInt(process.env.NVIDIA_REQUEST_TIMEOUT_MS, 10) || 300000; // 5 min default
    this.maxTokens = parseInt(process.env.NVIDIA_MAX_OUTPUT_TOKENS, 10) || 8192;
    this.provider = process.env.ANALYSIS_PROVIDER || (process.env.NODE_ENV === 'production' ? 'nvidia' : 'nvidia');
  }

  /**
   * Analyze an optimized video file with NVIDIA Multimodal Model
   * @param {string} videoFilePath - Absolute path to the optimized MP4 video file
   * @param {object} options - Optional configuration overrides
   * @returns {Promise<object>} Structured analysis JSON object
   */
  async analyzeVideo(videoFilePath, options = {}) {
    // Development-only Mock Provider (Explicit opt-in via env variable)
    if (this.provider === 'mock' && process.env.NODE_ENV !== 'production') {
      console.log('[NvidiaClient] Using MOCK analysis provider (Development mode only).');
      return this._generateMockAnalysis(options);
    }

    if (!this.apiKey) {
      throw new Error('NVIDIA_API_KEY yapılandırılmamış. Lütfen backend .env dosyasına geçerli bir anahtar ekleyin.');
    }

    if (!fs.existsSync(videoFilePath)) {
      throw new Error(`Analiz edilecek video dosyası bulunamadı: ${videoFilePath}`);
    }

    const videoBuffer = fs.readFileSync(videoFilePath);
    const videoBase64 = videoBuffer.toString('base64');
    const dataUri = `data:video/mp4;base64,${videoBase64}`;

    const endpoint = `${this.baseUrl}/chat/completions`;

    const userContent = [
      {
        type: 'text',
        text: USER_PROMPT_TEMPLATE,
      },
    ];

    if (options.keyframePath && fs.existsSync(options.keyframePath)) {
      const kfBuffer = fs.readFileSync(options.keyframePath);
      const kfBase64 = kfBuffer.toString('base64');
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${kfBase64}`,
        },
      });
      console.log(`[NvidiaClient] Included video keyframe (${(kfBuffer.length / 1024).toFixed(1)} KB) in payload.`);
    } else {
      userContent.push({
        type: 'video_url',
        video_url: {
          url: dataUri,
        },
      });
    }

    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_INSTRUCTION}\n\nCRITICAL CONSTRAINTS:\n1. Your response MUST be a single, valid, parsable JSON object conforming strictly to the requested schema.\n2. Do NOT output any markdown wrappers, no introductory or concluding text.`,
      },
      {
        role: 'user',
        content: userContent,
      },
    ];

    const payload = {
      model: this.model,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: this.maxTokens,
      temperature: 0.1,
      stream: false,
    };

    console.log(`[NvidiaClient] Sending request to ${endpoint} with model ${this.model} (Timeout: ${this.timeoutMs}ms, Payload video size: ${(videoBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutSeconds = Math.round(this.timeoutMs / 1000);
        throw new Error(`NVIDIA API zaman aşımına uğradı (${timeoutSeconds} saniye). Lütfen daha kısa bir video deneyin veya NVIDIA_REQUEST_TIMEOUT_MS değerini artırın.`);
      }
      throw new Error(`NVIDIA API sunucusuna bağlanırken ağ hatası oluştu: ${err.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let errorBody = {};
      try {
        errorBody = await res.json();
      } catch (e) {
        errorBody = { raw: await res.text().catch(() => '') };
      }

      console.error(`[NvidiaClient] Error HTTP ${res.status}:`, JSON.stringify(errorBody, null, 2));

      if (res.status === 401) {
        throw new Error('NVIDIA API kimlik doğrulama hatası (401 Unauthorized). Lütfen NVIDIA_API_KEY değerini kontrol edin.');
      } else if (res.status === 429) {
        throw new Error('NVIDIA API istek limiti aşıldı (429 Rate Limit). Lütfen birkaç dakika sonra tekrar deneyin.');
      } else if (res.status >= 500) {
        throw new Error(`NVIDIA sunucu hatası (HTTP ${res.status}): ${errorBody?.error?.message || 'Geçici model sunucusu arızası.'}`);
      } else {
        const rawErr = JSON.stringify(errorBody);
        if (res.status === 404 && (rawErr.includes('Not found for account') || rawErr.includes('Function'))) {
          throw new Error('NVIDIA Cosmos modeli hesabınız için henüz aktifleştirilmemiş. Lütfen https://build.nvidia.com/nvidia/cosmos-reason2-8b sayfasına gidip "Get API Key" butonuna basarak model lisans şartlarını onaylayın.');
        }
        const detail = errorBody?.error?.message || errorBody?.message || rawErr;
        throw new Error(`NVIDIA API hatası (HTTP ${res.status}): ${detail}`);
      }
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('NVIDIA modelinden boş yanıt alındı (choices[0].message.content eksik).');
    }

    console.log('[NvidiaClient] Successfully received raw response from NVIDIA. Parsing...');
    return parseAndValidateAnalysis(rawContent);
  }

  /**
   * Realistic mock analysis generator for local offline development only.
   */
  _generateMockAnalysis(options = {}) {
    const duration = options.duration || 6.5;
    return {
      overview: {
        scene_count: 2,
        visual_summary: 'Şehir ortamında orta mesafeli bir sokak kesiti boyunca ilerleyen özne ve arka plandaki mimari yapıların incelenmesi.',
      },
      timeline: [
        {
          start_timestamp: '00:00.00',
          end_timestamp: '00:03.20',
          event: 'Açılış ve İleriye Doğru Kamera Hareketi',
          scene_description: 'Sahne orta-geniş planla açılır. Özne kadrajın merkezinde durağandır. Kamera hafif bir ileriye doğru dolly hareketi başlatır.',
          camera_behavior: 'Göz hizasında, hafif öne doğru dolly-in, sabit gimbal stabilizasyonu.',
          subject_actions: 'Özne sabit durur, başını hafifçe sağa çevirerek vitrine bakar.',
          lighting_state: 'Yumuşak doğal gün ışığı, sol üstten gelen dağınık ana ışık.',
          composition: 'Merkezi simetrik yerleşim, arka planda bina hatları derinlik katmanı oluşturuyor.',
        },
        {
          start_timestamp: '00:03.20',
          end_timestamp: '00:06.50',
          event: 'Yürüme Hareketi ve Kadraj Değişimi',
          scene_description: 'Özne sağa doğru yürümeye başlar. Kamera hareketi takip ederek sağa doğru pan yapar ve kadraj orta plana yaklaşır.',
          camera_behavior: 'Sağa takip panı (tracking), hareket hızı öznenin yürüme temposuyla senkron.',
          subject_actions: 'Özne ritmik bir adımla kadrajın sağ dışına doğru yönelir.',
          lighting_state: 'Gölgeye giriş nedeniyle kontrast oranı hafifçe yükselir.',
          composition: 'Üçler kuralı (rule of thirds) sağ dikey çizgisine doğru özne kayması.',
        },
      ],
      camera: {
        shot_types: ['medium-wide', 'medium-shot'],
        angles: ['eye-level'],
        position_and_height: 'Yaklaşık 1.6m yükseklik, özneyle göz hizasında, 3-4 metre mesafede.',
        stabilization: 'Stabilize mekanik gimbal görünümü, minimal titreşim.',
        movements: [
          {
            type: 'dolly in',
            start: '00:00.00',
            end: '00:03.20',
            direction: 'forward',
            speed: 'slow',
            smoothness: 'smooth',
            relation_to_subject: 'Özneye doğru yaklaşma',
          },
          {
            type: 'tracking pan',
            start: '00:03.20',
            end: '00:06.50',
            direction: 'right',
            speed: 'moderate',
            smoothness: 'smooth',
            relation_to_subject: 'Yürüyen özneyi kadrajda tutarak sağa kayma',
          },
        ],
      },
      optics: {
        perspective: 'normal perspective (35mm-50mm görünümü hissi)',
        perspective_compression: 'moderate perspective compression',
        depth_of_field: 'moderate shallow DOF',
        bokeh_characteristics: 'arkada hafif dairesel yumuşak bulanıklık',
        optical_distortion: 'minimal optik bozulma',
      },
      focus: {
        primary_focus_subject: 'Öznede netlik kilitli',
        focus_behavior: 'özne hareket ettikçe netlik alanı özne üzerinde kalıyor (follow focus hissi)',
        transitions: [],
      },
      subjects: [
        {
          identifier: 'Birincil Özne',
          apparent_presentation: 'Yetişkin birey (tahmini 25-35 yaş aralığı hissi)',
          clothing: 'Koyu gri minimalist trençkot, siyah kumaş pantolon',
          clothing_colors: ['#333333', '#111111'],
          pose_and_orientation: 'İlk başta kadraj merkezinde yüz kameraya dönük, ardından 90 derece sağ profil yönelimi',
          facial_expression: 'Sakin, odaklanmış ve nötr yüz ifadesi',
          actions: 'Durağan duruştan sağa doğru yürüme aksiyonuna geçiş',
          movement_speed: 'orta tempoda yürüme',
          frame_position: 'merkezden sağ üçte bire doğru geçiş',
        },
      ],
      objects: [
        {
          name: 'Cam Vitrin',
          appearance: 'Yansımalı cam yüzey',
          location: 'Sol arka plan',
          interaction: 'Özne geçerken camda hafif yansıma oluşuyor',
        },
      ],
      environment: {
        setting: 'outdoor urban',
        location_type: 'Modern şehir caddesi, yaya yolu',
        architecture_geometry: 'Dikey kolonlar, taş kaplama zemin, cam cepheli mağazalar',
        foreground: 'Temiz kaldırım yüzeyi',
        midground: 'Özne ve sokak lambası direği',
        background: 'Bulanıklaşan cadde derinliği ve çok katlı yapılar',
        atmosphere: 'Berrak hava, parçalı bulutlu dağınık gün ışığı',
      },
      composition: {
        framing_approach: 'Merkezden kural-dışı asimetrik üçler kuralına geçiş',
        visual_balance: 'Dengeli ve ferah kompozisyon',
        negative_space: 'Gökyüzü ve geniş kaldırım nedeniyle üst ve sol kısımda geniş negatif alan',
        leading_lines: 'Kaldırım bordür taşları ve bina saçakları sağ alt köşeye doğru yönlendirme sağlıyor',
        depth_layering: 'Belirgin 3 katmanlı derinlik ayrımı (ön zemin - özne - mimari arka plan)',
        dominant_focal_point: 'Öznenin yüz ve üst gövde bölgesi',
      },
      lighting: {
        key_light: 'Sol üst açıdan gelen doğal gökyüzü dağınık ışığı',
        fill_light: 'Zemin ve cam yüzeylerden yansıyan yumuşak dolgu ışığı',
        backlight_rim: 'Hafif saç ve omuz üstü kenar parlaması',
        practical_lights: 'Gündüz olduğu için yapay ışıklar kapalı veya etkisiz',
        natural_vs_artificial: 'Doğal gün ışığı',
        contrast_ratio: 'Orta-düşük kontrast, gölgeler detay kaybetmiyor',
        color_temperature: 'Nötr-hafif sıcak (yaklaşık 5400K hissi)',
        shadow_characteristics: 'Yumuşak yayılmış zemin gölgeleri',
      },
      color: {
        dominant_colors: ['#4a5568', '#cbd5e1', '#1a202c'],
        secondary_colors: ['#94a3b8', '#64748b'],
        warm_cool_balance: 'Nötr gri ve hafif soğuk tonların hakimiyeti',
        saturation: 'Doğal, hafif desatüre sinematik palet',
        contrast: 'Orta seviye',
        grading_style: 'Temiz, modern sinematik kentsel renk derecelendirmesi',
      },
      motion: {
        subject_motion: 'Durağan halden sağa doğru doğrusal yürüme hareketi',
        camera_motion: 'İleri doğru yavaş dolly ardından sağa yumuşak pan',
        environmental_motion: 'Arka planda rüzgarla salınan hafif yaprak hareketi',
        secondary_motion: 'Yürürken trençkotun eteklerinde salınım hareketi',
      },
      effects: [
        {
          type: 'motion blur',
          intensity: 'subtle',
          notes: 'Yürüme anında bacak ve kollarda doğal hareket bulanıklığı',
        },
      ],
      editing: {
        cut_count: 0,
        transitions: ['Kesintisiz tek plan sekans (continuous single-take)'],
        pacing: 'Sakin ve akıcı tempo',
        speed_manipulation: 'Gerçek zamanlı hız (real-time playback)',
      },
      visual_style: {
        aesthetic_category: 'Fotogerçekçi sinematik gerçekçilik',
        rendering_texture: 'Temiz dijital sensör dokusu, minimal ince gren',
        visual_tone: 'Modern, profesyonel, sakin ve kontrollü atmosfer',
      },
      continuity: {
        subject_continuity: 'Kıyafet ve aksiyon akışında tam devamlılık',
        lighting_continuity: 'Doğal ışık koşulları sahne boyunca tutarlı',
        environment_continuity: 'Mekansal süreklilik korunuyor',
      },
      uncertainties: [
        'Kamera sensörü boyutu ve lensin kesin milimetrik fokal değeri görsel olarak doğrulanamaz.',
        'Öznenin kıyafet kumaşının kesin doku türü mesafeden ötürü kesinleşememektedir.',
      ],
    };
  }
}

module.exports = new NvidiaClient();
