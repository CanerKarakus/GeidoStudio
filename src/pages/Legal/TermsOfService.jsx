import React from 'react';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { Scale, FileWarning } from 'lucide-react';

const TermsOfService = () => {
  const toc = [
    { id: 'kabul-ve-onay', title: '1. Kabul ve Onay', level: 2 },
    { id: 'hizmet-tanimi', title: '2. Hizmetlerin Tanımı', level: 2 },
    { id: 'kullanici-yukumlulukleri', title: '3. Kullanıcı Yükümlülükleri', level: 2 },
    { id: 'fikri-mulkiyet', title: '4. Fikri Mülkiyet Hakları', level: 2 },
    { id: 'fiyatlandirma-ve-odeme', title: '5. Fiyatlandırma ve Ödeme', level: 2 },
    { id: 'iptal-ve-iade', title: '6. İptal ve İade Politikası', level: 2 },
    { id: 'sorumluluk-sinirlari', title: '7. Sorumluluk Sınırları', level: 2 },
    { id: 'uyusmazlik', title: '8. Uyuşmazlık Çözümü', level: 2 },
  ];

  return (
    <DocsLayout 
      title="Kullanım Koşulları" 
      breadcrumb="Kullanım Koşulları"
      toc={toc}
    >
      <p>
        Bu Kullanım Koşulları ("Sözleşme"), <strong>Geido Studio</strong> ("Ajans", "Biz", "Bizim") ile 
        hizmetlerimizden yararlanan veya web sitemizi ziyaret eden kişi/kurum ("Müşteri", "Kullanıcı", "Siz") 
        arasındaki yasal ilişkiyi düzenler.
      </p>

      <div className="callout">
        <Scale className="calloutIcon" size={24} />
        <div className="calloutContent">
          <h4>Yasal Bağlayıcılık</h4>
          <p>
            Geidostudio.com web sitesine erişerek veya sunduğumuz dijital tasarım ve yazılım hizmetlerini 
            kullanarak bu koşulları kayıtsız şartsız okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.
          </p>
        </div>
      </div>

      <h2 id="kabul-ve-onay">1. Kabul ve Onay</h2>
      <p>
        Hizmetlerimizi kullandığınız andan itibaren bu sözleşmenin şartları geçerli sayılır. Eğer bu 
        koşulların herhangi bir kısmını kabul etmiyorsanız, web sitemizi ve hizmetlerimizi kullanmayı derhal bırakmalısınız.
      </p>

      <h2 id="hizmet-tanimi">2. Hizmetlerin Tanımı</h2>
      <p>
        Geido Studio; web tasarım, özel yazılım geliştirme, UI/UX tasarım, mobil uygulama geliştirme, 
        kurumsal kimlik tasarımı ve sosyal medya yönetimi gibi dijital ajans hizmetleri sunmaktadır. 
        Sağlanan her hizmet, Müşteri ile yapılacak özel bir "Proje Sözleşmesi" veya yazılı teklif 
        onayı ile ayrıca detaylandırılabilir.
      </p>

      <h2 id="kullanici-yukumlulukleri">3. Kullanıcı Yükümlülükleri</h2>
      <p>Web sitemizi kullanırken veya bizimle çalışırken aşağıdaki kurallara uymayı taahhüt edersiniz:</p>
      <ul>
        <li>Siteyi veya hizmetleri yasadışı, hileli veya zararlı amaçlarla kullanmamak.</li>
        <li>Sitenin güvenliğini ihlal etmeye veya altyapısına zarar vermeye çalışmamak.</li>
        <li>Bize ilettiğiniz iletişim bilgilerinin veya proje materyallerinin doğru, yasal ve telif haklarını ihlal etmeyen içerikler olduğunu garanti etmek.</li>
        <li>Projeler için talep edilen revizyon ve içerikleri zamanında teslim etmek.</li>
      </ul>

      <h2 id="fikri-mulkiyet">4. Fikri Mülkiyet Hakları</h2>
      <p>Geido Studio tarafından üretilen tüm tasarımlar, yazılım kodları ve dijital materyaller üzerindeki hakların durumu aşağıdaki gibidir:</p>
      <ul>
        <li><strong>Geido Studio Materyalleri:</strong> Web sitemizde yer alan tüm metinler, grafikler, logolar, görseller ve yazılımlar Geido Studio'nun mülkiyetindedir ve telif hakları yasaları ile korunmaktadır. İzinsiz kopyalanamaz veya çoğaltılamaz.</li>
        <li><strong>Müşteri Projeleri:</strong> Bir proje tamamlanıp, tüm ödemeler eksiksiz olarak yapıldığında, üretilen son ürünün (web sitesi, logo, uygulama vb.) mülkiyet ve kullanım hakları Müşteriye devredilir. (Aksi sözleşmede belirtilmediği sürece taslaklar, kaynak dosyalar ve kullanılmayan alternatifler Geido Studio'ya aittir.)</li>
        <li><strong>Portfolyo Hakkı:</strong> Geido Studio, gizlilik sözleşmesi (NDA) ile aksi belirtilmedikçe, tamamlanan projeleri kendi portfolyosunda, web sitesinde ve sosyal medya hesaplarında referans olarak sergileme hakkını saklı tutar.</li>
      </ul>

      <h2 id="fiyatlandirma-ve-odeme">5. Fiyatlandırma ve Ödeme</h2>
      <p>
        Hizmetlerimizin fiyatlandırması projenin kapsamına göre özel olarak belirlenir. Ödeme koşulları 
        teklif aşamasında Müşteri ile paylaşılır. Genel standartlarımız:
      </p>
      <ul>
        <li>Projeye başlanabilmesi için anlaşılan tutarın belirli bir yüzdesi (%40 - %50 arası) peşinat olarak talep edilir.</li>
        <li>Kalan bakiye, proje tesliminde veya sözleşmede belirlenen kilometre taşlarında (milestones) faturalandırılır.</li>
        <li>Geciken ödemelerde, projenin askıya alınması veya yasal gecikme faizi uygulanması hakkımız saklıdır.</li>
      </ul>

      <div className="callout">
        <FileWarning className="calloutIcon" size={24} />
        <div className="calloutContent">
          <h4>Kapsam Dışı Talepler</h4>
          <p>
            Onaylanmış proje kapsamının (brief) dışında kalan ek talepler, yeni özellikler veya 
            sınırı aşan revizyon istekleri ek ücrete tabidir ve proje teslim süresini uzatabilir.
          </p>
        </div>
      </div>

      <h2 id="iptal-ve-iade">6. İptal ve İade Politikası</h2>
      <p>
        Dijital ürünler ve özel tasarım hizmetleri (web sitesi, grafik tasarım, özel yazılım) doğası gereği, 
        işin ifasına başlandıktan sonra cayma hakkı kapsamı dışındadır.
      </p>
      <ul>
        <li><strong>Peşinat:</strong> Projeye ayrılan zaman, araştırma ve ilk taslak hazırlıkları nedeniyle yatırılan peşinatlar iade edilmez.</li>
        <li><strong>Proje İptali:</strong> Müşteri projeyi tek taraflı iptal ederse, o ana kadar yapılmış olan çalışmanın efor bedeli hesaplanır. Eğer peşinatı aşan bir emek harcanmışsa, aradaki fark Müşteriden talep edilir.</li>
      </ul>

      <h2 id="sorumluluk-sinirlari">7. Sorumluluk Sınırları</h2>
      <p>
        Geido Studio, projeleri en yüksek kalite standartlarında teslim etmek için çalışır. Ancak, 
        hizmetlerimizin kullanımı veya kullanılamaması sonucunda ortaya çıkabilecek veri kaybı, kâr kaybı 
        veya dolaylı zararlardan ajansımız sorumlu tutulamaz.
      </p>
      <p>
        Ayrıca, müşteriye teslim edildikten ve onaylandıktan sonra, üçüncü taraf eklentilerden, sunucu/hosting 
        hatalarından veya siber saldırılardan kaynaklanan sorunlar Geido Studio'nun garantisi dışındadır 
        (Aylık bakım sözleşmesi yapılmadığı takdirde).
      </p>

      <h2 id="uyusmazlik">8. Uyuşmazlık Çözümü</h2>
      <p>
        Bu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına tabidir. Bu sözleşmeden doğabilecek 
        her türlü uyuşmazlığın çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>

      <br />
      <p><em>Son Güncelleme: 14 Mayıs 2024</em></p>
      
    </DocsLayout>
  );
};

export default TermsOfService;
