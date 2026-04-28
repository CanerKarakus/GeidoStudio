import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Instagram, Linkedin, Github, ChevronDown } from 'lucide-react';
import styles from './Contact.module.scss';
import Button from '../../components/Button/Button';

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    setIsSubmitted(true);
    reset({ service: '' });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        
        <div className={styles.contentGrid}>
          {/* Info Section */}
          <m.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.infoSection}
          >
            <span className={styles.subtitle}>İletişim</span>
            <h1 className={styles.title}>Birlikte Harika İşler<br/>Başaralım.</h1>
            
            <div className={styles.contactDetails}>
              <div className={styles.detailItem}>
                <div className={styles.iconBox}><Mail /></div>
                <div>
                  <span className={styles.label}>E-posta</span>
                  <a href="mailto:iletisim@geidostudio.com">iletisim@geidostudio.com</a>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <div className={styles.iconBox}><MapPin /></div>
                <div>
                  <span className={styles.label}>Konum</span>
                  <p>İstanbul, Türkiye</p>
                </div>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <p>Bizi Takip Edin</p>
              <div className={styles.socialIcons}>
                <a href="#" aria-label="Instagram"><Instagram /></a>
                <a href="#" aria-label="LinkedIn"><Linkedin /></a>
                <a href="#" aria-label="Behance"><span className={styles.behanceIcon}>Bē</span></a>
                <a href="#" aria-label="GitHub"><Github /></a>
              </div>
            </div>
          </m.div>

          {/* Form Section */}
          <m.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.formSection}
          >
            <div className={styles.formWrapper}>
              <h2>Bize Ulaşın</h2>
              
              {isSubmitted && (
                <div className={styles.successMessage}>
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Ad Soyad *</label>
                  <input 
                    id="fullName"
                    className={errors.fullName ? styles.errorInput : ''}
                    {...register("fullName", { required: "Ad Soyad alanı zorunludur" })} 
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName.message}</span>}
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">E-posta *</label>
                    <input 
                      id="email"
                      type="email"
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

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Telefon (Opsiyonel)</label>
                    <input 
                      id="phone"
                      type="tel"
                      {...register("phone")} 
                    />
                  </div>
                </div>

                <div className={styles.formGroup} ref={dropdownRef}>
                  <label>Hizmet Türü *</label>
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

                <div className={styles.formGroup}>
                  <label htmlFor="message">Mesajınız *</label>
                  <textarea 
                    id="message"
                    rows="5"
                    className={errors.message ? styles.errorInput : ''}
                    {...register("message", { required: "Mesaj alanı zorunludur" })}
                  ></textarea>
                  {errors.message && <span className={styles.errorText}>{errors.message.message}</span>}
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </Button>

              </form>
            </div>
          </m.div>

        </div>
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
