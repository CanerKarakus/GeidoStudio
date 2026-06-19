import React, { useState } from 'react';
import useCmsStore from '../../store/cmsStore';
import styles from './AdminBlog.module.scss'; // Reusing Blog styles for consistency
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader/ImageUploader';

const createSlug = (title) => {
  return title.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-') + '-project';
};

const AdminProjects = () => {
  const { cms, updateCMS } = useCmsStore();
  const projects = cms?.projects || [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: '',
    externalLink: '',
  });

  const categories = ['Grafik', 'Mobil', 'Web', 'Sosyal Medya', 'Kurumsal Kimlik', 'Web Yazılım'];

  const handleAddNew = () => {
    setCurrentProject(null);
    setFormData({ title: '', description: '', image: '', category: 'Web', externalLink: '' });
    setIsEditing(true);
  };

  const handleEdit = (project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image,
      category: project.category || 'Web',
      externalLink: project.externalLink || '',
    });
    setIsEditing(true);
  };

  const handleDelete = async (slug) => {
    if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
      const updatedProjects = projects.filter(p => p.slug !== slug && p.id !== slug);
      await updateCMS({ ...cms, projects: updatedProjects });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    // Fallback to id if slug doesn't exist (for older hardcoded data compatibility if they had id)
    const slug = currentProject ? (currentProject.slug || currentProject.id) : createSlug(formData.title);
    
    const newProject = {
      slug,
      id: slug, // Keep both for compatibility
      title: formData.title,
      description: formData.description,
      image: formData.image,
      category: formData.category,
      externalLink: formData.externalLink,
      date: currentProject && currentProject.date ? currentProject.date : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    let updatedProjects;
    if (currentProject) {
      updatedProjects = projects.map(p => (p.slug === slug || p.id === slug) ? newProject : p);
    } else {
      updatedProjects = [newProject, ...projects];
    }

    await updateCMS({ ...cms, projects: updatedProjects });
    setIsEditing(false);
    setCurrentProject(null);
  };

  if (isEditing) {
    return (
      <div className={styles.adminSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{currentProject ? 'Projeyi Düzenle' : 'Yeni Proje'}</h2>
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
              placeholder="Örn: Aura Kozmetik"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Proje Bağlantısı (İsteğe Bağlı)</label>
            <input 
              type="url" 
              value={formData.externalLink} 
              onChange={e => setFormData({ ...formData, externalLink: e.target.value })} 
              placeholder="Örn: https://vanta.geidostudio.com"
            />
          </div>
          
          <ImageUploader 
            value={formData.image} 
            onChange={url => setFormData({ ...formData, image: url })} 
            label="Proje Görseli" 
          />
          
          <div className={styles.inputGroup}>
            <label>Kategori</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className={styles.selectInput}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)', color: '#fff' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: '#111', color: '#fff' }}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Kısa Açıklama</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              rows={5}
              required
              placeholder="Proje açıklamasını buraya yazın..."
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
        <h2 className={styles.sectionTitle}>Projeler</h2>
        <button className={styles.addBtn} onClick={handleAddNew}>
          <Plus size={16} /> Yeni Proje
        </button>
      </div>
      
      <div className={styles.gridList}>
        {projects.length === 0 ? (
          <p className={styles.emptyState}>Henüz hiç proje eklenmemiş.</p>
        ) : (
          projects.map(project => (
            <div key={project.slug || project.id} className={styles.gridItem}>
              {project.image && <div className={styles.itemImage} style={{ backgroundImage: `url(${project.image})` }}></div>}
              <div className={styles.itemContent}>
                <h3>{project.title}</h3>
                <p className={styles.itemSub}>{project.category}</p>
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(project)} title="Düzenle"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(project.slug || project.id)} className={styles.dangerText} title="Sil"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
