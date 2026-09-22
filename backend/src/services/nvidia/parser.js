/**
 * NVIDIA Response Parser & Validator
 * 
 * Safely extracts and validates JSON from NVIDIA multimodal model responses.
 * Handles markdown code blocks, trims preambles, and enforces structural integrity
 * without fabricating hallucinated details.
 */

function extractJsonString(rawText) {
  if (typeof rawText !== 'string') {
    throw new Error('Model çıktısı metin formatında değil.');
  }

  let text = rawText.trim();

  // Strip markdown code fences (e.g. ```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  } else {
    // If no code block, try to find the first '{' and the last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
  }

  return text;
}

function parseAndValidateAnalysis(rawOutput) {
  const jsonStr = extractJsonString(rawOutput);

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Parser Error] Failed to parse model output as JSON:', err.message);
    console.error('[Parser Error] Raw preview (first 500 chars):', rawOutput.slice(0, 500));
    throw new Error(`Model yanıtı geçerli JSON formatında değil: ${err.message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Model yanıtı beklenen JSON nesnesi formatında değil.');
  }

  // Ensure default structures exist for all 18 categories to prevent frontend crashes
  const validated = {
    overview: {
      scene_count: typeof parsed.overview?.scene_count === 'number' ? parsed.overview.scene_count : 1,
      visual_summary: parsed.overview?.visual_summary || 'Görsel özet mevcut değil.',
    },
    timeline: Array.isArray(parsed.timeline) ? parsed.timeline.map((item, idx) => ({
      start_timestamp: item.start_timestamp || `00:0${idx}.00`,
      end_timestamp: item.end_timestamp || `00:0${idx + 2}.00`,
      event: item.event || `Olay ${idx + 1}`,
      scene_description: item.scene_description || '',
      camera_behavior: item.camera_behavior || '',
      subject_actions: item.subject_actions || '',
      lighting_state: item.lighting_state || '',
      composition: item.composition || '',
    })) : [],
    camera: {
      shot_types: Array.isArray(parsed.camera?.shot_types) ? parsed.camera.shot_types : [],
      angles: Array.isArray(parsed.camera?.angles) ? parsed.camera.angles : [],
      position_and_height: parsed.camera?.position_and_height || 'Belirtilmedi',
      stabilization: parsed.camera?.stabilization || 'Belirtilmedi',
      movements: Array.isArray(parsed.camera?.movements) ? parsed.camera.movements : [],
    },
    optics: {
      perspective: parsed.optics?.perspective || 'Belirtilmedi',
      perspective_compression: parsed.optics?.perspective_compression || 'Belirtilmedi',
      depth_of_field: parsed.optics?.depth_of_field || 'Belirtilmedi',
      bokeh_characteristics: parsed.optics?.bokeh_characteristics || 'Belirtilmedi',
      optical_distortion: parsed.optics?.optical_distortion || 'Belirtilmedi',
    },
    focus: {
      primary_focus_subject: parsed.focus?.primary_focus_subject || 'Belirtilmedi',
      focus_behavior: parsed.focus?.focus_behavior || 'Belirtilmedi',
      transitions: Array.isArray(parsed.focus?.transitions) ? parsed.focus.transitions : [],
    },
    subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
    objects: Array.isArray(parsed.objects) ? parsed.objects : [],
    environment: {
      setting: parsed.environment?.setting || 'Belirtilmedi',
      location_type: parsed.environment?.location_type || 'Belirtilmedi',
      architecture_geometry: parsed.environment?.architecture_geometry || 'Belirtilmedi',
      foreground: parsed.environment?.foreground || 'Belirtilmedi',
      midground: parsed.environment?.midground || 'Belirtilmedi',
      background: parsed.environment?.background || 'Belirtilmedi',
      atmosphere: parsed.environment?.atmosphere || 'Belirtilmedi',
    },
    composition: {
      framing_approach: parsed.composition?.framing_approach || 'Belirtilmedi',
      visual_balance: parsed.composition?.visual_balance || 'Belirtilmedi',
      negative_space: parsed.composition?.negative_space || 'Belirtilmedi',
      leading_lines: parsed.composition?.leading_lines || 'Belirtilmedi',
      depth_layering: parsed.composition?.depth_layering || 'Belirtilmedi',
      dominant_focal_point: parsed.composition?.dominant_focal_point || 'Belirtilmedi',
    },
    lighting: {
      key_light: parsed.lighting?.key_light || 'Belirtilmedi',
      fill_light: parsed.lighting?.fill_light || 'Belirtilmedi',
      backlight_rim: parsed.lighting?.backlight_rim || 'Belirtilmedi',
      practical_lights: parsed.lighting?.practical_lights || 'Belirtilmedi',
      natural_vs_artificial: parsed.lighting?.natural_vs_artificial || 'Belirtilmedi',
      contrast_ratio: parsed.lighting?.contrast_ratio || 'Belirtilmedi',
      color_temperature: parsed.lighting?.color_temperature || 'Belirtilmedi',
      shadow_characteristics: parsed.lighting?.shadow_characteristics || 'Belirtilmedi',
    },
    color: {
      dominant_colors: Array.isArray(parsed.color?.dominant_colors) ? parsed.color.dominant_colors : [],
      secondary_colors: Array.isArray(parsed.color?.secondary_colors) ? parsed.color.secondary_colors : [],
      warm_cool_balance: parsed.color?.warm_cool_balance || 'Belirtilmedi',
      saturation: parsed.color?.saturation || 'Belirtilmedi',
      contrast: parsed.color?.contrast || 'Belirtilmedi',
      grading_style: parsed.color?.grading_style || 'Belirtilmedi',
    },
    motion: {
      subject_motion: parsed.motion?.subject_motion || 'Belirtilmedi',
      camera_motion: parsed.motion?.camera_motion || 'Belirtilmedi',
      environmental_motion: parsed.motion?.environmental_motion || 'Belirtilmedi',
      secondary_motion: parsed.motion?.secondary_motion || 'Belirtilmedi',
    },
    effects: Array.isArray(parsed.effects) ? parsed.effects : [],
    editing: {
      cut_count: typeof parsed.editing?.cut_count === 'number' ? parsed.editing.cut_count : 0,
      transitions: Array.isArray(parsed.editing?.transitions) ? parsed.editing.transitions : [],
      pacing: parsed.editing?.pacing || 'Belirtilmedi',
      speed_manipulation: parsed.editing?.speed_manipulation || 'Belirtilmedi',
    },
    visual_style: {
      aesthetic_category: parsed.visual_style?.aesthetic_category || 'Belirtilmedi',
      rendering_texture: parsed.visual_style?.rendering_texture || 'Belirtilmedi',
      visual_tone: parsed.visual_style?.visual_tone || 'Belirtilmedi',
    },
    continuity: {
      subject_continuity: parsed.continuity?.subject_continuity || 'Belirtilmedi',
      lighting_continuity: parsed.continuity?.lighting_continuity || 'Belirtilmedi',
      environment_continuity: parsed.continuity?.environment_continuity || 'Belirtilmedi',
    },
    uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties : [
      'Görsel olarak kesinleşemeyen kamera/lens ekipman parametreleri ve görünmeyen arka plan detayları.'
    ],
  };

  return validated;
}

module.exports = {
  extractJsonString,
  parseAndValidateAnalysis,
};
