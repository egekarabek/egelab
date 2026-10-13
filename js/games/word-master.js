/**
 * Oyun 7: İngilizce Kelime Laboratuvarı (Word Master - 15 Kartlı Görev)
 * Ortaokul İngilizce müfredatına ve günlük bilim/macera/teknoloji temalarına uygun
 * 15 Kartlık etkileşimli telaffuzlu kelime oyunu.
 */
class EnglishWordMasterGame {
  constructor(container) {
    this.container = container;
    this.currentIndex = 0;
    this.totalCards = 15;
    this.cards = [];
    this.score = 0;
    this.streak = 0;
    this.correctCount = 0;
    this.history = []; // { word, tr, icon, correct }
    this.usedFiftyFifty = false;
    this.usedHint = false;

    // 80+ Ortaokul Düzeyi Zengin Kelime Havuzu
    this.vocabularyPool = [
      {
        word: "Discover",
        tr: "Keşfetmek",
        icon: "🧭",
        phonetic: "/dɪˈskʌvər/",
        sentence: "Scientists discover new secrets in deep space.",
        options: ["Keşfetmek", "Unutmak", "Korumak", "Korkmak"],
        grade: "5-6"
      },
      {
        word: "Scientist",
        tr: "Bilim İnsanı",
        icon: "🔬",
        phonetic: "/ˈsaɪəntɪst/",
        sentence: "Ege wants to be a great scientist in the future.",
        options: ["Öğretmen", "Bilim İnsanı", "Mühendis", "Kaptan"],
        grade: "5-6"
      },
      {
        word: "Spacecraft",
        tr: "Uzay Aracı",
        icon: "🚀",
        phonetic: "/ˈspeɪskrɑːft/",
        sentence: "The spacecraft landed safely on the red surface of Mars.",
        options: ["Hava Balonu", "Uzay Aracı", "Denizaltı", "Yolcu Gemisi"],
        grade: "6-7"
      },
      {
        word: "Gravity",
        tr: "Yerçekimi",
        icon: "🍏",
        phonetic: "/ˈɡrævəti/",
        sentence: "The Moon has less gravity than the Earth.",
        options: ["Rüzgar Gücü", "Yerçekimi", "Hava Basıncı", "Sıcaklık"],
        grade: "6-7"
      },
      {
        word: "Invention",
        tr: "İcat / Buluş",
        icon: "💡",
        phonetic: "/ɪnˈvenʃn/",
        sentence: "The telescope is one of the most important inventions.",
        options: ["Fikir", "İcat / Buluş", "Kitap", "Gelenek"],
        grade: "6-8"
      },
      {
        word: "Protect",
        tr: "Korumak",
        icon: "🛡️",
        phonetic: "/prəˈtekt/",
        sentence: "We must protect our environment and planet.",
        options: ["Kirletmek", "Korumak", "Terk etmek", "Yıkmak"],
        grade: "5-7"
      },
      {
        word: "Environment",
        tr: "Çevre / Doğa",
        icon: "🌱",
        phonetic: "/ɪnˈvaɪrənmənt/",
        sentence: "Trees are essential for a clean and green environment.",
        options: ["Fabrika", "Şehir Merkezi", "Çevre / Doğa", "Bina"],
        grade: "6-8"
      },
      {
        word: "Curious",
        tr: "Meraklı",
        icon: "🧐",
        phonetic: "/ˈkjʊəriəs/",
        sentence: "Curious students always ask interesting questions.",
        options: ["Tembel", "Sessiz", "Kızgın", "Meraklı"],
        grade: "5-7"
      },
      {
        word: "Challenge",
        tr: "Meydan Okuma / Zorluk",
        icon: "⚡",
        phonetic: "/ˈtʃælɪndʒ/",
        sentence: "Solving math puzzles is an exciting challenge.",
        options: ["Kolaylık", "Meydan Okuma / Zorluk", "Eğlence", "Şaka"],
        grade: "7-8"
      },
      {
        word: "Journey",
        tr: "Yolculuk / Seyahat",
        icon: "🗺️",
        phonetic: "/ˈdʒɜːni/",
        sentence: "Our space journey to Mars takes about seven months.",
        options: ["Yolculuk / Seyahat", "Dinlenme", "Durak", "Kaza"],
        grade: "5-7"
      },
      {
        word: "Knowledge",
        tr: "Bilgi",
        icon: "📚",
        phonetic: "/ˈnɒlɪdʒ/",
        sentence: "Reading science books increases your knowledge.",
        options: ["Hafıza", "Bilgi", "Yetenek", "Hayal"],
        grade: "6-8"
      },
      {
        word: "Future",
        tr: "Gelecek",
        icon: "🔮",
        phonetic: "/ˈfjuːtʃər/",
        sentence: "Robotics and artificial intelligence will shape the future.",
        options: ["Geçmiş", "Şimdiki Zaman", "Gelecek", "Günün Sonu"],
        grade: "5-7"
      },
      {
        word: "Energy",
        tr: "Enerji",
        icon: "⚡",
        phonetic: "/ˈenədʒi/",
        sentence: "Solar panels convert sunlight into clean energy.",
        options: ["Isı", "Enerji", "Işık", "Kuvvet"],
        grade: "5-8"
      },
      {
        word: "Experiment",
        tr: "Deney",
        icon: "🧪",
        phonetic: "/ɪkˈsperɪmənt/",
        sentence: "We did an interesting chemistry experiment in the lab.",
        options: ["Sınav", "Ders Notu", "Deney", "Ödev"],
        grade: "5-7"
      },
      {
        word: "Recycle",
        tr: "Geri Dönüştürmek",
        icon: "♻️",
        phonetic: "/ˌriːˈsaɪkl/",
        sentence: "Please recycle plastic bottles to save the oceans.",
        options: ["Çöpe Atmak", "Satın Almak", "Kullanmak", "Geri Dönüştürmek"],
        grade: "5-7"
      },
      {
        word: "Develop",
        tr: "Geliştirmek",
        icon: "📈",
        phonetic: "/dɪˈveləp/",
        sentence: "Coders develop clever algorithms to solve problems.",
        options: ["Kapatmak", "Geliştirmek", "Durdurmak", "Unutmak"],
        grade: "6-8"
      },
      {
        word: "Universe",
        tr: "Evren",
        icon: "🌌",
        phonetic: "/ˈjuːnɪvɜːs/",
        sentence: "The universe contains billions of galaxies and stars.",
        options: ["Dünya", "Güneş Sistemi", "Evren", "Samanyolu"],
        grade: "6-8"
      },
      {
        word: "Telescope",
        tr: "Teleskop",
        icon: "🔭",
        phonetic: "/ˈtelɪskəʊp/",
        sentence: "Galileo looked at the moons of Jupiter with a telescope.",
        options: ["Büyüteç", "Mikroskop", "Teleskop", "Gözlük"],
        grade: "5-7"
      },
      {
        word: "Satellite",
        tr: "Uydu",
        icon: "🛰️",
        phonetic: "/ˈsætəlaɪt/",
        sentence: "The Moon is the natural satellite of planet Earth.",
        options: ["Yıldız", "Uydu", "Göktaşı", "Gezegen"],
        grade: "6-8"
      },
      {
        word: "Orbit",
        tr: "Yörünge / Yörüngede Dönmek",
        icon: "🪐",
        phonetic: "/ˈɔːbɪt/",
        sentence: "Planets orbit around the Sun in elliptical paths.",
        options: ["Çarpışmak", "Düşmek", "Yörünge / Yörüngede Dönmek", "Işık Saçmak"],
        grade: "6-8"
      },
      {
        word: "Courage",
        tr: "Cesaret",
        icon: "🦁",
        phonetic: "/ˈkʌrɪdʒ/",
        sentence: "Astronauts need great courage to travel into the unknown.",
        options: ["Korku", "Cesaret", "Heyecan", "Sabır"],
        grade: "6-8"
      },
      {
        word: "Improve",
        tr: "İlerletmek / İyileştirmek",
        icon: "🚀",
        phonetic: "/ɪmˈpruːv/",
        sentence: "Practicing English every day will improve your fluency.",
        options: ["Geriletmek", "Bitirmek", "İlerletmek / İyileştirmek", "Zorlaştırmak"],
        grade: "6-8"
      },
      {
        word: "Observe",
        tr: "Gözlemlemek",
        icon: "👀",
        phonetic: "/əbˈzɜːv/",
        sentence: "Astronomers observe distant stars during the night.",
        options: ["Tahmin Etmek", "Gözlemlemek", "Dinlemek", "Hesaplamak"],
        grade: "6-8"
      },
      {
        word: "Solution",
        tr: "Çözüm",
        icon: "🔑",
        phonetic: "/səˈluːʃn/",
        sentence: "Teamwork helped us find the best solution.",
        options: ["Engel", "Problem", "Çözüm", "Kavga"],
        grade: "6-8"
      },
      {
        word: "Imagine",
        tr: "Hayal Etmek",
        icon: "💭",
        phonetic: "/ɪˈmædʒɪn/",
        sentence: "Can you imagine living in a colony on Mars?",
        options: ["Korkmak", "İtiraf Etmek", "Hayal Etmek", "Gerçekleştirmek"],
        grade: "5-7"
      },
      {
        word: "Ancient",
        tr: "Antik / Çok Eski",
        icon: "🏛️",
        phonetic: "/ˈeɪnʃənt/",
        sentence: "Ancient civilizations studied the motion of stars.",
        options: ["Modern", "Antik / Çok Eski", "Gelecekteki", "Hızlı"],
        grade: "6-8"
      },
      {
        word: "Measure",
        tr: "Ölçmek",
        icon: "📏",
        phonetic: "/ˈmeʒər/",
        sentence: "Use a thermometer to measure the temperature of water.",
        options: ["Isıtmak", "Doldurmak", "Ölçmek", "Karıştırmak"],
        grade: "5-7"
      },
      {
        word: "Habitat",
        tr: "Yaşam Alanı / Doğal Ortam",
        icon: "🌳",
        phonetic: "/ˈhæbɪtæt/",
        sentence: "Rainforests are the natural habitat of many animals.",
        options: ["Havaalanı", "Şehir", "Hayvanat Bahçesi", "Yaşam Alanı / Doğal Ortam"],
        grade: "7-8"
      },
      {
        word: "Success",
        tr: "Başarı",
        icon: "🏆",
        phonetic: "/səkˈses/",
        sentence: "Hard work and dedication lead to great success.",
        options: ["Yenilgi", "Başarı", "Keder", "Tembellik"],
        grade: "5-8"
      },
      {
        word: "Atmosphere",
        tr: "Atmosfer / Hava Tabakası",
        icon: "☁️",
        phonetic: "/ˈætməsfɪər/",
        sentence: "The atmosphere protects living things from solar radiation.",
        options: ["Okyanus", "Yerkabuğu", "Atmosfer / Hava Tabakası", "Çekirdek"],
        grade: "6-8"
      },
      {
        word: "Oxygen",
        tr: "Oksijen",
        icon: "💨",
        phonetic: "/ˈɒksɪdʒən/",
        sentence: "Human beings breathe in oxygen to stay alive.",
        options: ["Karbondioksit", "Azot", "Oksijen", "Helyum"],
        grade: "5-7"
      },
      {
        word: "Device",
        tr: "Alet / Cihaz",
        icon: "📱",
        phonetic: "/dɪˈvaɪs/",
        sentence: "A smartphone is an electronic communication device.",
        options: ["Kıyafet", "Alet / Cihaz", "Yemek", "Oyun"],
        grade: "6-8"
      },
      {
        word: "Skill",
        tr: "Beceri / Yetenek",
        icon: "🎯",
        phonetic: "/skɪl/",
        sentence: "Coding is an invaluable skill in the modern world.",
        options: ["Hata", "Zaman", "Beceri / Yetenek", "Korku"],
        grade: "6-8"
      },
      {
        word: "Danger",
        tr: "Tehlike",
        icon: "⚠️",
        phonetic: "/ˈdeɪndʒər/",
        sentence: "Toxic waste is a serious danger to marine life.",
        options: ["Güvenlik", "Tehlike", "Huzur", "Sağlık"],
        grade: "5-7"
      },
      {
        word: "Calculate",
        tr: "Hesaplamak",
        icon: "🧮",
        phonetic: "/ˈkælkjuleɪt/",
        sentence: "Computers can calculate complex equations in seconds.",
        options: ["Çizmek", "Yazmak", "Hesaplamak", "Okumak"],
        grade: "6-8"
      },
      {
        word: "Mystery",
        tr: "Gizem / Sır",
        icon: "🕵️",
        phonetic: "/ˈmɪstəri/",
        sentence: "Black holes are still a fascinating mystery of astrophysics.",
        options: ["Gerçek", "Gizem / Sır", "Aydınlık", "Haber"],
        grade: "6-8"
      },
      {
        word: "Teamwork",
        tr: "Takım Çalışması",
        icon: "🤝",
        phonetic: "/ˈtiːmwɜːk/",
        sentence: "Good teamwork makes big science projects possible.",
        options: ["Yalnızlık", "Takım Çalışması", "Yarış", "Tartışma"],
        grade: "5-8"
      },
      {
        word: "Victory",
        tr: "Zafer / Galibiyet",
        icon: "✌️",
        phonetic: "/ˈvɪktəri/",
        sentence: "The lab team celebrated their scientific victory.",
        options: ["Zafer / Galibiyet", "Kaybediş", "Mola", "Bekleyiş"],
        grade: "5-8"
      },
      {
        word: "Resource",
        tr: "Kaynak",
        icon: "💎",
        phonetic: "/rɪˈsɔːs/",
        sentence: "Water is our most precious natural resource.",
        options: ["Atık", "Fabrika", "Engel", "Kaynak"],
        grade: "7-8"
      },
      {
        word: "Climate",
        tr: "İklim",
        icon: "☀️",
        phonetic: "/ˈklaɪmət/",
        sentence: "Climate change affects animals in the polar regions.",
        options: ["Hava Durumu", "İklim", "Mevsim", "Sıcaklık"],
        grade: "6-8"
      }
    ];
  }

