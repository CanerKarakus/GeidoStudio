import React from 'react';
import { Helmet } from 'react-helmet-async';
import useCmsStore from '../../store/cmsStore';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  themeColor,
  url = 'https://geidostudio.com' 
}) => {
  const { cms } = useCmsStore();

  const siteTitle = cms?.seoDefaults?.title || 'Geido Studio — Gelenekten İlham Alan, Geleceğe Yön Veren Tasarımlar';
  const finalTitle = title ? `${title} | Geido Studio` : siteTitle;
  
  const defaultDesc = cms?.seoDefaults?.description || "Geido Studio; modern web tasarımı, grafik tasarım, sosyal medya yönetimi ve kurumsal kimlik hizmetleri sunan yenilikçi bir kreatif ajanstır.";
  const finalDesc = description || defaultDesc;

  const defaultKeywords = cms?.seoDefaults?.keywords || "web tasarım, grafik tasarım, geidostudio, sosyal medya yönetimi, kurumsal kimlik, logo tasarımı, UI/UX tasarım, kreatif ajans";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  
  const defaultImage = cms?.seoDefaults?.image || 'https://geidostudio.com/logo_icon.png';
  const finalImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standart HTML Etiketleri */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      {themeColor && <meta name="theme-color" content={themeColor} />}

      {/* Open Graph / Facebook (Sosyal medyada paylaşınca çıkacak olanlar) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Local Business Schema (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Geido Studio",
          "image": defaultImage,
          "url": "https://geidostudio.com",
          "telephone": "+905555555555",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Merkez",
            "addressLocality": "Istanbul",
            "addressRegion": "TR",
            "postalCode": "34000",
            "addressCountry": "TR"
          },
          "sameAs": [
            "https://www.instagram.com/geido.studio",
            "https://www.linkedin.com/company/geido-studio"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
