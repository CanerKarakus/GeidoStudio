import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Phone, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-hooks-i18next';
import styles from './Contact.module.scss';
import Button from '../../components/Button/Button';
import useCmsStore from '../../store/cmsStore';
import SEO from '../../components/SEO/SEO';

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const dropdownRef = useRef(null);

  const cms = useCmsStore(state => state.cms);
  const addMessage = useCmsStore(state => state.addMessage);

  const services = [
    { value: 'web', label: t('about.dev_2') },
    { value: 'mobile', label: t('home.service_3_title') },
    { value: 'graphic', label: t('home.service_1_title') },
    { value: 'social', label: t('home.service_4_title') },
    { value: 'other', label: t('projects.filter_all') === 'All' ? 'Other' : 'Diğer' }
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      service: '',
      phone: '+90 '
    }
  });

  const selectedServiceValue = watch("service");
  const selectedServiceLabel = services.find(s => s.value === selectedServiceValue)?.label || "Seçiniz...";

  useEffect(() => {
    // Register the custom field manually if needed, but we used defaultValues and setValue
    register("service", { required: "Lütfen bir hizmet seçiniz" });

    // Handle anchor link scrolling on mount
    if (window.location.hash === '#contact-form') {
      setTimeout(() => {
        const el = document.getElementById('contact-form');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
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
      alert(err.message || "Mesaj gönderilirken bir hata oluştu.");
    }
  };

  const handlePhoneChange = (e) => {
    const input = e.target;
    let value = input.value;

    // Ensure prefix +90 is always there and has a space
    if (!value.startsWith('+90')) {
      value = '+90 ' + value.replace(/^\+90\s*/, '');
    } else if (value.length === 3) {
      value = '+90 ';
    }

    // Extract digits only after +90
    let digits = value.slice(3).replace(/\D/g, '');

    // Detect if backspace was pressed on a formatting character
    const isDeleting = e.nativeEvent.inputType === 'deleteContentBackward';
    if (isDeleting) {
      const oldDigits = input.getAttribute('data-digits') || '';
      if (digits === oldDigits && digits.length > 0) {
        digits = digits.slice(0, -1);
      }
    }

    // Limit to 10 digits
    let processed = digits.slice(0, 10);

    // If user starts typing, enforce '5' as first digit, 
    // but only if there is actually a digit.
    if (processed.length > 0 && processed[0] !== '5') {
      processed = '5' + processed.slice(1);
    }

    input.setAttribute('data-digits', processed);

    let formatted = '+90 ';
    if (processed.length > 0) {
      formatted += '(' + processed.slice(0, 3);
      if (processed.length >= 3) {
        formatted += ') ';
        if (processed.length > 3) {
          formatted += processed.slice(3, 6);
          if (processed.length >= 6) {
            formatted += ' ';
            if (processed.length > 6) {
              formatted += processed.slice(6, 10);
            }
          }
        }
      }
    }

    setValue('phone', formatted);
  };

  return (
    <div className={styles.contactPage}>
      <SEO 
        title={t('contact.seo_title')} 
        description={t('contact.seo_desc')}
        keywords="iletişim, geido studio iletişim, web tasarım teklif al, grafik tasarım fiyatları"
      />

      {/* Huge Header */}
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.headerContent}
          >
            <span className={styles.subtitle}>{t('contact.subtitle')}</span>
            <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t('contact.title') }}></h1>
            <p className={styles.description}>
              {t('contact.seo_desc')}
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
            <h3>{t('contact.email_us')}</h3>
            <p>Bize dilediğiniz zaman yazın.</p>
            <a href={`mailto:${cms?.contactEmail || 'info@geidostudio.com'}`}>{cms?.contactEmail || 'info@geidostudio.com'}</a>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconBox}><Phone /></div>
            <h3>{t('contact.call_us')}</h3>
            <p>Bizi hemen arayın.</p>
            <a href={`tel:${cms?.contactPhone || '+90 (555) 123 45 67'}`}>{cms?.contactPhone || '+90 (555) 123 45 67'}</a>
          </div>
        </m.div>

        {/* Minimalist Form */}
        <m.div
          id="contact-form"
          className={styles.formContainer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.formHeader}>
            <h2>{t('contact.form_title')}</h2>
            <p>{t('contact.email_us')}</p>
          </div>

          {isSubmitted && (
            <div className={styles.successMessage}>
              {t('contact.success')}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName">{t('contact.form_name')}</label>
                <input
                  id="fullName"
                  placeholder="John Doe"
                  className={errors.fullName ? styles.errorInput : ''}
                  {...register("fullName", { required: true })}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">{t('contact.form_email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className={errors.email ? styles.errorInput : ''}
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                  })}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">{t('contact.call_us')}</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+90 (5XX) XXX XXXX"
                  {...register("phone")}
                  onChange={handlePhoneChange}
                />
              </div>

              <div className={styles.formGroup} ref={dropdownRef}>
                <label>{t('contact.form_subject')}</label>
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
              <label htmlFor="message">{t('contact.form_message')}</label>
              <textarea
                id="message"
                rows="4"
                placeholder="..."
                className={errors.message ? styles.errorInput : ''}
                {...register("message", { required: true })}
              ></textarea>
            </div>

            <div className={styles.submitArea}>
              <Button
                type="submit"
                variant="primary"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('contact.sending') : t('contact.send_button')}
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