  start() {
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.correctCount = 0;
    this.history = [];
    this.usedFiftyFifty = false;
    this.usedHint = false;

    // Havuzdan 15 rastgele benzersiz kart seç
    this.cards = this.selectRandomCards(this.totalCards);

    storage.unlockBadge('first_step');
    this.render();
    this.loadCard(this.currentIndex);
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  selectRandomCards(count) {
    const shuffled = [...this.vocabularyPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(card => {
      // Şıkları karıştır
      const shuffledOptions = [...card.options].sort(() => Math.random() - 0.5);
      return {
        ...card,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(card.tr)
      };
    });
  }

  speakCurrentWord() {
    const card = this.cards[this.currentIndex];
    if (!card) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Net ve anlaşılır okuma
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  loadCard(index) {
    if (index >= this.totalCards) {
      this.finishGame();
      return;
    }

    const card = this.cards[index];
    const cardNumEl = this.container.querySelector('#word-card-num');
    const wordEl = this.container.querySelector('#word-title-text');
    const iconEl = this.container.querySelector('#word-icon-display');
    const phoneticEl = this.container.querySelector('#word-phonetic-text');
    const sentenceEl = this.container.querySelector('#word-sentence-text');
    const optionsContainer = this.container.querySelector('#word-options-grid');
    const progressBar = this.container.querySelector('#word-progress-bar');
    const gradeBadge = this.container.querySelector('#word-grade-badge');

    // İlerleme Çubuğu (%0 - %100)
    const progressPerc = ((index) / this.totalCards) * 100;
    if (progressBar) progressBar.style.width = `${progressPerc}%`;

    if (cardNumEl) cardNumEl.textContent = `Kart ${index + 1} / ${this.totalCards}`;
    if (wordEl) wordEl.textContent = card.word;
    if (iconEl) iconEl.textContent = card.icon;
    if (phoneticEl) phoneticEl.textContent = card.phonetic;
    if (sentenceEl) {
      sentenceEl.innerHTML = `&ldquo;${card.sentence.replace(new RegExp(`\\b${card.word}\\b`, 'gi'), `<strong>${card.word}</strong>`)}&rdquo;`;
      sentenceEl.style.display = this.usedHint ? 'block' : 'none'; // İpucu ile açılır veya gizli kalır
    }
    if (gradeBadge) gradeBadge.textContent = `${card.grade}. Sınıf Düzeyi`;

    // Seçenekleri oluştur
    if (optionsContainer) {
      optionsContainer.innerHTML = card.options.map((opt, idx) => `
        <button class="word-option-btn" data-index="${idx}" onclick="app.activeGame.checkAnswer(${idx})">
          <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
          <span class="opt-text">${opt}</span>
        </button>
      `).join('');
    }

    // Kart açıldığında otomatik İngilizce oku
    setTimeout(() => {
      this.speakCurrentWord();
    }, 200);
  }

  checkAnswer(selectedIdx) {
    const card = this.cards[this.currentIndex];
    const buttons = this.container.querySelectorAll('.word-option-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selectedIdx === card.correctIndex;

    if (isCorrect) {
      buttons[selectedIdx].classList.add('correct');
      sound.playCorrect();
      this.correctCount++;
      this.streak++;
      const bonus = this.streak > 1 ? this.streak * 10 : 0;
      this.score += 50 + bonus;

      this.history.push({
        word: card.word,
        tr: card.tr,
        icon: card.icon,
        phonetic: card.phonetic,
        correct: true
      });
    } else {
      buttons[selectedIdx].classList.add('wrong');
      buttons[card.correctIndex].classList.add('correct');
      sound.playWrong();
      this.streak = 0;

      this.history.push({
        word: card.word,
        tr: card.tr,
        icon: card.icon,
        phonetic: card.phonetic,
        correct: false
      });
    }

    this.updateStatsUI();

    // 1.3 saniye sonra sonraki karta geç
    setTimeout(() => {
      this.currentIndex++;
      this.usedHint = false;
      this.loadCard(this.currentIndex);
    }, 1300);
  }

  updateStatsUI() {
    const scoreEl = this.container.querySelector('#word-score-val');
    const streakEl = this.container.querySelector('#word-streak-val');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) {
      streakEl.textContent = this.streak > 1 ? `${this.streak}x Kombo!` : this.streak;
      streakEl.classList.toggle('active', this.streak > 1);
    }
  }

  useFiftyFifty() {
    if (this.usedFiftyFifty) return;
    const card = this.cards[this.currentIndex];
    const buttons = Array.from(this.container.querySelectorAll('.word-option-btn'));
    
    // Yanlış olanlardan rastgele 2 tanesini ele
    const wrongButtons = buttons.filter(b => parseInt(b.dataset.index, 10) !== card.correctIndex);
    const toEliminate = wrongButtons.sort(() => Math.random() - 0.5).slice(0, 2);

    toEliminate.forEach(b => {
      b.style.opacity = '0.25';
      b.disabled = true;
      b.style.pointerEvents = 'none';
    });

    this.usedFiftyFifty = true;
    sound.playClick();
    const btn = this.container.querySelector('#btn-word-joker-50');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('used');
    }
  }

  useHint() {
    if (this.usedHint) return;
    const sentenceEl = this.container.querySelector('#word-sentence-text');
    if (sentenceEl) {
      sentenceEl.style.display = 'block';
      sentenceEl.classList.add('animate-pop');
    }
    this.usedHint = true;
    sound.playClick();
    const btn = this.container.querySelector('#btn-word-joker-hint');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('used');
    }
  }

  finishGame() {
    this.stop();
    sound.playVictory();

    const isNewHigh = storage.updateScore('wordMaster', this.score);
    const earnedXP = this.correctCount * 15;
    storage.addXP(earnedXP);

    if (this.correctCount >= 12) {
      storage.unlockBadge('word_wizard');
    }

    const accuracyPerc = Math.round((this.correctCount / this.totalCards) * 100);

    this.container.innerHTML = `
      <div class="game-wrapper word-game-finish animate-pop">
        <div style="text-align:center; margin-bottom:1.2rem;">
          <div style="font-size:3.5rem; margin-bottom:0.4rem;">🎉</div>
          <h2 style="font-size:1.8rem; font-weight:800; color:#fff;">15 Kartlık Görev Tamamlandı!</h2>
          <p style="font-size:0.95rem; color:#94a3b8;">Harika iş! Kelime dağarcığını geliştirdin.</p>
        </div>

        <!-- Skor Rozetleri -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.75rem; margin-bottom:1.5rem;">
          <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.08); padding:0.75rem; border-radius:12px; text-align:center;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Doğru / Kart</span>
            <strong style="font-size:1.3rem; color:#38bdf8;">${this.correctCount} / 15</strong>
          </div>
          <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.08); padding:0.75rem; border-radius:12px; text-align:center;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Başarı Oranı</span>
            <strong style="font-size:1.3rem; color:#10b981;">%${accuracyPerc}</strong>
          </div>
          <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.08); padding:0.75rem; border-radius:12px; text-align:center;">
            <span style="font-size:0.75rem; color:#94a3b8; display:block;">Kazanılan XP</span>
            <strong style="font-size:1.3rem; color:#f59e0b;">+${earnedXP} XP</strong>
          </div>
        </div>

        ${isNewHigh ? '<div class="new-high-badge" style="text-align:center; margin-bottom:1rem; padding:0.5rem; background:rgba(245,158,11,0.2); border:1px solid #f59e0b; border-radius:8px; color:#fde047; font-weight:700;">🎉 YENİ EN YÜKSEK SKOR: ' + this.score + ' PUAN!</div>' : ''}

        <!-- 15 Kartın Kelime İnceleme Listesi (Vocabulary Review) -->
        <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1rem; margin-bottom:1.5rem;">
          <h3 style="font-size:1.05rem; font-weight:700; color:#38bdf8; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
            📖 Bu Oyunda Karşılaştığın 15 Kelime
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.6rem; max-height:260px; overflow-y:auto; padding-right:4px;">
            ${this.history.map(item => `
              <div style="background:rgba(30,41,59,0.6); border:1px solid ${item.correct ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}; border-radius:10px; padding:0.5rem 0.75rem; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span style="font-size:1.1rem;">${item.icon}</span>
                  <div>
                    <strong style="font-size:0.88rem; color:#fff; display:block;">${item.word}</strong>
                    <span style="font-size:0.74rem; color:#94a3b8;">${item.tr}</span>
                  </div>
                </div>
                <button onclick="app.activeGame.speakCustomWord('${item.word}')" style="background:none; border:none; color:#38bdf8; font-size:1.1rem; cursor:pointer;" title="Telaffuzu Dinle">🔊</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; justify-content:center;">
          <button class="btn btn-primary" onclick="app.activeGame.start()">🔄 Yeni 15 Kart İle Oyna</button>
          <button class="btn btn-secondary" onclick="app.showHome()">🏠 Ana Menüye Dön</button>
        </div>
      </div>
    `;
  }

  speakCustomWord(word) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper word-master-view animate-pop">
        
        <!-- Üst Bar: İlerleme ve Skor -->
        <div class="game-top-bar" style="margin-bottom:0.75rem;">
          <div class="stat-pill">
            <span class="stat-label">🃏 İlerleme:</span>
            <strong id="word-card-num" style="color:#38bdf8;">Kart 1 / 15</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-label">🏆 Skor:</span>
            <strong id="word-score-val" style="color:#f59e0b;">0</strong>
          </div>
          <div class="stat-pill">
            <span class="stat-label">🔥 Seri:</span>
            <strong id="word-streak-val">0</strong>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <!-- Kart İlerleme Çubuğu -->
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:99px; margin-bottom:1.25rem; overflow:hidden;">
          <div id="word-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #38bdf8, #818cf8, #a855f7); transition:width 0.3s ease;"></div>
        </div>

        <!-- 15 Kartlık Ana Flashcard Alanı -->
        <div class="word-card-hero">
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:0.5rem;">
            <span id="word-grade-badge" class="word-grade-badge">6. Sınıf Düzeyi</span>
            <div style="display:flex; gap:0.4rem;">
              <button id="btn-word-joker-50" class="word-joker-btn" onclick="app.activeGame.useFiftyFifty()" title="2 Yanlış Şıkkı Ele">
                ✂️ %50 Ele
              </button>
              <button id="btn-word-joker-hint" class="word-joker-btn" onclick="app.activeGame.useHint()" title="Örnek Cümle İpucunu Göster">
                💡 İpucu
              </button>
            </div>
          </div>

          <div class="word-center-hero">
            <span id="word-icon-display" class="word-hero-icon">🧭</span>
            
            <div class="word-audio-header">
              <h2 id="word-title-text" class="word-hero-title">Discover</h2>
              <button class="word-speaker-btn" onclick="app.activeGame.speakCurrentWord()" title="Telaffuzu Dinle (Speech)">
                🔊
              </button>
            </div>

            <span id="word-phonetic-text" class="word-hero-phonetic">/dɪˈskʌvər/</span>
          </div>

          <!-- İpucu / Örnek Cümle (İsteğe bağlı gösterilir) -->
          <div id="word-sentence-text" class="word-hero-sentence" style="display:none;"></div>
        </div>

        <div style="margin-top:1.2rem; text-align:center; font-size:0.85rem; color:#94a3b8; margin-bottom:0.6rem;">
          🇬🇧 Bu kelimenin Türkçe karşılığı hangisidir?
        </div>

        <!-- 4 Şık Izgarası -->
        <div id="word-options-grid" class="word-options-grid">
          <!-- JS ile doldurulacak -->
        </div>

      </div>
    `;
  }
}
