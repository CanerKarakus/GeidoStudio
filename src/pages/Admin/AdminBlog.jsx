import React, { useState, useEffect } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminBlog.module.scss';
import { Plus, Trash2, Edit2, Save, X, GripVertical, AlertCircle, Check, Bot, Loader } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import { api } from '../../api/db';

const createSlug = (title) => {
  return title.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-') + '-blog';
};

const AdminBlog = () => {
  const { cms, updateCMS } = useCmsStore();

  const [localBlogs, setLocalBlogs] = useState(cms?.blogs || []);
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOrderDirty) {
      setLocalBlogs(cms?.blogs || []);
    }
  }, [cms?.blogs, isOrderDirty]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    author: '',
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiLength, setAiLength] = useState('medium');
  const [useCodeBlocks, setUseCodeBlocks] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

  const handleOpenAIGenerator = () => {
    setIsAIGeneratorOpen(true);
    setAIPrompt('');
    setAiError('');
    setAiLength('medium');
    setUseCodeBlocks(false);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    setAiError('');
    try {
      const response = await api.generateBlogAI({
        prompt: aiPrompt,
        length: aiLength,
        useCodeBlocks
      });
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          title: response.data.title || prev.title,
          content: response.data.content || prev.content,
        }));
        if (response.data.keywords && Array.isArray(response.data.keywords)) {
          setTags(response.data.keywords);
        }
        setIsAIGeneratorOpen(false);
        setAIPrompt('');
        setIsEditing(true);
      } else {
        setAiError('Geçersiz yanıt alındı.');
      }
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'Yapay zeka ile üretilirken hata oluştu.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddNew = () => {
    setCurrentBlog(null);
    setFormData({ title: '', content: '', image: '', author: '' });
    setTags([]);
    setTagInput('');
    setIsEditing(true);
  };

  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      image: blog.image,
      author: blog.author,
    });
    setTags(blog.keywords ? blog.keywords.split(',').map(k => k.trim()).filter(Boolean) : []);
    setTagInput('');
    setIsEditing(true);
  };

  const handleDelete = async (slug) => {
    if (window.confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      const updatedBlogs = localBlogs.filter(b => b.slug !== slug);
      await updateCMS({ ...cms, blogs: updatedBlogs });
      setIsOrderDirty(false);
    }
  };

  const handleDragStart = (e, i) => {
    setDragIndex(i);
  };

  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const newBlogs = [...localBlogs];
    const item = newBlogs[dragIndex];
    newBlogs.splice(dragIndex, 1);
    newBlogs.splice(i, 0, item);
    setLocalBlogs(newBlogs);
    setDragIndex(i);
    setIsOrderDirty(true);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    await updateCMS({ ...cms, blogs: localBlogs });
    setIsOrderDirty(false);
    setIsSaving(false);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const slug = currentBlog ? currentBlog.slug : createSlug(formData.title);

    const newBlog = {
      slug,
      title: formData.title,
      content: formData.content,
      image: formData.image,
      author: formData.author,
      keywords: tags.join(', '),
      date: currentBlog ? currentBlog.date : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    let updatedBlogs;
    if (currentBlog) {
      updatedBlogs = localBlogs.map(b => b.slug === slug ? newBlog : b);
    } else {
      updatedBlogs = [newBlog, ...localBlogs];
    }

    await updateCMS({ ...cms, blogs: updatedBlogs });
    setIsEditing(false);
    setCurrentBlog(null);
  };

  if (isEditing) {
    return (
      <div className={styles.adminSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{currentBlog ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}</h2>
          <button className={styles.iconBtn} onClick={() => setIsEditing(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.formGroup}>
          <div className={styles.inputGroup}>
            <label>Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Örn: Yapay Zeka Hayatımızda Neleri Değiştirdi"
            />
          </div>

          <ImageUploader
            value={formData.image}
            onChange={url => setFormData({ ...formData, image: url })}
            label="Kapak Görseli"
          />

          <div className={styles.inputGroup}>
            <label>Yazar</label>
            <input
              type="text"
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              placeholder="Yazar Adı"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Keywords (SEO) - Eklemek için Enter'a basın</label>
            <div className={styles.tagsInputContainer}>
              <div className={styles.tagsList}>
                {tags.map((tag, i) => (
                  <span key={i} className={styles.tagBadge}>
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}><X size={14} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? "yapay zeka, teknoloji..." : ""}
                  className={styles.tagInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>İçerik (HTML veya düz metin kullanabilirsiniz)</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              required
              placeholder="Blog içeriğini buraya yazın..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelBtn}>İptal</button>
            <button type="submit" className={styles.saveBtn}><Save size={16} /> Kaydet</button>
          </div>
        </form>
      </div>
    );
  }

  if (isAIGeneratorOpen) {
    return (
      <div className={styles.adminSection}>
        <div className={styles.aiGenHeader}>
          <div className={styles.aiGenTitle}>
            <div className={styles.aiGenIconWrap}><Bot size={24} /></div>
            <h2>AI Blog Jeneratör</h2>
          </div>
          <button className={styles.iconBtn} onClick={() => setIsAIGeneratorOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.aiGenContainer}>
          <div className={styles.aiGenInputWrapper}>
            <label>Konu & Odak</label>
            <textarea
              value={aiPrompt}
              onChange={e => setAIPrompt(e.target.value)}
              placeholder="Makalenin konusunu, anahtar kelimelerini veya vurgulamak istediğiniz vizyonu yazın..."
              className={styles.aiGenTextarea}
              disabled={isGeneratingAI}
            />
          </div>

          <div className={styles.aiGenOptions}>
            <div className={styles.aiGenOptionGroup}>
              <label>Uzunluk Seçimi</label>
              <div className={styles.aiGenLengthCards}>
                <div
                  className={`${styles.aiGenCard} ${aiLength === 'short' ? styles.active : ''}`}
                  onClick={() => !isGeneratingAI && setAiLength('short')}
                >
                  <h4>Kısa</h4>
                  <p>300-400 kelime</p>
                </div>
                <div
                  className={`${styles.aiGenCard} ${aiLength === 'medium' ? styles.active : ''}`}
                  onClick={() => !isGeneratingAI && setAiLength('medium')}
                >
                  <h4>Orta</h4>
                  <p>600-800 kelime</p>
                </div>
                <div
                  className={`${styles.aiGenCard} ${aiLength === 'long' ? styles.active : ''}`}
                  onClick={() => !isGeneratingAI && setAiLength('long')}
                >
                  <h4>Uzun</h4>
                  <p>1000-1500 kelime</p>
                </div>
              </div>
            </div>

            <div className={styles.aiGenOptionGroup}>
              <label>Ekstra Formatlama</label>
              <div className={styles.modernToggleWrapper} onClick={() => !isGeneratingAI && setUseCodeBlocks(!useCodeBlocks)}>
                <div className={`${styles.modernToggle} ${useCodeBlocks ? styles.toggled : ''}`}>
                  <div className={styles.toggleKnob}></div>
                </div>
                <span>Önemli yerlerde &lt;pre&gt;&lt;code&gt; bloğu kullan</span>
              </div>
            </div>
          </div>

          {aiError && <div className={styles.aiGenError}><AlertCircle size={16} /> {aiError}</div>}

          <div className={styles.aiGenFooter}>
            <button
              className={`${styles.aiGenSubmitBtn} ${isGeneratingAI ? styles.loading : ''}`}
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !aiPrompt.trim()}
            >
              {isGeneratingAI ? (
                <><Loader size={20} className={styles.spin} /> Oluşturuluyor, lütfen bekleyin...</>
              ) : (
                <><Bot size={20} /> ✨ Oluşturmaya Başla</>
              )}
            </button>
            <p className={styles.aiGenHint}>İşlem tamamlandığında otomatik olarak blog düzenleyiciye aktarılacaksınız.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Blog Yazıları</h2>
        <div className={styles.headerActions}>
          <button className={styles.aiBtn} onClick={handleOpenAIGenerator}>
            <Bot size={16} /> ✨ Yapay Zeka İle Üret
          </button>
          <button className={styles.addBtn} onClick={handleAddNew}>
            <Plus size={16} /> Yeni Yazı
          </button>
        </div>
      </div>

      {isOrderDirty && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>
            <AlertCircle size={16} /> Sıralama değiştirildi, kaydetmeyi unutmayın
          </span>
          <button className={styles.saveBarBtn} onClick={handleSaveOrder} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : <><Check size={16} /> Sıralamayı Kaydet</>}
          </button>
        </div>
      )}

      <div className={styles.gridList}>
        {localBlogs.length === 0 ? (
          <p className={styles.emptyState}>Henüz hiç blog yazısı eklenmemiş.</p>
        ) : (
          localBlogs.map((blog, index) => (
            <div
              key={blog.slug}
              className={`${styles.gridItem} ${dragIndex === index ? styles.dragging : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.dragHandle} title="Sıralamak için sürükleyin">
                <GripVertical size={18} />
              </div>
              {index < 3 && <div className={styles.primaryTag}>Ana Sayfa</div>}
              {blog.image && <div className={styles.itemImage} style={{ backgroundImage: `url(${blog.image})` }}></div>}
              <div className={styles.itemContent}>
                <h3>{blog.title}</h3>
                <p className={styles.itemSub}>{blog.author} • {blog.date}</p>
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(blog)} title="Düzenle"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(blog.slug)} className={styles.dangerText} title="Sil"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
