import React from 'react';
import DocsLayout from '../../components/DocsLayout/DocsLayout';
import { FileText, ShieldCheck } from 'lucide-react';

const KvkkPolicy = () => {
  const toc = [
    { id: 'veri-sorumlusu', title: '1. Veri Sorumlusunun Kimliği', level: 2 },
    { id: 'isleme-amaci', title: '2. Kişisel Verilerin İşlenme Amacı', level: 2 },
    { id: 'aktarim', title: '3. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği', level: 2 },
    { id: 'toplama-yontemi', title: '4. Veri Toplama Yöntemi ve Hukuki Sebebi', level: 2 },
    { id: 'ilgili-kisi-haklari', title: '5. İlgili Kişinin Hakları', level: 2 },
    { id: 'basvuru', title: '6. Bize Başvuru', level: 2 },
  ];

  return (
    <DocsLayout 
      title="KVKK Aydınlatma Metni" 
      breadcrumb="KVKK Aydınlatma Metni"
      toc={toc}
    >
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

      <h2 id="aktarim">3. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği</h2>
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

    </DocsLayout>
  );
};

export default KvkkPolicy;
