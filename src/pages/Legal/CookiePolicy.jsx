import React from 'react';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { Cookie, Info, Settings } from 'lucide-react';

const CookiePolicy = () => {
  const toc = [
    { id: 'cerez-nedir', title: '1. Çerez (Cookie) Nedir?', level: 2 },
    { id: 'kullanim-amaclari', title: '2. Çerezleri Neden Kullanıyoruz?', level: 2 },
    { id: 'cerez-turleri', title: '3. Kullandığımız Çerez Türleri', level: 2 },
    { id: 'cerez-yonetimi', title: '4. Çerezleri Nasıl Yönetebilirsiniz?', level: 2 },
    { id: 'degisiklikler', title: '5. Politikadaki Değişiklikler', level: 2 },
  ];

  return (
    <DocsLayout 
      title="Çerez Politikası" 
      breadcrumb="Çerez Politikası"
      toc={toc}
    >
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
    </DocsLayout>
  );
};

export default CookiePolicy;
