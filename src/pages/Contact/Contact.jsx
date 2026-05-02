import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Phone, ChevronDown } from 'lucide-react';
import styles from './Contact.module.scss';
import Button from '../../components/Button/Button';
import useCmsStore from '../../store/cmsStore';

const services = [
  { value: 'web', label: 'Web Tasarım & Geliştirme' },
  { value: 'mobile', label: 'Mobil Uygulama' },
  { value: 'graphic', label: 'Grafik & Kurumsal Kimlik' },
  { value: 'social', label: 'Sosyal Medya Yönetimi' },
  { value: 'other', label: 'Diğer' }
];

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const cms = useCmsStore(state => state.cms);
  const addMessage = useCmsStore(state => state.addMessage);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      service: ''
    }
  });

  const selectedServiceValue = watch("service");
  const selectedServiceLabel = services.find(s => s.value === selectedServiceValue)?.label || "Seçiniz...";

  useEffect(() => {
    // Register the custom field manually if needed, but we used defaultValues and setValue
    register("service", { required: "Lütfen bir hizmet seçiniz" });
  }, [register]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = async (data) => {
    try {
      await addMessage({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        subject: selectedServiceLabel,
        message: data.message
      });
      setIsSubmitted(true);
      reset({ service: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      alert("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  return (
    <div className={styles.contactPage}>
      
      {/* Huge Header */}
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.headerContent}
          >
            <span className={styles.subtitle}>İletişim</span>
            <h1 className={styles.title}>Birlikte mükemmel<br/>işler yaratalım.</h1>
            <p className={styles.description}>
              Yeni bir projeniz mi var? Ekibimiz, vizyonunuzu hayata geçirmek için hazır. Bize hemen ulaşın.
            </p>
          </m.div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Contact Cards Row */}
        <m.div 
          className={styles.cardsRow}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.contactCard}>
            <div className={styles.iconBox}><Mail /></div>
            <h3>E-posta</h3>
            <p>Bize dilediğiniz zaman yazın.</p>
            <a href={`mailto:${cms?.contactEmail || 'iletisim@geidostudio.com'}`}>{cms?.contactEmail || 'iletisim@geidostudio.com'}</a>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.iconBox}><MapPin /></div>
            <h3>Ofisimiz</h3>
            <p>Ziyaretinizden memnuniyet duyarız.</p>
            <address>{cms?.contactAddress || 'Kolektif House, Levent\nİstanbul, Türkiye'}</address>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.iconBox}><Phone /></div>
            <h3>Telefon</h3>
            <p>Bizi hemen arayın.</p>
            <a href={`tel:${cms?.contactPhone || '+90 (555) 123 45 67'}`}>{cms?.contactPhone || '+90 (555) 123 45 67'}</a>
          </div>
        </m.div>

        {/* Minimalist Form */}
        <m.div 
          className={styles.formContainer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.formHeader}>
            <h2>Mesaj Gönderin</h2>
            <p>Aşağıdaki formu doldurun, en kısa sürede size dönüş yapalım.</p>
          </div>
          
          {isSubmitted && (
            <div className={styles.successMessage}>
              Mesajınız başarıyla gönderildi. Teşekkür ederiz!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName">Ad Soyad</label>
                <input 
                  id="fullName"
                  placeholder="John Doe"
                  className={errors.fullName ? styles.errorInput : ''}
                  {...register("fullName", { required: "Ad Soyad alanı zorunludur" })} 
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">E-posta</label>
                <input 
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className={errors.email ? styles.errorInput : ''}
                  {...register("email", { 
                    required: "E-posta alanı zorunludur",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Geçerli bir e-posta adresi giriniz"
                    }
                  })} 
                />
                {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Telefon</label>
                <input 
                  id="phone"
                  type="tel"
                  placeholder="+90 (555) 000 00 00"
                  {...register("phone")} 
                />
              </div>

              <div className={styles.formGroup} ref={dropdownRef}>
                <label>Konu</label>
                <div 
                  className={clsx(styles.customSelect, { [styles.errorInput]: errors.service, [styles.open]: isSelectOpen })}
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                  <span>{selectedServiceLabel}</span>
                  <ChevronDown size={20} className={styles.chevron} />
                </div>
                
                <AnimatePresence>
                  {isSelectOpen && (
                    <m.ul 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={styles.dropdownOptions}
                    >
                      {services.map(s => (
                        <li 
                          key={s.value} 
                          onClick={() => {
                            setValue("service", s.value, { shouldValidate: true });
                            setIsSelectOpen(false);
                          }}
                          className={selectedServiceValue === s.value ? styles.selected : ''}
                        >
                          {s.label}
                        </li>
                      ))}
                    </m.ul>
                  )}
                </AnimatePresence>
                
                {errors.service && <span className={styles.errorText}>{errors.service.message}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Projenizden Bahsedin</label>
              <textarea 
                id="message"
                rows="4"
                placeholder="Nasıl yardımcı olabiliriz?"
                className={errors.message ? styles.errorInput : ''}
                {...register("message", { required: "Mesaj alanı zorunludur" })}
              ></textarea>
              {errors.message && <span className={styles.errorText}>{errors.message.message}</span>}
            </div>

            <div className={styles.submitArea}>
              <Button 
                type="submit" 
                variant="primary" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </Button>
            </div>

          </form>
        </m.div>

      </div>
    </div>
  );
};

export default Contact;

function clsx(...args) {
  return args.filter(Boolean).map(arg => {
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'object') return Object.keys(arg).filter(key => arg[key]).join(' ');
    return '';
  }).join(' ');
}
