/**
 * Oyun 4: Bilim & Uzay Hafıza Laboratuvarı
 * Fen Bilimleri kavramlarını eşleştirme ve bilgi kartları
 */
class ScienceMemoryGame {
  constructor(container) {
    this.container = container;
    this.cards = [];
    this.flippedCards = [];
    this.matchedCount = 0;
    this.moves = 0;
    this.timer = null;
    this.seconds = 0;
    this.isLocked = false;

    // Bilimsel kart havuzu (Simge, Terim, Kısa Bilgi)
    this.cardPool = [
      { icon: '🪐', name: 'Satürn', fact: 'Göz alıcı devasa halkalarıyla ünlüdür.' },
      { icon: '☀️', name: 'Güneş', fact: 'Samanyolu\'ndaki orta büyüklükte bir plazma yıldızıdır.' },
      { icon: '🧬', name: 'DNA', fact: 'Hücrenin genetik bilgi ve yönetici molekülüdür.' },
      { icon: '🔬', name: 'Mikroskop', fact: 'Gözle görülemeyen mikroorganizmaları inceler.' },
      { icon: '⚡', name: 'Mitokondri', fact: 'Hücrenin oksijenli solunumla enerji üreten santralidir.' },
      { icon: '🌿', name: 'Kloroplast', fact: 'Bitkilerde fotosentez yaparak besin ve oksijen üretir.' },
      { icon: '🧲', name: 'Manyetizma', fact: 'Zıt kutuplar birbirini çeker, aynı kutuplar iter.' },
      { icon: '⚛️', name: 'Atom', fact: 'Maddenin proton, nötron ve elektrondan oluşan yapı taşı.' },
      { icon: '🧪', name: 'Deney Tüpü', fact: 'Kimyasal çözelti ve reaksiyonların incelendiği kap.' },
      { icon: '🌍', name: 'Dünya', fact: 'Üzerinde sıvı su ve yaşam barındıran mavi gezegen.' }
    ];
  }

  start() {
    this.moves = 0;
    this.seconds = 0;
    this.matchedCount = 0;
    this.flippedCards = [];
    this.isLocked = false;
    storage.unlockBadge('first_step');

    this.setupDeck();
    this.render();
    this.startTimer();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.seconds++;
      const timeEl = this.container.querySelector('#mem-time');
      if (timeEl) timeEl.textContent = `${this.seconds}s`;
    }, 1000);
  }

  setupDeck() {
    // 6 çift seç (12 kart)
    const selected = [...this.cardPool].sort(() => Math.random() - 0.5).slice(0, 6);
    const deck = [];

    selected.forEach((item, index) => {
      deck.push({ ...item, pairId: index, uid: `${index}-a` });
      deck.push({ ...item, pairId: index, uid: `${index}-b` });
    });

    this.cards = deck.sort(() => Math.random() - 0.5);
  }

  handleCardClick(cardIndex) {
    if (this.isLocked) return;
    const cardObj = this.cards[cardIndex];
    const cardEl = this.container.querySelector(`[data-index="${cardIndex}"]`);

    if (!cardEl || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
      return;
    }

    sound.playClick();
    cardEl.classList.add('flipped');
    this.flippedCards.push({ index: cardIndex, obj: cardObj, el: cardEl });

    if (this.flippedCards.length === 2) {
      this.moves++;
      const moveEl = this.container.querySelector('#mem-moves');
      if (moveEl) moveEl.textContent = this.moves;

      const [first, second] = this.flippedCards;

      if (first.obj.pairId === second.obj.pairId) {
        // Eşleşti!
        sound.playCorrect();
        first.el.classList.add('matched');
        second.el.classList.add('matched');
        this.matchedCount++;
        this.flippedCards = [];

        this.showFact(first.obj);

        if (this.matchedCount === 6) {
          this.gameWon();
        }
      } else {
        // Yanlış eşleşme
        this.isLocked = true;
        sound.playWrong();
        setTimeout(() => {
          first.el.classList.remove('flipped');
          second.el.classList.remove('flipped');
          this.flippedCards = [];
          this.isLocked = false;
        }, 900);
      }
    }
  }

  showFact(item) {
    const factBox = this.container.querySelector('#mem-fact-banner');
    if (factBox) {
      factBox.innerHTML = `<strong>💡 ${item.name}:</strong> ${item.fact}`;
      factBox.classList.add('pulse-glow');
      setTimeout(() => factBox.classList.remove('pulse-glow'), 1500);
    }
  }

  gameWon() {
    this.stop();
    sound.playVictory();

    // Puan hesabı: Süre ve hamle ne kadar azsa o kadar yüksek puan
    const score = Math.max(1000 - (this.seconds * 10) - (this.moves * 15), 150);
    storage.updateScore('scienceMemory', score);
    storage.unlockBadge('memory_master');
    storage.addXP(50);

    setTimeout(() => {
      this.container.innerHTML = `
        <div class="game-over-card animate-pop">
          <div class="game-over-icon">🧠</div>
          <h2>Hafıza Tamamlandı!</h2>
          <p class="final-score">Puanın: <span>${score}</span></p>
          <p class="stats-summary">${this.seconds} saniyede ve ${this.moves} hamlede bitirdin!</p>
          <div class="game-over-actions">
            <button class="btn btn-primary" id="mem-retry-btn">Yeniden Oyna</button>
            <button class="btn btn-secondary" onclick="app.showHome()">Ana Menüye Dön</button>
          </div>
        </div>
      `;

      const btn = this.container.querySelector('#mem-retry-btn');
      if (btn) btn.onclick = () => this.start();
    }, 600);
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper memory-view">
        <div class="game-top-bar">
          <div class="stat-pill"><span class="stat-label">Süre:</span> <strong id="mem-time">${this.seconds}s</strong></div>
          <div class="stat-pill"><span class="stat-label">Hamle:</span> <strong id="mem-moves">${this.moves}</strong></div>
          <div class="stat-pill"><span class="stat-label">Eşleşen:</span> <strong>${this.matchedCount}/6</strong></div>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <div id="mem-fact-banner" class="memory-fact-banner">
          💡 Kartları çevir ve Fen Bilgisi kavramlarını eşleştir!
        </div>

        <div class="memory-grid">
          ${this.cards.map((c, i) => `
            <div class="memory-card" data-index="${i}">
              <div class="card-inner">
                <div class="card-front">🧪</div>
                <div class="card-back">
                  <div class="card-back-icon">${c.icon}</div>
                  <div class="card-back-text">${c.name}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const cardElements = this.container.querySelectorAll('.memory-card');
    cardElements.forEach(card => {
      card.onclick = () => {
        const idx = parseInt(card.dataset.index, 10);
        this.handleCardClick(idx);
      };
    });
  }
}
