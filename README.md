# 🧪 Ege Lab - Bilim & Oyun İstasyonu

**Ege Lab**, **Ege Karabek** tarafından **ortaokul öğrencilerine (5, 6, 7 ve 8. sınıflar)** yönelik geliştirilmiş, hem eğitici hem de eğlenceli bir **PWA (Progressive Web App)** oyun platformudur.

---

## 🚀 Öne Çıkan Özellikler

- **📱 Tam PWA Desteği (Progressive Web App):**
  - Bilgisayara, tablete veya telefona bağımsız uygulama gibi yüklenebilir (*standalone* mod).
  - **Çevrimdışı (Offline) Oynama:** Service Worker (`sw.js`) sayesinde internet bağlantısı olmasa bile tüm oyunlar sorunsuz çalışır.
- **🔊 Dinamik Web Audio Sentezleyici:**
  - Harici ses dosyası indirmeye gerek kalmadan tarayıcının kendi ses sentezleyicisi ile zafer melodileri, tıklama ve oyun efektleri üretir.
- **🎖️ Kaşif Profili & Başarı Rozetleri:**
  - Sınıf seçimi (5, 6, 7 veya 8. Sınıf).
  - Avatar seçimi (🚀, 🔬, 🤖, ⚛️, 🧠, ⚡, 🪐 vb.).
  - Deneyim puanı (XP) ve seviye atlama sistemi (*Meraklı Çırak*'tan *Ege Lab Baş Mucidi*'ne).
  - 6 adet kilitlenebilir başarı rozeti.
- **🎨 Modern Siber-Laboratuvar Arayüzü:**
  - Göz yormayan koyu tema, cam efekti (glassmorphism), neon ışıklar ve mobil uyumlu duyarlı tasarım.

---

## 🎮 Laboratuvardaki Oyunlar

1. **⚡ Hızlı Matematik Düellosu (Sayı Fırtınası):**
   - 5-8. sınıf düzeyine göre dinamik olarak ayarlanan dört işlem, işlem önceliği, üslü ifadeler, denklemler ve kareköklü sayılar.
   - Süre kısıtlaması ve kombo çarpanı.

2. **🤖 Robotik Kodlama Lab (Algoritma Macerası):**
   - Bilişim Teknolojileri ve Yazılım dersine uygun blok tabanlı algoritma bulmacası.
   - İleri git, Sağa/Sola dön blokları ile robotu engeller arasından hedefe ulaştır.
   - 5 farklı seviye ve labirent.

3. **🎯 Fizik Laboratuvarı: Yerçekimi Topu:**
   - 2D Canvas fizik simülasyonu ($g = 9.8$, rüzgar vektörü ve fırlatma açısı).
   - Açıyı ve hızı ayarlayarak hedef deney kristallerini vur.

4. **🧬 Uzay & Hücre Hafıza Laboratuvarı:**
   - Fen Bilimleri müfredatındaki kavramlar (Gezegenler, DNA, Mitokondri, Kloroplast, Atom vb.).
   - Kartları eşleştirdikçe beliren bilimsel bilgi notları.

5. **🔬 Element & Bilim Çarkı (Fen Trivia):**
   - Müfredata uygun periyodik tablo, kimya, biyoloji ve fizik soruları.
   - %50 Eleme ve Ekstra Süre jokerleri.

---

## 💻 Nasıl Çalıştırılır?

### 1. Yerel Sunucu ile (Tavsiye Edilen - PWA ve Service Worker için):
Service Worker ve "Uygulamayı Yükle" özelliğini tam test etmek için projeyi yerel bir HTTP sunucusunda çalıştırmak önerilir.

PowerShell'de şu komutu çalıştırmanız yeterlidir:
```powershell
.\start-server.ps1
```
Tarayıcınız otomatik olarak `http://localhost:8080` adresinde açılacaktır.

### 2. Doğrudan Tarayıcıda Açarak:
`index.html` dosyasına çift tıklayarak herhangi bir tarayıcıda doğrudan oynayabilirsiniz.

---

## 📁 Proje Dizin Yapısı

```
d:\Projeler\egelab\
├── index.html                 # Ana sayfa ve oyun alanı
├── manifest.json              # PWA manifest dosyası
├── sw.js                      # Çevrimdışı önbellekleme (Service Worker)
├── start-server.ps1           # Tek tıkla yerel sunucu başlatıcı
├── README.md                  # Proje dokümantasyonu
├── css/
│   └── style.css              # Laboratuvar teması ve responsive stiller
├── js/
│   ├── app.js                 # Ana uygulama kontrolcüsü ve PWA yöneticisi
│   ├── audio.js               # Web Audio API ses sentezleyicisi
│   ├── storage.js             # Profil, XP ve rozet yöneticisi (localStorage)
│   └── games/
│       ├── math-duel.js       # Hızlı Matematik Düellosu
│       ├── robot-code.js      # Robotik Kodlama Lab
│       ├── gravity-cannon.js  # Fizik Yerçekimi Topu
│       ├── science-memory.js  # Fen Hafıza Kartları
│       └── science-quiz.js    # Element & Bilim Trivia
└── icons/
    ├── icon-192.png           # 192x192 PWA ikonu
    ├── icon-512.png           # 512x512 PWA ikonu
    ├── icon-192.svg           # Vektörel ikon
    └── icon-512.svg           # Vektörel ikon
```
