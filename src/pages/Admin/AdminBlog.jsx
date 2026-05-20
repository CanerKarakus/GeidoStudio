import React, { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminBlog.module.scss';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader/ImageUploader';

const createSlug = (title) => {
  return title.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-') + '-blog';
};

const AdminBlog = () => {
  const { cms, updateCMS } = useCmsStore();
  const blogs = cms?.blogs || [];
  
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
      const updatedBlogs = blogs.filter(b => b.slug !== slug);
      await updateCMS({ ...cms, blogs: updatedBlogs });
    }
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
      updatedBlogs = blogs.map(b => b.slug === slug ? newBlog : b);
    } else {
      updatedBlogs = [newBlog, ...blogs];
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

  return (
    <div className={styles.adminSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Blog Yazıları</h2>
        <button className={styles.addBtn} onClick={handleAddNew}>
          <Plus size={16} /> Yeni Yazı
        </button>
      </div>
      
      <div className={styles.gridList}>
        {blogs.length === 0 ? (
          <p className={styles.emptyState}>Henüz hiç blog yazısı eklenmemiş.</p>
        ) : (
          blogs.map(blog => (
            <div key={blog.slug} className={styles.gridItem}>
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
