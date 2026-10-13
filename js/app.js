/**
 * Ege Lab - Ana Uygulama Kontrolcüsü & PWA Entegrasyonu
 */
class EgeLabApp {
  constructor() {
    this.activeGame = null;
    this.deferredInstallPrompt = null;
  }

  init() {
    this.registerServiceWorker();
    this.setupPWAInstall();
    this.renderHeader();
    this.setupEvents();
    this.showHome();
  }

  // Service Worker Kaydı
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('[Ege Lab] Service Worker başarıyla yüklendi:', reg.scope);
          })
          .catch((err) => {
            console.warn('[Ege Lab] Service Worker yüklenemedi:', err);
          });
      });
    }
  }

  // PWA Kurulum Butonu
  setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBtn = document.getElementById('btn-pwa-install');
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('[Ege Lab] Uygulama cihaza kuruldu!');
      const installBtn = document.getElementById('btn-pwa-install');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
      this.showToast('🎉 Ege Lab cihazına başarıyla yüklendi!');
    });
  }

  async installPWA() {
    if (!this.deferredInstallPrompt) {
      this.showToast('ℹ️ Tarayıcınızın menüsünden "Ana Ekrana Ekle" veya "Yükle" seçeneğini kullanabilirsiniz.');
      return;
    }
    this.deferredInstallPrompt.prompt();
    const { outcome } = await this.deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Kullanıcı PWA kurulumunu kabul etti');
    }
    this.deferredInstallPrompt = null;
    const installBtn = document.getElementById('btn-pwa-install');
    if (installBtn) installBtn.style.display = 'none';
  }

  setupEvents() {
    // Ses butonu
    const muteBtn = document.getElementById('btn-sound-toggle');
    if (muteBtn) {
      this.updateSoundButtonUI();
      muteBtn.onclick = () => {
        sound.toggleMute();
        this.updateSoundButtonUI();
      };
    }

    // PWA butonu
    const pwaBtn = document.getElementById('btn-pwa-install');
    if (pwaBtn) {
      pwaBtn.onclick = () => this.installPWA();
    }

    // Profil tıklandığında modal aç
    const profileChip = document.getElementById('user-profile-chip');
    if (profileChip) {
      profileChip.onclick = () => this.openProfileModal();
    }
  }

  updateSoundButtonUI() {
    const muteBtn = document.getElementById('btn-sound-toggle');
    if (!muteBtn) return;
    const isMuted = sound.isMuted();
    muteBtn.innerHTML = isMuted ? '🔇 <span class="nav-text">Ses Kapalı</span>' : '🔊 <span class="nav-text">Ses Açık</span>';
    muteBtn.title = isMuted ? 'Sesi Aç' : 'Sesi Kapat';
  }

  renderHeader() {
    const prof = storage.getProfile();
    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const titleEl = document.getElementById('profile-title');
    const gradeEl = document.getElementById('profile-grade');
    const xpBar = document.getElementById('profile-xp-bar');
    const xpText = document.getElementById('profile-xp-text');

    if (avatarEl) avatarEl.textContent = prof.avatar;
    if (nameEl) nameEl.textContent = prof.name;
    if (titleEl) titleEl.textContent = storage.getLevelTitle(prof.level);
    if (gradeEl) gradeEl.textContent = `${prof.grade}. Sınıf`;

    const nextLevelXP = prof.level * 250;
    const currentLevelBaseXP = (prof.level - 1) * 250;
    const progressInCurrentLevel = prof.xp - currentLevelBaseXP;
    const perc = Math.min(Math.max((progressInCurrentLevel / 250) * 100, 0), 100);

    if (xpBar) xpBar.style.width = `${perc}%`;
    if (xpText) xpText.textContent = `${prof.xp} XP (Seviye ${prof.level})`;
  }

  showHome() {
    if (this.activeGame && this.activeGame.stop) {
      this.activeGame.stop();
      this.activeGame = null;
    }

    document.getElementById('home-section').style.display = 'block';
    document.getElementById('game-section').style.display = 'none';
    this.renderHeader();
    this.renderGameCards();
  }

  renderGameCards() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    const games = [
      {
        id: 'mathDuel',
        title: 'Hızlı Matematik Düellosu',
        category: 'Matematik & Hız',
        desc: 'Sınıf düzeyine göre dört işlem, üslü sayılar ve denklem soruları!',
        icon: '⚡',
        color: 'from-amber-500 to-orange-600',
        badge: 'Çok Popüler',
        scoreLabel: 'En Yüksek Skor',
        scoreVal: storage.getHighScore('mathDuel')
      },
      {
        id: 'robotCode',
        title: 'Robotik Kodlama Lab',
        category: 'Algoritma & Bilişim',
        desc: 'Komut blokları ile laboratuvar robotunu hedefe ulaştır!',
        icon: '🤖',
        color: 'from-blue-500 to-indigo-600',
        badge: 'Eğitici Zeka',
        scoreLabel: 'Kazanılan Seviye',
        scoreVal: `${storage.getHighScore('robotCode') || 1}. Seviye`
      },
      {
        id: 'gravityCannon',
        title: 'Fizik: Yerçekimi Topu',
        category: 'Fizik & Hareket',
        desc: 'Açı ve hızı ayarla, yerçekimini ve rüzgarı yenerek hedefleri vur!',
        icon: '🎯',
        color: 'from-emerald-500 to-teal-600',
        badge: 'Fizik Deneyi',
        scoreLabel: 'En Yüksek Skor',
        scoreVal: storage.getHighScore('gravityCannon')
      },
      {
        id: 'scienceMemory',
        title: 'Uzay & Hücre Hafıza Lab',
        category: 'Fen & Biyoloji',
        desc: 'Fen bilimleri ve astronomi kartlarını eşleştir, sırları keşfet!',
        icon: '🧬',
        color: 'from-pink-500 to-rose-600',
        badge: 'Hafıza Gücü',
        scoreLabel: 'En Yüksek Skor',
        scoreVal: storage.getHighScore('scienceMemory')
      },
      {
        id: 'scienceQuiz',
        title: 'Element & Bilim Çarkı',
        category: 'Fen Trivia',
        desc: 'Periyodik tablodan uzaya fen bilimleri soruları ve jokerler!',
        icon: '🔬',
        color: 'from-purple-500 to-violet-600',
        badge: 'Bilgi Sınavı',
        scoreLabel: 'En Yüksek Skor',
        scoreVal: storage.getHighScore('scienceQuiz')
      },
      {
        id: 'solarSystem',
        title: 'Güneş Sistemi 3D Simülatörü',
        category: 'Uzay & Astronomi',
        desc: 'Güneş ve 8 gezegeni 3D keşfet, yörüngeleri canlandır ve gezegenlerde kilonu test et!',
        icon: '🌌',
        color: 'from-cyan-500 to-blue-600',
        badge: 'Uzay Lab',
        scoreLabel: 'Keşif Durumu',
        scoreVal: '3D İnteraktif'
      },
      {
        id: 'wordMaster',
        title: 'İngilizce Kelime Lab',
        category: 'İngilizce & Dil',
        desc: '15 kartlık seride İngilizce kelime telaffuzlarını dinle ve doğru anlamları eşleştir!',
        icon: '🇬🇧',
        color: 'from-emerald-500 to-teal-600',
        badge: '15 Kart',
        scoreLabel: 'En Yüksek Skor',
        scoreVal: storage.getHighScore('wordMaster')
      }
    ];

    grid.innerHTML = games.map(g => `
      <div class="game-card card-${g.id}" onclick="app.launchGame('${g.id}')">
        <div class="game-card-badge">${g.badge}</div>
        <div class="game-card-icon">${g.icon}</div>
        <div class="game-card-content">
          <span class="game-cat">${g.category}</span>
          <h3 class="game-title">${g.title}</h3>
          <p class="game-desc">${g.desc}</p>
        </div>
        <div class="game-card-footer">
          <span class="game-score-tag">${g.scoreLabel}: <strong>${g.scoreVal}</strong></span>
          <button class="btn-play">Oyna &rarr;</button>
        </div>
      </div>
    `).join('');
  }

  launchGame(gameId) {
    sound.playClick();
    document.getElementById('home-section').style.display = 'none';
    const gameSection = document.getElementById('game-section');
    gameSection.style.display = 'block';

    const container = document.getElementById('game-canvas-area');
    container.innerHTML = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (gameId) {
      case 'mathDuel':
        this.activeGame = new MathDuelGame(container);
        break;
      case 'robotCode':
        this.activeGame = new RobotCodeGame(container);
        break;
      case 'gravityCannon':
        this.activeGame = new GravityCannonGame(container);
        break;
      case 'scienceMemory':
        this.activeGame = new ScienceMemoryGame(container);
        break;
      case 'scienceQuiz':
        this.activeGame = new ScienceQuizGame(container);
        break;
      case 'solarSystem':
        this.activeGame = new SolarSystemGame(container);
        break;
      case 'wordMaster':
        this.activeGame = new EnglishWordMasterGame(container);
        break;
      default:
        this.showHome();
        return;
    }

    this.activeGame.start();
  }

  openProfileModal() {
    sound.playClick();
    const prof = storage.getProfile();
    this.selectedGrade = prof.grade;
    this.selectedAvatar = prof.avatar;
    const badges = storage.getAllBadges();
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="app.closeModal()"></div>
      <div class="modal-card animate-pop">
        <button class="modal-close" onclick="app.closeModal()">&times;</button>
        
        <h2 class="modal-heading">🧪 Kaşif Laboratuvar Kimliği</h2>
        <p class="modal-sub">Ege Lab profilini ve başarı rozetlerini yönet!</p>

        <form id="profile-form" onsubmit="event.preventDefault(); app.saveProfileForm();">
          <div class="form-row">
            <label>Laboratuvar Adın:</label>
            <input type="text" id="input-name" value="${prof.name}" maxlength="20" required />
          </div>

          <div class="form-row">
            <label>Sınıfın:</label>
            <div class="grade-selector">
              ${['5', '6', '7', '8'].map(g => `
                <button type="button" class="grade-btn ${prof.grade === g ? 'active' : ''}" data-grade="${g}" onclick="app.selectGrade('${g}')">${g}. Sınıf</button>
              `).join('')}
            </div>
          </div>

          <div class="form-row">
            <label>Avatar Seç:</label>
            <div class="avatar-selector">
              ${['🚀', '🔬', '🤖', '⚛️', '🧠', '⚡', '🪐', '🦖', '💻', '💡'].map(av => `
                <button type="button" class="avatar-btn ${prof.avatar === av ? 'active' : ''}" data-avatar="${av}" onclick="app.selectAvatar('${av}')">${av}</button>
              `).join('')}
            </div>
          </div>

          <div class="badges-section">
            <h3>🎖️ Başarı Rozetlerin</h3>
            <div class="badges-grid">
              ${badges.map(b => `
                <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
                  <span class="badge-icon">${b.icon}</span>
                  <strong class="badge-title">${b.title}</strong>
                  <span class="badge-desc">${b.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Kaydet & Kapat</button>
          </div>
        </form>
      </div>
    `;

    modal.style.display = 'flex';
  }

  selectGrade(grade) {
    const btns = document.querySelectorAll('.grade-btn');
    btns.forEach(b => b.classList.toggle('active', b.dataset.grade === grade));
    this.selectedGrade = grade;
  }

  selectAvatar(avatar) {
    const btns = document.querySelectorAll('.avatar-btn');
    btns.forEach(b => b.classList.toggle('active', b.dataset.avatar === avatar));
    this.selectedAvatar = avatar;
  }

  saveProfileForm() {
    const nameInput = document.getElementById('input-name');
    const name = nameInput ? nameInput.value : null;
    const grade = this.selectedGrade || storage.getProfile().grade;
    const avatar = this.selectedAvatar || storage.getProfile().avatar;

    storage.updateProfile(name, grade, avatar);
    sound.playCorrect();
    this.closeModal();
    this.renderHeader();
    this.showToast('✅ Laboratuvar profilin güncellendi!');
  }

  showCreatorGreeting() {
    sound.playCorrect();
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop" onclick="app.closeModal()"></div>
      <div class="modal-card animate-pop" style="text-align: center;">
        <button class="modal-close" onclick="app.closeModal()">&times;</button>
        
        <div style="position: relative; display: inline-block; margin-bottom: 1rem;">
          <img src="img/ege.jpg" alt="Ege Karabek" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid #38bdf8; box-shadow: 0 0 25px rgba(14, 165, 233, 0.6);" />
          <span style="position: absolute; bottom: 5px; right: 5px; background: #facc15; color: #000; font-size: 1.1rem; padding: 2px 6px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" title="Kurucu">👑</span>
        </div>

        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.25rem;">Ege Karabek</h2>
        <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 0.25rem 0.85rem; border-radius: 999px; font-weight: 700; font-size: 0.8rem; margin-bottom: 1.25rem; border: 1px solid rgba(56, 189, 248, 0.3);">
          🧪 Ege Lab'ın Kurucusu & Geliştiricisi
        </span>

        <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem; text-align: left; background: rgba(30, 41, 59, 0.6); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          👋 <strong>Merhaba Arkadaşım!</strong><br><br>
          Ben <strong>Ege Karabek</strong>. <strong>Ege Lab</strong>'ı ortaokul öğrencilerinin hem eğlenip hem de bilim, matematik ve bilişim/kodlama becerilerini geliştirmesi için tasarladım.<br><br>
          Laboratuvarda 5 farklı eğitici oyun seni bekliyor. Deneyim puanları (XP) topla, seviye atla ve rozetleri kazan! İyi eğlenceler! 🚀
        </p>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-primary" onclick="app.closeModal()">🎮 Oyunlara Başla!</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
  }

  showToast(message) {
    const toast = document.getElementById('toast-container');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast-banner show';
    setTimeout(() => {
      toast.className = 'toast-banner';
    }, 3200);
  }
}

const app = new EgeLabApp();
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
