import React from 'react';
import { useTranslation } from 'react-i18next';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { Cookie, Settings } from 'lucide-react';

const CookiePolicy = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toc = isEn ? [
    { id: 'what-is-cookie', title: '1. What is a Cookie?', level: 2 },
    { id: 'why-use', title: '2. Why Do We Use Cookies?', level: 2 },
    { id: 'types', title: '3. Types of Cookies We Use', level: 2 },
    { id: 'management', title: '4. How Can You Manage Cookies?', level: 2 },
    { id: 'changes', title: '5. Policy Changes', level: 2 },
  ] : [
    { id: 'cerez-nedir', title: '1. Çerez (Cookie) Nedir?', level: 2 },
    { id: 'kullanim-amaclari', title: '2. Çerezleri Neden Kullanıyoruz?', level: 2 },
    { id: 'cerez-turleri', title: '3. Kullandığımız Çerez Türleri', level: 2 },
    { id: 'cerez-yonetimi', title: '4. Çerezleri Nasıl Yönetebilirsiniz?', level: 2 },
    { id: 'degisiklikler', title: '5. Politikadaki Değişiklikler', level: 2 },
  ];

  return (
    <DocsLayout 
      title={isEn ? "Cookie Policy" : "Çerez Politikası"} 
      breadcrumb={isEn ? "Cookie Policy" : "Çerez Politikası"}
      toc={toc}
    >
      {isEn ? (
        <>
          <p>
            This Cookie Policy explains how we, as <strong>Geido Studio</strong>, use cookies and similar tracking technologies when you visit our website geidostudio.com.
          </p>

          <div className="callout">
            <Cookie className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Cookie Consent</h4>
              <p>
                By continuing to use our website, you agree to the use of mandatory cookies as stated in this policy. For other types of cookies, you can give consent via the cookie banner at the bottom of the site.
              </p>
            </div>
          </div>

          <h2 id="what-is-cookie">1. What is a Cookie?</h2>
          <p>
            Cookies are small text files saved on your computer or mobile device via your browser when you visit a website. These files allow the website to remember your device and offer you a better user experience.
          </p>

          <h2 id="why-use">2. Why Do We Use Cookies?</h2>
          <p>We use cookies on our website for the following main purposes:</p>
          <ul>
            <li>To ensure our website functions smoothly and securely.</li>
            <li>To improve its performance by analyzing how our site is used.</li>
            <li>To personalize your user experience and remember your preferences.</li>
            <li>To provide you with more relevant content and ads.</li>
          </ul>

          <h2 id="types">3. Types of Cookies We Use</h2>
          <p>You can find the different types of cookies we use on our website below:</p>
          
          <h3>Mandatory Cookies (Strictly Necessary)</h3>
          <p>Strictly necessary for our site to perform its basic functions. Without these cookies, some parts of the site may not work properly. They are used for security and network management purposes.</p>
          
          <h3>Analytical Cookies</h3>
          <p>Help us understand how visitors interact with our website. It anonymously collects data such as which pages are visited most, how much time is spent on the site (e.g., Google Analytics).</p>
          
          <h3>Functional Cookies</h3>
          <p>Used to remember your preferences (e.g., language selection or region) when you return to our site. This allows us to provide a more personalized experience.</p>

          <h3>Targeting and Advertising Cookies</h3>
          <p>These are cookies placed by our third-party business partners to show ads relevant to your interests and measure the effectiveness of our advertising campaigns.</p>

          <h2 id="management">4. How Can You Manage Cookies?</h2>
          <p>
            You have the right to reject, delete or block cookies by changing your browser settings. However, remember that if you disable all cookies, some features of our website may not work as expected.
          </p>

          <div className="callout">
            <Settings className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Browser Settings</h4>
              <p>
                To manage your cookie settings, you can use the "Cookies and Site Data" tab by going to the "Settings" or "Privacy" sections of your browser. You can find specific instructions for browsers like Google Chrome, Safari, Firefox, and Edge on their own help pages.
              </p>
            </div>
          </div>

          <h2 id="changes">5. Policy Changes</h2>
          <p>
            As Geido Studio, we reserve the right to make changes to our Cookie Policy in line with legal regulations or technological developments. Whenever there is a change, we will publish the current text on this page.
          </p>

          <p><em>Last Update: May 14, 2024</em></p>
        </>
      ) : (
        <>
          <p>
            Bu Çerez Politikası, <strong>Geido Studio</strong> olarak geidostudio.com web sitemizi 
            ziyaret ettiğinizde çerezleri ve benzer takip teknolojilerini nasıl kullandığımızı açıklar.
          </p>

          <div className="callout">
            <Cookie className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Çerez Onayı</h4>
              <p>
                Web sitemizi kullanmaya devam ederek, bu politikada belirtilen şekilde zorunlu çerezlerin 
                kullanımını kabul etmiş olursunuz. Diğer çerez türleri için sitenin alt kısmındaki 
                uyarı paneli (cookie banner) üzerinden onay verebilirsiniz.
              </p>
            </div>
          </div>

          <h2 id="cerez-nedir">1. Çerez (Cookie) Nedir?</h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza 
            veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin 
            cihazınızı hatırlamasını ve size daha iyi bir kullanıcı deneyimi sunmasını sağlar.
          </p>

          <h2 id="kullanim-amaclari">2. Çerezleri Neden Kullanıyoruz?</h2>
          <p>Web sitemizde çerezleri şu temel amaçlar doğrultusunda kullanıyoruz:</p>
          <ul>
            <li>Web sitemizin sorunsuz ve güvenli bir şekilde çalışmasını sağlamak.</li>
            <li>Sitemizin nasıl kullanıldığını analiz ederek performansını artırmak.</li>
            <li>Kullanıcı deneyiminizi kişiselleştirmek ve tercihlerinizi hatırlamak.</li>
            <li>Size daha uygun içerik ve reklamlar sunabilmek.</li>
          </ul>

          <h2 id="cerez-turleri">3. Kullandığımız Çerez Türleri</h2>
          <p>Aşağıda web sitemizde kullandığımız farklı çerez türlerini bulabilirsiniz:</p>
          
          <h3>Zorunlu Çerezler (Gerekli Çerezler)</h3>
          <p>Sitemizin temel işlevlerini yerine getirmesi için kesinlikle gereklidir. Bu çerezler olmadan sitenin bazı bölümleri düzgün çalışmayabilir. Güvenlik ve ağ yönetimi amaçlarıyla kullanılırlar.</p>
          
          <h3>Analitik Çerezler</h3>
          <p>Ziyaretçilerin web sitemizle nasıl etkileşime girdiğini anlamamıza yardımcı olur. Hangi sayfaların en çok ziyaret edildiği, sitede ne kadar süre kalındığı gibi verileri anonim olarak toplar (Örn: Google Analytics).</p>
          
          <h3>İşlevsel Çerezler</h3>
          <p>Sitemize tekrar döndüğünüzde tercihlerinizi (örneğin, dil seçimi veya bölge) hatırlamak için kullanılır. Bu, daha kişiselleştirilmiş bir deneyim sunmamızı sağlar.</p>

          <h3>Hedefleme ve Reklam Çerezleri</h3>
          <p>İlgi alanlarınıza uygun reklamlar göstermek ve reklam kampanyalarımızın etkinliğini ölçmek amacıyla üçüncü taraf iş ortaklarımız tarafından yerleştirilen çerezlerdir.</p>

          <h2 id="cerez-yonetimi">4. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>
            Tarayıcınızın ayarlarını değiştirerek çerezleri reddetme, silme veya engelleme hakkına sahipsiniz. 
            Ancak unutmayın ki, tüm çerezleri devre dışı bırakmanız halinde web sitemizin bazı özellikleri 
            beklendiği gibi çalışmayabilir.
          </p>

          <div className="callout">
            <Settings className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Tarayıcı Ayarları</h4>
              <p>
                Çerez ayarlarınızı yönetmek için tarayıcınızın "Ayarlar" veya "Gizlilik" bölümlerine 
                giderek "Çerezler ve Site Verileri" sekmesini kullanabilirsiniz. Google Chrome, Safari, 
                Firefox ve Edge gibi tarayıcılar için özel yönlendirmeleri kendi yardım sayfalarında bulabilirsiniz.
              </p>
            </div>
          </div>

          <h2 id="degisiklikler">5. Politikadaki Değişiklikler</h2>
          <p>
            Geido Studio olarak, yasal düzenlemeler veya teknolojik gelişmeler doğrultusunda Çerez 
            Politikamızda değişiklik yapma hakkını saklı tutarız. Herhangi bir değişiklik olduğunda 
            bu sayfa üzerinden güncel metni yayınlayacağız.
          </p>

          <p><em>Son Güncelleme: 14 Mayıs 2024</em></p>
        </>
      )}
    </DocsLayout>
  );
};

export default CookiePolicy;
