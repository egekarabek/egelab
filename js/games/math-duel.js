/**
 * Oyun 1: Hızlı Matematik Düellosu (Sayı Fırtınası)
 * Ortaokul müfredatına (5-8. sınıf) uygun dinamik sorular
 */
class MathDuelGame {
  constructor(container) {
    this.container = container;
    this.timer = null;
    this.timeLeft = 45;
    this.score = 0;
    this.combo = 1;
    this.currentQuestion = null;
    this.grade = storage.getProfile().grade || '6';
    this.isPlaying = false;
  }

  start() {
    this.score = 0;
    this.combo = 1;
    this.timeLeft = 45;
    this.isPlaying = true;
    storage.unlockBadge('first_step');

    this.render();
    this.nextQuestion();
    this.startTimer();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      const timeEl = this.container.querySelector('#math-time');
      if (timeEl) timeEl.textContent = this.timeLeft;

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  generateQuestion() {
    const gradeNum = parseInt(this.grade, 10) || 6;
    const types = ['basic', 'order', 'exponent', 'equation', 'percentage'];
    
    // Sınıf seviyesine göre soru tipi seçimi
    let selectedType = 'basic';
    if (gradeNum === 5) {
      selectedType = Math.random() < 0.6 ? 'basic' : 'order';
    } else if (gradeNum === 6) {
      const pool = ['basic', 'order', 'exponent'];
      selectedType = pool[Math.floor(Math.random() * pool.length)];
    } else if (gradeNum === 7) {
      const pool = ['order', 'exponent', 'equation', 'percentage'];
      selectedType = pool[Math.floor(Math.random() * pool.length)];
    } else {
      // 8. Sınıf
      const pool = ['exponent', 'equation', 'percentage', 'square'];
      selectedType = pool[Math.floor(Math.random() * pool.length)];
    }

    let questionText = '';
    let correctAnswer = 0;

    switch (selectedType) {
      case 'exponent': {
        const base = Math.floor(Math.random() * 6) + 2; // 2..7
        const exp = base > 4 ? 2 : Math.floor(Math.random() * 2) + 2; // 2..3
        questionText = `${base}<sup>${exp}</sup> = ?`;
        correctAnswer = Math.pow(base, exp);
        break;
      }
      case 'equation': {
        // ax + b = c  => x=?
        const x = Math.floor(Math.random() * 9) + 2;
        const a = Math.floor(Math.random() * 4) + 2;
        const b = Math.floor(Math.random() * 15) + 3;
        const c = a * x + b;
        questionText = `${a}x + ${b} = ${c}  &rarr;  x = ?`;
        correctAnswer = x;
        break;
      }
      case 'percentage': {
        const perc = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        const mult = Math.floor(Math.random() * 8) + 2;
        const total = (100 / perc) * mult * 10;
        questionText = `${total}'ün %${perc}'i kaçtır?`;
        correctAnswer = (total * perc) / 100;
        break;
      }
      case 'square': {
        const roots = [16, 25, 36, 49, 64, 81, 100, 121, 144];
        const val = roots[Math.floor(Math.random() * roots.length)];
        const add = Math.floor(Math.random() * 12) + 1;
        questionText = `&radic;${val} + ${add} = ?`;
        correctAnswer = Math.sqrt(val) + add;
        break;
      }
      case 'order': {
        // İşlem önceliği: a + b * c
        const a = Math.floor(Math.random() * 12) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 7) + 2;
        questionText = `${a} + ${b} &times; ${c} = ?`;
        correctAnswer = a + (b * c);
        break;
      }
      default: {
        // Dört işlem
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a = Math.floor(Math.random() * 40) + 10;
        let b = Math.floor(Math.random() * 25) + 5;
        if (op === '+') {
          questionText = `${a} + ${b} = ?`;
          correctAnswer = a + b;
        } else if (op === '-') {
          if (a < b) [a, b] = [b, a];
          questionText = `${a} - ${b} = ?`;
          correctAnswer = a - b;
        } else {
          a = Math.floor(Math.random() * 12) + 3;
          b = Math.floor(Math.random() * 9) + 3;
          questionText = `${a} &times; ${b} = ?`;
          correctAnswer = a * b;
        }
      }
    }

    // 4 şık oluştur
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
      const delta = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 6) + 1) * (correctAnswer > 20 ? 2 : 1);
      const fake = correctAnswer + delta;
      if (fake >= 0) options.add(fake);
    }

    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

    return {
      text: questionText,
      correct: correctAnswer,
      options: shuffled
    };
  }

  nextQuestion() {
    if (!this.isPlaying) return;
    this.currentQuestion = this.generateQuestion();

    const qEl = this.container.querySelector('#math-question');
    const optsEl = this.container.querySelector('#math-options');

    if (qEl) qEl.innerHTML = this.currentQuestion.text;
    if (optsEl) {
      optsEl.innerHTML = '';
      this.currentQuestion.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'math-btn';
        btn.textContent = opt;
        btn.onclick = () => this.handleAnswer(opt, btn);
        optsEl.appendChild(btn);
      });
    }
  }

  handleAnswer(selected, buttonEl) {
    if (!this.isPlaying) return;

    if (selected === this.currentQuestion.correct) {
      sound.playCorrect();
      buttonEl.classList.add('correct');
      const earned = 10 * this.combo;
      this.score += earned;
      this.combo = Math.min(this.combo + 1, 5);
      this.timeLeft = Math.min(this.timeLeft + 2, 60); // 2 sn bonus

      // XP ekle
      storage.addXP(5);

      if (this.score >= 500) {
        storage.unlockBadge('math_champ');
      }

      this.updateUI();
      setTimeout(() => this.nextQuestion(), 300);
    } else {
      sound.playWrong();
      buttonEl.classList.add('wrong');
      this.combo = 1;
      this.timeLeft = Math.max(this.timeLeft - 3, 0); // 3 sn ceza
      this.updateUI();

      // Doğru şıkkı göster
      const allBtns = this.container.querySelectorAll('.math-btn');
      allBtns.forEach(b => {
        if (Number(b.textContent) === this.currentQuestion.correct) {
          b.classList.add('correct');
        }
      });

      setTimeout(() => this.nextQuestion(), 600);
    }
  }

  updateUI() {
    const scoreEl = this.container.querySelector('#math-score');
    const comboEl = this.container.querySelector('#math-combo');
    const timeEl = this.container.querySelector('#math-time');

    if (scoreEl) scoreEl.textContent = this.score;
    if (comboEl) comboEl.textContent = `x${this.combo}`;
    if (timeEl) timeEl.textContent = this.timeLeft;
  }

  gameOver() {
    this.stop();
    sound.playVictory();
    const isNewHigh = storage.updateScore('mathDuel', this.score);
    storage.addXP(Math.floor(this.score / 10));

    this.container.innerHTML = `
      <div class="game-over-card animate-pop">
        <div class="game-over-icon">⚡</div>
        <h2>Süre Doldu!</h2>
        <p class="final-score">Puanın: <span>${this.score}</span></p>
        ${isNewHigh ? '<div class="new-high-badge">🎉 YENİ REKOR!</div>' : `<p class="high-score-note">En Yüksek Skor: ${storage.getHighScore('mathDuel')}</p>`}
        <div class="game-over-actions">
          <button class="btn btn-primary" id="math-retry-btn">Tekrar Oyna</button>
          <button class="btn btn-secondary" onclick="app.showHome()">Ana Menüye Dön</button>
        </div>
      </div>
    `;

    const retryBtn = this.container.querySelector('#math-retry-btn');
    if (retryBtn) retryBtn.onclick = () => this.start();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper math-duel-view">
        <div class="game-top-bar">
          <div class="stat-pill"><span class="stat-label">Süre:</span> <strong id="math-time">${this.timeLeft}</strong>s</div>
          <div class="stat-pill"><span class="stat-label">Kombo:</span> <strong id="math-combo" class="accent-text">x${this.combo}</strong></div>
          <div class="stat-pill"><span class="stat-label">Skor:</span> <strong id="math-score">${this.score}</strong></div>
        </div>

        <div class="math-card">
          <div class="math-question-box">
            <span class="math-grade-tag">${this.grade}. Sınıf Düzeyi</span>
            <div id="math-question" class="question-text">Hesaplanıyor...</div>
          </div>
          <div id="math-options" class="math-grid-options"></div>
        </div>

        <div class="game-footer-bar">
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menüye Çık</button>
        </div>
      </div>
    `;
  }
}
