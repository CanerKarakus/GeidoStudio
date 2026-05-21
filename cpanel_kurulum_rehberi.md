# GeidoStudio — Backend cPanel Kurulum Rehberi

Bu rehber, GeidoStudio projesinin **backend** (sunucu) tarafını cPanel'e adım adım nasıl kuracağınızı anlatır. Frontend (kullanıcı arayüzü) Netlify'da çalışmaya devam edecektir.

---

## 📋 ÖN HAZIRLIKLAR

Başlamadan önce şunların hazır olduğundan emin olun:
1. cPanel'e giriş yapabiliyorsunuz.
2. cPanel'de **"Setup Node.js App"** veya **"Node.js Selector"** özelliği aktif.
3. Backend için bir subdomain (örnek: `api.geidostudio.com`) oluşturdunuz ve klasörünü belirlediniz (genelde `public_html/api` veya sadece ana dizinde `api` klasörü).
4. Bu subdomain için **SSL (HTTPS)** sertifikasını kurdunuz (cPanel -> SSL/TLS Status -> AutoSSL veya Let's Encrypt ile).
5. cPanel'de **Terminal** veya **SSH** erişiminiz var.

---

## ADIM 1: cPanel'de Node.js Uygulaması Oluşturma

1. cPanel paneline giriş yapın.
2. Arama kutusuna "Node.js" yazın ve **"Setup Node.js App"** bağlantısına tıklayın.
3. **"Create Application"** butonuna basın.
4. Çıkan formu şu şekilde doldurun:
   - **Node.js version:** `18.x.x` (18 sürümü veya daha yenisini seçin)
   - **Application mode:** `Production` (Kesinlikle Production olmalı!)
   - **Application root:** `backend` (veya dosyalarınızı hangi klasöre atacaksanız onun adı, örn: `api.geidostudio.com`)
   - **Application URL:** Subdomaininizi seçin (Örn: `api.geidostudio.com`)
   - **Application startup file:** `src/server.js`
5. **"Create"** butonuna basarak uygulamayı oluşturun.

*Not: Uygulama oluştuktan sonra "Stop App" diyerek şimdilik durdurun. Dosyaları yükledikten sonra başlatacağız.*

---

## ADIM 2: Dosyaları Sunucuya Yükleme

Dosyaları sunucuya yüklemek için iki seçeneğiniz var: Terminal (Git) veya Dosya Yöneticisi (File Manager). **Git kullanmak her zaman daha sağlıklı ve kolaydır.**

### Seçenek A: Terminal ve Git ile (Önerilen)

1. cPanel'de **Terminal** uygulamasını açın (veya bilgisayarınızdan SSH ile bağlanın).
2. Projeyi sunucuya klonlayın:
   ```bash
   cd ~
   git clone https://github.com/CanerKarakus/GeidoStudio.git GeidoStudio
   ```
3. Eğer Adım 1'de "Application root" olarak `backend` klasörünü gösterdiyseniz, indirdiğiniz proje içindeki backend klasörünü cPanel'in beklediği yere sembolik link ile bağlayın (veya dosyaları taşıyın):
   ```bash
   ln -s ~/GeidoStudio/backend ~/backend
   ```
   *(Eğer Application root olarak doğrudan `GeidoStudio/backend` yolunu gösterebiliyorsanız Adım 1'de bunu yapın, daha kolay olur)*

### Seçenek B: Dosya Yöneticisi (File Manager) veya FTP ile

1. cPanel'den **File Manager**'ı açın.
2. Adım 1'de belirlediğiniz "Application root" klasörüne (örn: `/home/kullaniciadi/backend`) girin.
3. Bilgisayarınızdaki `backend` klasörünün **İÇİNDEKİ** tüm dosyaları bu klasöre yükleyin.
   - ⚠️ **DİKKAT:** `node_modules` klasörünü KESİNLİKLE YÜKLEMEYİN! (Boyutu çok büyüktür ve sunucuda yeniden kurulması gerekir).
   - `.env` dosyasını bilgisayarınızdan yükleyemezsiniz (gizli dosyadır), bir sonraki adımda sunucuda oluşturacağız.

---

## ADIM 3: .env Dosyasını Oluşturma (Çok Kritik!)

Sunucu, veritabanı şifrelerini, e-posta ayarlarını ve güvenlik anahtarlarını `.env` dosyasından okur.

1. cPanel **Terminal**'i açın.
2. Backend klasörünüzün içine girin:
   ```bash
   cd ~/backend
   ```
   *(veya klasörünüzün adı neyse, örn: `cd ~/GeidoStudio/backend`)*
3. Yeni bir `.env` dosyası oluşturun ve nano editörü ile açın:
   ```bash
   nano .env
   ```
4. Aşağıdaki kod bloğunu kopyalayın ve terminale yapıştırın. Yapıştırdıktan sonra ok tuşlarıyla ilerleyerek bilgilerinizi güncelleyin.

```env
# Geido Studio Backend - Environment Variables

# JWT Secret (Bilgisayarınızdaki yerel .env dosyasındaki JWT_SECRET değerini buraya BİREBİR yapıştırın)
JWT_SECRET=55c9ac7deec1ca5149c197e56f6cb6891c2ebb4154e4db1d253e421be555cbb5def2be07072b90f1a46a9bdd400c31ea06cfb630d468445f9e9c280c1626a3a5

# Admin Credentials (Yerel .env dosyanızdaki ADMIN_PASSWORD_HASH değerini BİREBİR kopyalayın)
ADMIN_EMAIL=admin@geidostudio.com
ADMIN_PASSWORD_HASH=$2a$12$Oy1S.E8XO347LQQFQpNyUeV8N6nAtTI9JV4pRSvqvQc.ZEXrmZcYG

# Frontend URL (CORS İÇİN ÇOK ÖNEMLİ! Netlify adresiniz. Sonunda / olmamalı!)
FRONTEND_URL=https://geidostudio.netlify.app

# Server Port (cPanel otomatik atayabilir, 3001 kalabilir)
PORT=3001

# Environment (KESİNLİKLE production OLMALI!)
NODE_ENV=production

# SMTP (E-posta Gönderme Ayarları)
SMTP_HOST=smtp.turkticaret.net
SMTP_PORT=465
SMTP_USER=info@geidostudio.com
SMTP_PASS=GeidoStudio789!
SMTP_ENCRYPTION=ssl
SMTP_FROM=GeidoStudio <info@geidostudio.com>

# IMAP (Gelen Kutusu Ayarları)
IMAP_HOST=imap.turkticaret.net
IMAP_PORT=993
IMAP_ENCRYPTION=ssl
```

5. Kaydetmek için: `Ctrl + X` tuşlarına basın, sonra `Y` tuşuna basın, en son `Enter`'a basın.

---

## ADIM 4: Veri ve Upload Klasörlerini Oluşturma

Backend uygulamanızın görselleri kaydetmesi ve CMS verilerini tutması için bazı boş klasörlere ve dosyalara ihtiyacı vardır.

Terminalde (`backend` klasörünün içindeyken) şu komutları sırasıyla çalıştırın:

```bash
# Klasörleri oluştur
mkdir -p data uploads

# İzinleri ayarla (okuma/yazma izni)
chmod 755 data
chmod 755 uploads

# Gerekli boş JSON dosyalarını oluştur
echo '[]' > data/messages.json
echo '[]' > data/subscribers.json
echo '{"heroImages":[],"heroTitle":"Hayalinizdeki Dijital Dünyayı İnşa Ediyoruz","heroSubtitle":"Modern, estetik ve işlevsel web çözümleri ile markanızı geleceğe taşıyın. Profesyonel tasarım ve yazılım ajansı.","aboutTitle":"Hakkımızda","aboutText":"Geido Studio, dijital dünyada markalarınızın potansiyelini en üst düzeye çıkarmak için yenilikçi, modern ve etkili çözümler sunar.","projectsHeroImage":"","aboutTeamYasarhanImage":"","aboutTeamCanerImage":"","contactEmail":"hello@geidostudio.com","contactPhone":"+90 (555) 123 45 67","contactAddress":"Levent, Büyükdere Cd., 34330 Beşiktaş/İstanbul","blogs":[],"projects":[],"heroSliderDuration":15}' > data/cms.json

# JSON dosyalarına yazma izni ver
chmod 666 data/*.json
```

---

## ADIM 5: Node Modules (Bağımlılıkları) Kurma

Projenin çalışması için gerekli kütüphanelerin sunucuya indirilmesi gerekir.

1. cPanel -> **Setup Node.js App** sayfasına geri dönün.
2. Oluşturduğunuz uygulamanın yanındaki **Kalem (Edit)** simgesine tıklayın.
3. Sayfayı aşağı kaydırın, **"Run NPM Install"** butonuna tıklayın.
4. Bu işlem 1-2 dakika sürebilir. Başarılı olduğuna dair bir mesaj bekleyin.

*(Alternatif olarak Terminal'de `backend` klasörü içindeyken `npm install --production` yazarak da kurabilirsiniz.)*

---

## ADIM 6: Uygulamayı Başlatma

1. cPanel -> **Setup Node.js App** sayfasında uygulamanızın yanındaki **"Start App"** butonuna tıklayın.
2. Uygulama başladıktan sonra düzgün çalışıp çalışmadığını test etmek için tarayıcınızda API adresinize gidin:
   
   ```
   https://api.geidostudio.com/api/health
   ```
   *(Eğer subdomaininizi api.geidostudio.com yapmadıysanız kendi subdomaininizi yazın)*

3. Ekranda şöyle bir yazı görmelisiniz:
   ```json
   {"status":"ok","timestamp":"2026-05-20T22:15:00.000Z"}
   ```

Eğer bunu görüyorsanız Backend kusursuz bir şekilde çalışıyor demektir! 🎉

---

## ADIM 7: Frontend (Netlify) Bağlantısını Güncelleme

Şimdi Netlify'daki arayüzümüze, yeni backend'imizin adresini söylememiz gerekiyor.

1. Netlify kontrol paneline giriş yapın ve sitenizi seçin.
2. Sol menüden **"Site Configuration"** (veya Site Settings) menüsüne girin.
3. **"Environment variables"** sekmesine tıklayın.
4. **"Add a variable"** (Değişken ekle) butonuna tıklayın.
5. Şu bilgileri girin:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.geidostudio.com` *(Kendi backend subdomaininiz. Sonunda KESİNLİKLE `/` işareti OLMAMALI)*
6. **Save** butonuna tıklayın.
7. Değişikliğin aktif olması için sitenizi yeniden derlemeniz (deploy) gerekir:
   - Netlify'da sol menüden **"Deploys"** sekmesine gidin.
   - **"Trigger deploy"** -> **"Deploy site"** seçeneğine tıklayın.
8. İşlem bitince sitenizi açın ve admin paneline giriş yapmayı deneyin!

---

## 🛑 SIK KARŞILAŞILAN SORUNLAR VE ÇÖZÜMLERİ

**1. Admin Paneline Giriş Yaparken "Network Error" veya "CORS Hatası" Alıyorum:**
- Backend'deki `.env` dosyasında `FRONTEND_URL` değişkeninin tam olarak Netlify sitenizin adresi (örn: `https://geidostudio.netlify.app`) olduğundan emin olun. Sonunda `/` olmasın.
- Netlify'daki `VITE_API_URL` değişkeninin baş harfi "https://" ile başlamalı ve sonunda `/` işareti olmamalıdır.

**2. Admin Paneline Giriyor Ama Kaydet Basınca Değişiklikler Kayboluyor veya Hata Veriyor:**
- Backend klasöründeki `data` klasörünün ve içindeki `cms.json` dosyasının yazma izinlerinin (`CHMOD 755` ve `666`) doğru olduğundan emin olun. Cpanel Dosya Yöneticisinden "Permissions" kısmından 755 / 666 yapabilirsiniz.

**3. Görseller Yüklenmiyor veya "Hata Oluştu" Diyor:**
- `uploads` klasörünün var olduğundan ve klasör izninin `755` olduğundan emin olun. Dosya yöneticisinden manuel olarak `uploads` adında boş bir klasör oluşturabilirsiniz.

**4. Backend Sayfasına (api.geidostudio.com/api/health) Girince "503 Service Unavailable" Diyor:**
- cPanel'de Node.js App durmuş olabilir. Setup Node.js App kısmından "Restart" butonuna basın.
- `package.json` içindeki gerekli modüller kurulamamış olabilir. "Run NPM Install" butonuna tekrar basın.

**5. Login Oluyorum Ama Sayfa Yenilenince Tekrar Login Atıyor:**
- Backend `.env` dosyasında `NODE_ENV=production` yazmıyorsa bu olur. `production` yazdığından emin olun. Bu ayar Cookie'lerin güvenli şekilde tarayıcıda tutulmasını (sameSite: none) sağlar.
