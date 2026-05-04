import React from 'react';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { ShieldAlert, Info } from 'lucide-react';

const PrivacyPolicy = () => {
  const toc = [
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
      title="Gizlilik Politikası" 
      breadcrumb="Gizlilik Politikası"
      toc={toc}
    >
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
      <p>Kullandığımız çerez türleri şunlardır:</p>
      <table>
        <thead>
          <tr>
            <th>Çerez Türü</th>
            <th>Amaç</th>
            <th>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Zorunlu Çerezler</td>
            <td>Sitenin temel işlevlerini yerine getirmesi için gereklidir (ör. güvenlik).</td>
            <td>Oturum</td>
          </tr>
          <tr>
            <td>Analitik Çerezler</td>
            <td>Kullanıcıların siteyi nasıl kullandığını anlamamıza yardımcı olur (ör. Google Analytics).</td>
            <td>1-2 Yıl</td>
          </tr>
          <tr>
            <td>Pazarlama Çerezleri</td>
            <td>İlgi alanlarınıza uygun reklamlar sunmak ve kampanyaları takip etmek içindir.</td>
            <td>6 Ay</td>
          </tr>
        </tbody>
      </table>
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
    </DocsLayout>
  );
};

export default PrivacyPolicy;
