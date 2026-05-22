import React from 'react';
import { Helmet } from 'react-helmet-async';
import useCmsStore from '../../store/cmsStore';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
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
    </Helmet>
  );
};

export default SEO;
