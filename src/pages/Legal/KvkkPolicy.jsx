import React from 'react';
import { useTranslation } from 'react-i18next';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { ShieldCheck } from 'lucide-react';

const KvkkPolicy = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toc = isEn ? [
    { id: 'data-controller', title: '1. Identity of the Data Controller', level: 2 },
    { id: 'purpose', title: '2. Purpose of Processing Personal Data', level: 2 },
    { id: 'transfer', title: '3. Data Transfer', level: 2 },
    { id: 'collection', title: '4. Collection Method and Legal Basis', level: 2 },
    { id: 'rights', title: '5. Data Subject Rights', level: 2 },
    { id: 'contact', title: '6. Contact Us', level: 2 },
  ] : [
    { id: 'veri-sorumlusu', title: '1. Veri Sorumlusunun Kimliği', level: 2 },
    { id: 'isleme-amaci', title: '2. Kişisel Verilerin İşlenme Amacı', level: 2 },
    { id: 'aktarim', title: '3. Veri Aktarımı', level: 2 },
    { id: 'toplama-yontemi', title: '4. Veri Toplama Yöntemi ve Hukuki Sebebi', level: 2 },
    { id: 'ilgili-kisi-haklari', title: '5. İlgili Kişinin Hakları', level: 2 },
    { id: 'basvuru', title: '6. Bize Başvuru', level: 2 },
  ];

  return (
    <DocsLayout 
      title={isEn ? "KVKK Clarification Text" : "KVKK Aydınlatma Metni"}
      breadcrumb={isEn ? "KVKK Clarification Text" : "KVKK Aydınlatma Metni"}
      toc={toc}
    >
      {isEn ? (
        <>
          <p>
            As <strong>Geido Studio</strong>, we would like to inform you about the processing, protection of your personal data, and your rights within the scope of the Personal Data Protection Law ("KVKK") No. 6698.
          </p>

          <div className="callout">
            <ShieldCheck className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Legal Compliance</h4>
              <p>
                As a Data Controller, Geido Studio processes your personal data in accordance with the principles and conditions stipulated in the KVKK. Your privacy and data security are our top priorities.
              </p>
            </div>
          </div>

          <h2 id="data-controller">1. Identity of the Data Controller</h2>
          <p>
            In accordance with KVKK, your addressee is <strong>Geido Studio</strong> ("Company"), operating at Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul.
          </p>

          <h2 id="purpose">2. Purpose of Processing Personal Data</h2>
          <p>Your personal data we collect (name-surname, email, phone number, IP address, project details, etc.) is processed for the following purposes:</p>
          <ul>
            <li>Establishment and performance of service contracts.</li>
            <li>Contacting you regarding your requests, complaints, or questions.</li>
            <li>Delivering information, campaigns, and announcements if you subscribe to our newsletter.</li>
            <li>Analyzing the performance of our website and improving user experience.</li>
            <li>Fulfilling our legal obligations and meeting requests from official authorities.</li>
          </ul>

          <h2 id="transfer">3. Data Transfer</h2>
          <p>Your personal data may be transferred to the following parties within the conditions specified in Articles 8 and 9 of the KVKK:</p>
          <ul>
            <li>Authorized public institutions and organizations due to our legal obligations.</li>
            <li>Business partners we receive technological infrastructure support from to carry out our services (hosting companies, email service providers, analytics services, etc.).</li>
            <li>Our company lawyers or consultants for the purpose of following legal processes.</li>
          </ul>
          <p>Your data is not sold for commercial purposes or shared with third parties to provide unfair advantage.</p>

          <h2 id="collection">4. Collection Method and Legal Basis</h2>
          <p>
            Your personal data is collected when you fill out the contact form on our website, subscribe to the newsletter, contact us via email, or through cookies (automated means) during your visit to our website.
          </p>
          <p>This data is processed based on the following legal reasons stated in Article 5 of KVKK:</p>
          <ul>
            <li>Being directly related to the establishment or performance of a contract.</li>
            <li>Being mandatory for the data controller to fulfill its legal obligation.</li>
            <li>Data processing being mandatory for the legitimate interests of the data controller, provided that it does not harm the fundamental rights and freedoms of the data subject.</li>
            <li>Having your explicit consent when necessary (e.g., for sending e-newsletters).</li>
          </ul>

          <h2 id="rights">5. Data Subject Rights</h2>
          <p>Pursuant to Article 11 of the KVKK, as a data owner, you have the following rights:</p>
          <ul>
            <li>To learn whether your personal data is processed,</li>
            <li>To request information if processed,</li>
            <li>To learn the purpose of processing and whether they are used in accordance with their purpose,</li>
            <li>To know the third parties to whom personal data is transferred domestically or abroad,</li>
            <li>To request correction if they are incomplete or incorrectly processed,</li>
            <li>To request the deletion or destruction of personal data within the framework of the conditions stipulated in Article 7 of KVKK,</li>
            <li>To object to the emergence of a result against you by analyzing the processed data exclusively through automated systems,</li>
            <li>To demand the compensation of the damage in case you suffer damage due to unlawful processing.</li>
          </ul>

          <h2 id="contact">6. Contact Us</h2>
          <p>
            You can send your requests regarding the exercise of the above-mentioned rights in writing to <strong>hello@geidostudio.com</strong> with identifying documents or via mail.
          </p>
          <p>Your requests will be concluded free of charge as soon as possible and within thirty (30) days at the latest depending on their nature.</p>

          <br />
          <p><em>Last Update: May 14, 2024</em></p>
        </>
      ) : (
        <>
          <p>
            <strong>Geido Studio</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") 
            kapsamında, kişisel verilerinizin işlenmesi, korunması ve haklarınız konusunda sizi bilgilendirmek istiyoruz.
          </p>

          <div className="callout">
            <ShieldCheck className="calloutIcon" size={24} />
            <div className="calloutContent">
              <h4>Yasal Uyumluluk</h4>
              <p>
                Veri Sorumlusu sıfatıyla Geido Studio, kişisel verilerinizi KVKK'da öngörülen ilke ve şartlara 
                uygun olarak işlemektedir. Gizliliğiniz ve veri güvenliğiniz bizim için en üst düzeyde önceliktir.
              </p>
            </div>
          </div>

          <h2 id="veri-sorumlusu">1. Veri Sorumlusunun Kimliği</h2>
          <p>
            KVKK uyarınca muhatabınız; Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul adresinde 
            faaliyet gösteren <strong>Geido Studio</strong> ("Şirket")'dur.
          </p>

          <h2 id="isleme-amaci">2. Kişisel Verilerin İşlenme Amacı</h2>
          <p>Topladığımız kişisel verileriniz (ad-soyad, e-posta, telefon numarası, IP adresi, proje bilgileri vb.) aşağıdaki amaçlarla işlenmektedir:</p>
          <ul>
            <li>Hizmet sözleşmelerinin kurulması ve ifası.</li>
            <li>Talepleriniz, şikayetleriniz veya sorularınızla ilgili sizinle iletişime geçilmesi.</li>
            <li>Bülten veya e-posta listemize kayıt olmanız halinde, bilgilendirme, kampanya ve duyuruların iletilmesi.</li>
            <li>Web sitemizin performansının analiz edilmesi ve kullanıcı deneyiminin iyileştirilmesi.</li>
            <li>Yasal yükümlülüklerimizin yerine getirilmesi ve resmi makamların taleplerinin karşılanması.</li>
          </ul>

          <h2 id="aktarim">3. Veri Aktarımı</h2>
          <p>Kişisel verileriniz, ancak KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar dahilinde aşağıdaki taraflara aktarılabilir:</p>
          <ul>
            <li>Yasal yükümlülüklerimiz gereği yetkili kamu kurum ve kuruluşlarına.</li>
            <li>Hizmetlerimizi yürütebilmemiz için teknolojik altyapı desteği aldığımız iş ortaklarına (hosting şirketleri, e-posta hizmet sağlayıcıları, analitik servisler vb.).</li>
            <li>Hukuki süreçlerin takibi amacıyla şirket avukatlarımıza veya danışmanlarımıza.</li>
          </ul>
          <p>Verileriniz, ticari amaçla satılmaz veya haksız menfaat sağlayacak şekilde üçüncü kişilerle paylaşılmaz.</p>

          <h2 id="toplama-yontemi">4. Veri Toplama Yöntemi ve Hukuki Sebebi</h2>
          <p>
            Kişisel verileriniz; web sitemizdeki iletişim formunu doldurmanız, bültene abone olmanız, 
            bizimle e-posta yoluyla iletişime geçmeniz veya web sitemizi ziyaretiniz sırasında çerezler 
            aracılığıyla (otomatik yollarla) toplanmaktadır.
          </p>
          <p>Bu veriler, KVKK Madde 5'te yer alan şu hukuki sebeplere dayanarak işlenmektedir:</p>
          <ul>
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması.</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması.</li>
            <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması.</li>
            <li>Gerektiği hallerde açık rızanızın bulunması (örneğin e-bülten gönderimi için).</li>
          </ul>

          <h2 id="ilgili-kisi-haklari">5. İlgili Kişinin Hakları</h2>
          <p>KVKK'nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
            <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>KVKK 7. maddede öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
          </ul>

          <h2 id="basvuru">6. Bize Başvuru</h2>
          <p>
            Yukarıda belirtilen haklarınızı kullanmakla ilgili taleplerinizi, kimliğinizi tespit edici belgelerle 
            birlikte yazılı olarak <strong>hello@geidostudio.com</strong> adresine e-posta göndererek 
            veya posta yoluyla iletebilirsiniz. 
          </p>
          <p>Talepleriniz, niteliğine göre en kısa sürede ve en geç otuz (30) gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>

          <br />
          <p><em>Son Güncelleme: 14 Mayıs 2024</em></p>
        </>
      )}
    </DocsLayout>
  );
};

export default KvkkPolicy;
