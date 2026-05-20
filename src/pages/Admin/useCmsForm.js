import { useState, useEffect, useRef } from 'react';
import useCmsStore from '../../store/cmsStore';

/**
 * Shared hook for CMS form pages (hero, texts, images, contact).
 * Provides formData, handleChange, handleSave, isDirty, isSaving, toast state.
 */
export function useCmsForm() {
  const { cms, updateCMS } = useCmsStore();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const initialized = useRef(false);

  // Only initialize from cms on first load, not after saves
  useEffect(() => {
    if (cms && !initialized.current) {
      setFormData(cms);
      initialized.current = true;
    }
  }, [cms]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateCMS(formData);
      setIsDirty(false);
      showToast('Değişiklikler başarıyla kaydedildi!');
    } catch (err) {
      console.error('[useCmsForm] Save error:', err);
      showToast('Kaydedilirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateAndSave = async (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setIsSaving(true);
    try {
      await updateCMS(newFormData);
      setIsDirty(false);
      showToast('Kaydedildi!', 'success');
    } catch (err) {
      console.error('[useCmsForm] AutoSave error:', err);
      showToast('Kaydedilirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return { cms, formData, setFormData, handleChange, handleSave, updateAndSave, isDirty, isSaving, toast, showToast };
}
