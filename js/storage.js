/**
 * Ege Lab - Veri ve İlerleme Yöneticisi (LocalStorage)
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'egelab_profile_data';
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Veri yüklenemedi:', e);
    }

    return {
      name: 'Genç Kaşif',
      grade: '6', // 5, 6, 7, 8
      avatar: '🚀',
      xp: 0,
      level: 1,
      scores: {
        mathDuel: 0,
        robotCode: 1,
        gravityCannon: 0,
        scienceMemory: 0,
        scienceQuiz: 0,
        wordMaster: 0,
        calculator: 0
      },
      badges: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Veri kaydedilemedi:', e);
    }
  }

  getProfile() {
    return this.data;
  }

  updateProfile(name, grade, avatar) {
    if (name) this.data.name = name.trim();
    if (grade) this.data.grade = grade;
    if (avatar) this.data.avatar = avatar;
    this.save();
  }

  addXP(amount) {
    this.data.xp += amount;
    const oldLevel = this.data.level;
    this.data.level = this.calculateLevel(this.data.xp);
    this.save();
    return {
      leveledUp: this.data.level > oldLevel,
      currentLevel: this.data.level,
      title: this.getLevelTitle(this.data.level)
    };
  }

  calculateLevel(xp) {
    // Seviye formülü: her 250 XP 1 seviye atlatır
    return Math.floor(xp / 250) + 1;
  }

  getLevelTitle(level) {
    const titles = [
      'Meraklı Çırak',
      'Laboratuvar Asistanı',
      'Genç Kaşif',
      'Deney Ustası',
      'Kıdemli Araştırmacı',
      'Geleceğin Bilim İnsanı',
      'Ege Lab Baş Mucidi'
    ];
    if (level <= titles.length) {
      return titles[level - 1];
    }
    return `Efsanevi Kaşif Seviye ${level}`;
  }

  updateScore(gameId, score) {
    if (!this.data.scores[gameId] || score > this.data.scores[gameId]) {
      this.data.scores[gameId] = score;
      this.save();
      return true; // Yeni rekor!
    }
    return false;
  }

  getHighScore(gameId) {
    return this.data.scores[gameId] || 0;
  }

  unlockBadge(badgeId) {
    if (!this.data.badges.includes(badgeId)) {
      this.data.badges.push(badgeId);
      this.save();
      return true;
    }
    return false;
  }

  hasBadge(badgeId) {
    return this.data.badges.includes(badgeId);
  }

  getAllBadges() {
    const badgeDefinitions = [
      { id: 'first_step', title: 'İlk Deney', desc: 'Ege Lab içinde ilk oyununu oyna', icon: '🧪' },
      { id: 'math_champ', title: 'Sayı Ustası', desc: 'Matematik Arenası\'nda 500 puanı aş', icon: '⚡' },
      { id: 'code_hacker', title: 'Robot Fısıldayan', desc: 'Robotik Kodlama\'da Seviye 3\'e ulaş', icon: '🤖' },
      { id: 'gravity_ace', title: 'Fizik Dehası', desc: 'Yerçekimi Topu\'nda 300 puan topla', icon: '🎯' },
      { id: 'memory_master', title: 'Süper Bellek', desc: 'Uzay Hafıza Lab\'ını başarıyla tamamla', icon: '🧠' },
      { id: 'quiz_genius', title: 'Bilim Dehası', desc: 'Bilim Sınavında 5 soruyu doğru yanıtla', icon: '🏆' },
      { id: 'solar_explorer', title: 'Güneş Sistemi Kaşifi', desc: 'Güneş Sistemi 3D Laboratuvarında gezegenleri keşfet', icon: '🌌' },
      { id: 'cosmic_master', title: 'Kozmik Bilgin', desc: 'Güneş Sistemi Bilgi Testini başarıyla tamamla', icon: '🪐' },
      { id: 'word_wizard', title: 'Kelime Büyücüsü', desc: 'İngilizce Kelime Lab\'ında 15 kartlık görevi başarıyla tamamla', icon: '🇬🇧' },
      { id: 'calc_master', title: 'Hesap Dehası', desc: 'Laboratuvar hesap makinesi ve matematik araçlarında 10 işlem veya bilimsel dönüşüm yap', icon: '🧮' }
    ];

    return badgeDefinitions.map(b => ({
      ...b,
      unlocked: this.hasBadge(b.id)
    }));
  }
}

const storage = new StorageManager();
