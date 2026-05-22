import React from 'react';
import { useTranslation } from 'react-i18next';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { ShieldAlert, Info } from 'lucide-react';

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toc = isEn ? [
    { id: 'data-collection', title: '1. Data Collection', level: 2 },
    { id: 'cookies', title: '2. Cookies and Tracking', level: 2 },
    { id: 'data-usage', title: '3. Data Usage', level: 2 },
    { id: 'data-sharing', title: '4. Data Sharing and Third Parties', level: 2 },
    { id: 'data-security', title: '5. Data Security', level: 2 },
    { id: 'user-rights', title: '6. User Rights', level: 2 },
    { id: 'changes', title: '7. Policy Changes', level: 2 },
    { id: 'contact', title: '8. Contact Us', level: 2 },
  ] : [
    { id: 'veri-toplama', title: '1. Toplanan Veriler', level: 2 },
    { id: 'cerezler', title: '2. Çerezler ve Takip', level: 2 },
    { id: 'veri-kullanimi', title: '3. Verilerin Kullanımı', level: 2 },
    { id: 'veri-paylasimi', title: '4. Veri Paylaşımı ve Üçüncü Taraflar', level: 2 },
    { id: 'veri-guvenligi', title: '5. Veri Güvenliği', level: 2 },
    { id: 'kullanici-haklari', title: '6. Kullanıcı Hakları', level: 2 },
    { id: 'degisiklikler', title: '7. Politikadaki Değişiklikler', level: 2 },
    { id: 'iletisim', title: '8. İletişim', level: 2 },
  ];

  return (
    <DocsLayout 
      title={isEn ? "Privacy Policy" : "Gizlilik Politikası"}
      breadcrumb={isEn ? "Privacy Policy" : "Gizlilik Politikası"}
      toc={toc}
    >
      {isEn ? (
        <>
          <p>
            As <strong>Geido Studio</strong>, we attach great importance to your privacy. This Privacy Policy explains how your personal data is collected, used, and protected when you use the geidostudio.com website operated by Geido Studio ("we", "us" or "our").
          </p>

          <div className="callout">
            <Info className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>KVKK and GDPR Compliance</h4>
              <p>
                Our data processing processes are designed in accordance with the Personal Data Protection Law (KVKK) No. 6698 and the European Union General Data Protection Regulation (GDPR).
              </p>
            </div>
          </div>

          <h2 id="data-collection">1. Data Collection</h2>
          <p>We collect two types of information when you use our services: Information you directly provide to us and information collected automatically.</p>
          
          <h3 id="direct-info">Information You Directly Provide</h3>
          <ul>
            <li><strong>Contact Information:</strong> Name, email address, phone number, and company information you provide via the contact form or when subscribing to our newsletter.</li>
            <li><strong>Project Details:</strong> Project-specific details, brief files, and messages you share with us in line with your service requests.</li>
          </ul>

          <h3 id="auto-info">Information Collected Automatically</h3>
          <ul>
            <li><strong>Device and Usage Data:</strong> Your IP address, browser type, operating system, referring pages, pages you visit on our site, and your visit durations.</li>
            <li><strong>Location Data:</strong> General geographic location information derived from your IP address.</li>
          </ul>

          <h2 id="cookies">2. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to improve your experience on our website, analyze traffic, and carry out marketing activities.</p>
          <p>For more information, please review our <strong>Cookie Policy</strong>.</p>

          <h2 id="data-usage">3. Data Usage</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To provide, operate, and maintain our services.</li>
            <li>To improve our website and user experience.</li>
            <li>To provide customer service and respond to your inquiries.</li>
            <li>To send you emails about news and offers when you consent to newsletter subscription.</li>
            <li>To detect and prevent illegal activities such as fraud and unauthorized access.</li>
          </ul>

          <h2 id="data-sharing">4. Data Sharing and Third Parties</h2>
          <p>We never sell your personal data to third parties. However, we may share it in the following cases:</p>
          <ul>
            <li><strong>Service Providers:</strong> With reliable business partners providing services such as web hosting, data analysis (Google Analytics), and email marketing infrastructure (e.g., Netlify, Vercel).</li>
            <li><strong>Legal Obligations:</strong> In cases required by law or in response to court orders and official requests to protect our legal rights.</li>
            <li><strong>Business Transfers:</strong> In case of a company merger, sale, or transfer of assets.</li>
          </ul>

          <div className="callout">
            <ShieldAlert className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Third Party Links</h4>
              <p>
                Our site may contain links to external sites beyond our control. Geido Studio is not responsible for the privacy practices of these sites. We recommend reading the privacy policies of any external sites you click on.
              </p>
            </div>
          </div>

          <h2 id="data-security">5. Data Security</h2>
          <p>
            We use industry-standard encryption (SSL/TLS), firewalls, and secure server infrastructures to ensure the security of your personal data. However, we cannot guarantee that any data transmission or electronic storage over the internet is 100% secure.
          </p>

          <h2 id="user-rights">6. User Rights (KVKK & GDPR)</h2>
          <p>You have the following rights under applicable data protection laws:</p>
          <ul>
            <li>To learn whether your personal data is processed.</li>
            <li>To request information if it has been processed.</li>
            <li>To request correction, updating, or deletion of your data (Right to be Forgotten).</li>
            <li>To opt-out of marketing emails or newsletter subscriptions at any time.</li>
          </ul>
          <p>You can contact us to exercise these rights.</p>

          <h2 id="changes">7. Policy Changes</h2>
          <p>
            We may update this Privacy Policy from time to time. If significant changes are made, we will publish the updated policy on this page and change the "Last Update" date.
          </p>
          <p><em>Last Update: May 14, 2024</em></p>

          <h2 id="contact">8. Contact Us</h2>
          <p>If you have any questions regarding our privacy policy or your personal data, feel free to contact us:</p>
          <ul>
            <li><strong>Email:</strong> hello@geidostudio.com</li>
            <li><strong>Address:</strong> Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul, Turkey</li>
            <li><strong>Phone:</strong> +90 (553) 003 7403</li>
          </ul>
        </>
      ) : (
        <>
          <p>
            <strong>Geido Studio</strong> olarak gizliliğinize büyük önem veriyoruz. Bu Gizlilik Politikası, 
            Geido Studio ("biz", "bize" veya "bizim") tarafından işletilen geidostudio.com web sitesini 
            kullandığınızda kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
          </p>

          <div className="callout">
            <Info className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>KVKK Uyumluluğu</h4>
              <p>
                Veri işleme süreçlerimiz 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) ve 
                Avrupa Birliği Genel Veri Koruma Yönetmeliği'ne (GDPR) uygun olarak tasarlanmıştır.
              </p>
            </div>
          </div>

          <h2 id="veri-toplama">1. Toplanan Veriler</h2>
          <p>Hizmetlerimizi kullandığınızda iki tür bilgi topluyoruz: Bize doğrudan sağladığınız bilgiler ve otomatik olarak toplanan bilgiler.</p>
          
          <h3 id="dogrudan-sallanan">Bize Doğrudan Sağladığınız Bilgiler</h3>
          <ul>
            <li><strong>İletişim Bilgileri:</strong> İletişim formu aracılığıyla veya bültenimize abone olurken sağladığınız ad, e-posta adresi, telefon numarası ve şirket bilgileri.</li>
            <li><strong>Proje Detayları:</strong> Hizmet talepleriniz doğrultusunda bizimle paylaştığınız projeye özel detaylar, brief dosyaları ve mesajlar.</li>
          </ul>

          <h3 id="otomatik-toplanan">Otomatik Olarak Toplanan Bilgiler</h3>
          <ul>
            <li><strong>Cihaz ve Kullanım Verileri:</strong> IP adresiniz, tarayıcı türünüz, işletim sisteminiz, sitemize yönlendiren sayfalar, sitemizde ziyaret ettiğiniz sayfalar ve ziyaret süreleriniz.</li>
            <li><strong>Konum Verileri:</strong> IP adresinizden elde edilen genel coğrafi konum bilgisi.</li>
          </ul>

          <h2 id="cerezler">2. Çerezler ve Takip Teknolojileri</h2>
          <p>Web sitemizdeki deneyiminizi iyileştirmek, trafiği analiz etmek ve pazarlama faaliyetlerini yürütmek amacıyla çerezler (cookies) ve benzeri izleme teknolojileri kullanıyoruz.</p>
          <p>Daha fazla bilgi için lütfen <strong>Çerez Politikamızı</strong> inceleyin.</p>

          <h2 id="veri-kullanimi">3. Verilerin Kullanımı</h2>
          <p>Topladığımız bilgileri aşağıdaki amaçlar doğrultusunda kullanıyoruz:</p>
          <ul>
            <li>Hizmetlerimizi sağlamak, işletmek ve sürdürmek.</li>
            <li>Web sitemizi ve kullanıcı deneyimini iyileştirmek.</li>
            <li>Müşteri hizmetleri sağlamak ve sorularınıza yanıt vermek.</li>
            <li>Bülten aboneliği onayı verdiğiniz durumlarda size yenilikler ve teklifler hakkında e-posta göndermek.</li>
            <li>Dolandırıcılık, izinsiz erişim gibi yasadışı faaliyetleri tespit etmek ve önlemek.</li>
          </ul>

          <h2 id="veri-paylasimi">4. Veri Paylaşımı ve Üçüncü Taraflar</h2>
          <p>Kişisel verilerinizi asla üçüncü taraflara satmıyoruz. Ancak aşağıdaki durumlarda paylaşabiliriz:</p>
          <ul>
            <li><strong>Hizmet Sağlayıcılar:</strong> Web barındırma (hosting), veri analizi (Google Analytics) ve e-posta pazarlama altyapısı gibi hizmetleri sağlayan güvenilir iş ortaklarıyla (ör. Netlify, Vercel).</li>
            <li><strong>Yasal Zorunluluklar:</strong> Kanunların gerektirdiği durumlarda veya yasal haklarımızı korumak amacıyla mahkeme kararları ve resmi taleplere yanıt olarak.</li>
            <li><strong>İş Devirleri:</strong> Şirketin birleşmesi, satılması veya varlıklarının devredilmesi durumunda.</li>
          </ul>

          <div className="callout">
            <ShieldAlert className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Üçüncü Taraf Bağlantıları</h4>
              <p>
                Sitemiz, kontrolümüz dışında olan harici sitelere bağlantılar içerebilir. 
                Bu sitelerin gizlilik uygulamalarından Geido Studio sorumlu değildir. 
                Tıkladığınız harici sitelerin kendi gizlilik politikalarını okumanızı öneririz.
              </p>
            </div>
          </div>

          <h2 id="veri-guvenligi">5. Veri Güvenliği</h2>
          <p>
            Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı şifreleme (SSL/TLS), 
            güvenlik duvarları ve güvenli sunucu altyapıları kullanıyoruz. Ancak, internet üzerinden 
            yapılan hiçbir veri iletiminin veya elektronik depolamanın %100 güvenli olduğunu garanti edemeyiz.
          </p>

          <h2 id="kullanici-haklari">6. Kullanıcı Hakları (KVKK & GDPR)</h2>
          <p>Geçerli veri koruma yasaları uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
            <li>Verilerinizin düzeltilmesini, güncellenmesini veya silinmesini talep etme (Unutulma Hakkı).</li>
            <li>Pazarlama e-postaları veya bülten aboneliğinden dilediğiniz zaman ayrılma (opt-out).</li>
          </ul>
          <p>Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.</p>

          <h2 id="degisiklikler">7. Politikadaki Değişiklikler</h2>
          <p>
            Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler yapılması 
            durumunda, güncellenmiş politikayı bu sayfada yayınlayacak ve "Son Güncelleme" tarihini değiştireceğiz.
          </p>
          <p><em>Son Güncelleme: 14 Mayıs 2024</em></p>

          <h2 id="iletisim">8. İletişim</h2>
          <p>Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız varsa, bizimle iletişime geçmekten çekinmeyin:</p>
          <ul>
            <li><strong>E-posta:</strong> hello@geidostudio.com</li>
            <li><strong>Adres:</strong> Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul, Türkiye</li>
            <li><strong>Telefon:</strong> +90 (553) 003 7403</li>
          </ul>
        </>
      )}
    </DocsLayout>
  );
};

export default PrivacyPolicy;
