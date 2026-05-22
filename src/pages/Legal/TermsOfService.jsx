import React from 'react';
import { useTranslation } from 'react-i18next';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { Scale, FileWarning } from 'lucide-react';

const TermsOfService = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toc = isEn ? [
    { id: 'acceptance', title: '1. Acceptance and Consent', level: 2 },
    { id: 'service-definition', title: '2. Definition of Services', level: 2 },
    { id: 'user-obligations', title: '3. User Obligations', level: 2 },
    { id: 'intellectual-property', title: '4. Intellectual Property Rights', level: 2 },
    { id: 'pricing', title: '5. Pricing and Payment', level: 2 },
    { id: 'cancellation', title: '6. Cancellation and Refund Policy', level: 2 },
    { id: 'liability', title: '7. Limitation of Liability', level: 2 },
    { id: 'dispute', title: '8. Dispute Resolution', level: 2 },
  ] : [
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
      title={isEn ? "Terms of Service" : "Kullanım Koşulları"} 
      breadcrumb={isEn ? "Terms of Service" : "Kullanım Koşulları"}
      toc={toc}
    >
      {isEn ? (
        <>
          <p>
            These Terms of Service ("Agreement") regulate the legal relationship between <strong>Geido Studio</strong> ("Agency", "We", "Our") and the person/institution ("Client", "User", "You") using our services or visiting our website.
          </p>

          <div className="callout">
            <Scale className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Legal Binding</h4>
              <p>
                By accessing the geidostudio.com website or using the digital design and software services we offer, you declare that you have read, understood, and unreservedly accepted these terms.
              </p>
            </div>
          </div>

          <h2 id="acceptance">1. Acceptance and Consent</h2>
          <p>
            The terms of this agreement are considered valid from the moment you use our services. If you do not accept any part of these terms, you must stop using our website and services immediately.
          </p>

          <h2 id="service-definition">2. Definition of Services</h2>
          <p>
            Geido Studio offers digital agency services such as web design, custom software development, UI/UX design, mobile application development, corporate identity design, and social media management. Every service provided can be further detailed with a specific "Project Agreement" or written proposal approval to be made with the Client.
          </p>

          <h2 id="user-obligations">3. User Obligations</h2>
          <p>By using our website or working with us, you commit to abiding by the following rules:</p>
          <ul>
            <li>Not to use the site or services for illegal, fraudulent, or harmful purposes.</li>
            <li>Not to attempt to violate the security of the site or harm its infrastructure.</li>
            <li>To guarantee that the contact information or project materials you provide to us are accurate, legal, and do not violate copyright laws.</li>
            <li>To deliver the revision requests and content for projects in a timely manner.</li>
          </ul>

          <h2 id="intellectual-property">4. Intellectual Property Rights</h2>
          <p>The status of the rights on all designs, software codes, and digital materials produced by Geido Studio is as follows:</p>
          <ul>
            <li><strong>Geido Studio Materials:</strong> All texts, graphics, logos, images, and software on our website are the property of Geido Studio and are protected by copyright laws. They cannot be copied or reproduced without permission.</li>
            <li><strong>Client Projects:</strong> When a project is completed and all payments are made in full, the ownership and usage rights of the final product (website, logo, app, etc.) are transferred to the Client. (Unless otherwise stated in the contract, drafts, source files, and unused alternatives belong to Geido Studio.)</li>
            <li><strong>Portfolio Right:</strong> Unless otherwise specified by a non-disclosure agreement (NDA), Geido Studio reserves the right to showcase completed projects in its portfolio, website, and social media accounts as a reference.</li>
          </ul>

          <h2 id="pricing">5. Pricing and Payment</h2>
          <p>
            The pricing of our services is determined specifically according to the scope of the project. Payment conditions are shared with the Client during the proposal phase. Our general standards:
          </p>
          <ul>
            <li>In order to start the project, a certain percentage (between 40% - 50%) of the agreed amount is requested as a down payment.</li>
            <li>The remaining balance is billed upon project delivery or at the milestones determined in the contract.</li>
            <li>In case of delayed payments, we reserve the right to suspend the project or apply legal default interest.</li>
          </ul>

          <div className="callout">
            <FileWarning className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Out of Scope Requests</h4>
              <p>
                Additional requests, new features, or revision requests exceeding the limit that are outside the approved project scope (brief) are subject to additional fees and may extend the project delivery time.
              </p>
            </div>
          </div>

          <h2 id="cancellation">6. Cancellation and Refund Policy</h2>
          <p>
            Due to the nature of digital products and custom design services (website, graphic design, custom software), they are excluded from the scope of the right of withdrawal once the performance of the work has begun.
          </p>
          <ul>
            <li><strong>Down Payment:</strong> Down payments made due to the time, research, and initial draft preparations allocated to the project are non-refundable.</li>
            <li><strong>Project Cancellation:</strong> If the Client unilaterally cancels the project, the effort value of the work done up to that moment is calculated. If the effort expended exceeds the down payment, the difference is requested from the Client.</li>
          </ul>

          <h2 id="liability">7. Limitation of Liability</h2>
          <p>
            Geido Studio works to deliver projects at the highest quality standards. However, our agency cannot be held responsible for data loss, loss of profit, or indirect damages that may arise as a result of the use or inability to use our services.
          </p>
          <p>
            Also, after delivery to the client and approval, issues arising from third-party plugins, server/hosting errors, or cyber-attacks are out of Geido Studio's warranty (unless a monthly maintenance contract is made).
          </p>

          <h2 id="dispute">8. Dispute Resolution</h2>
          <p>
            These Terms of Service are subject to the laws of the Republic of Turkey. Istanbul Courts and Execution Offices are authorized to resolve any disputes that may arise from this agreement.
          </p>

          <br />
          <p><em>Last Update: May 14, 2024</em></p>
        </>
      ) : (
        <>
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
        </>
      )}
    </DocsLayout>
  );
};

export default TermsOfService;
