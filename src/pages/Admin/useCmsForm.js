import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (cms) setFormData(cms);
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
      await updateCMS(formData);
      setIsDirty(false);
      showToast('Değişiklikler başarıyla kaydedildi!');
    } catch {
      showToast('Kaydedilirken hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return { cms, formData, setFormData, handleChange, handleSave, isDirty, isSaving, toast, showToast };
}
