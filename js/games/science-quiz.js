/**
 * Oyun 5: Element & Bilim Çarkı (Fen Bilgisi & Doğa Bilgi Yarışması)
 * Ortaokul Fen Bilimleri müfredatı (5, 6, 7, 8. sınıf) temelli sorular
 */
class ScienceQuizGame {
  constructor(container) {
    this.container = container;
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.timeLeft = 20;
    this.timer = null;
    this.questions = [];
    this.usedFiftyFifty = false;
    this.usedExtraTime = false;

    this.allQuestions = [
      {
        question: "Periyodik tabloda sembolü 'Au' olan değerli element hangisidir?",
        options: ["Gümüş", "Altın", "Bakır", "Demir"],
        answer: 1,
        fact: "Au sembolü, Latince parıldayan anlamına gelen 'Aurum' kelimesinden gelir.",
        grade: "7-8"
      },
      {
        question: "Hücrede fotosentez yaparak besin ve oksijen üreten organel hangisidir?",
        options: ["Ribozom", "Mitokondri", "Kloroplast", "Golgi"],
        answer: 2,
        fact: "Kloroplast, klorofil pigmenti sayesinde bitkilere yeşil rengini verir.",
        grade: "6-7"
      },
      {
        question: "Güneş sistemindeki en büyük kütleye ve hacme sahip dev gaz gezegeni hangisidir?",
        options: ["Mars", "Satürn", "Neptün", "Jüpiter"],
        answer: 3,
        fact: "Jüpiter o kadar büyüktür ki içine Güneş sistemindeki diğer tüm gezegenler sığabilir!",
        grade: "5-6"
      },
      {
        question: "Kuvvetin birimi aşağıdakilerden hangisidir ve ne ile ölçülür?",
        options: ["Pascal (Manometre)", "Newton (Dinamometre)", "Joule (Termometre)", "Gram (Eşit Kollu Terazi)"],
        answer: 1,
        fact: "Kuvvet birimi, ünlü fizikçi Sir Isaac Newton'ın anısına Newton (N) olarak adlandırılmıştır.",
        grade: "5-7"
      },
      {
        question: "DNA'nın çift sarmal yapısında Adenin (A) organik bazının karşısına her zaman hangisi gelir?",
        options: ["Guanin", "Sitozin", "Timin", "Urasil"],
        answer: 2,
        fact: "DNA'da daima Adenin ile Timin (A=T), Guanin ile Sitozin (G≡C) eşleşir.",
        grade: "8"
      },
      {
        question: "Işığın boşluktaki hızı yaklaşık olarak saniyede kaç kilometredir?",
        options: ["3.000 km/s", "30.000 km/s", "300.000 km/s", "3.000.000 km/s"],
        answer: 2,
        fact: "Işık saniyede yaklaşık 300.000 km yol alarak Güneş'ten Dünya'ya 8 dakikada ulaşır.",
        grade: "7"
      },
      {
        question: "Maddenin sıvı halden gaz haline geçmeden doğrudan katıdan gaza geçmesine ne ad verilir?",
        options: ["Erime", "Süblimleşme", "Kırağılaşma", "Yoğuşma"],
        answer: 1,
        fact: "Kuru buz (katı karbondioksit) ve naftalin süblimleşmenin en bilinen örnekleridir.",
        grade: "5-6"
      },
      {
        question: "pH değeri 7'den küçük olan maddeler hangi sınıfa girer?",
        options: ["Baz", "Tuz", "Nötr", "Asit"],
        answer: 3,
        fact: "Limon suyu ve sirke asidiktir (pH < 7), sabun ve deterjan ise baziktir (pH > 7).",
        grade: "8"
      },
      {
        question: "Yüksekten bırakılan bir cismin yere yaklaştıkça hangi enerjisi kinetik enerjiye dönüşür?",
        options: ["Çekim Potansiyel Enerjisi", "Kimyasal Enerji", "Nükleer Enerji", "Elektrik Enerjisi"],
        answer: 0,
        fact: "Mekanik enerji korunur: Cisim düştükçe potansiyel enerjisi azalır, sürati ve kinetik enerjisi artar.",
        grade: "7"
      },
      {
        question: "Ay'ın Dünya ile Güneş arasına girmesiyle oluşan doğa olayına ne ad verilir?",
        options: ["Güneş Tutulması", "Ay Tutulması", "Gelgit Olayı", "Kutup Işıması"],
        answer: 0,
        fact: "Güneş tutulması gündüz vakti gerçekleşir ve Ay yeniay evresindedir.",
        grade: "6"
      },
      {
        question: "Aşağıdaki basit makinelerden hangisinde işten veya enerjiden kazanç SAĞLANMAZ?",
        options: ["Kaldıraç", "Eğik Düzlem", "Makaralar", "Hiçbir basit makinede işten kazanç sağlanmaz"],
        answer: 3,
        fact: "Basit makineler kuvvetten veya yoldan kazanç sağlayabilir fakat asla iş veya enerjiden kazanç sağlamaz!",
        grade: "8"
      },
      {
        question: "Havadaki nem oranını ölçmek için hangi araç kullanılır?",
        options: ["Barometre", "Higrometre", "Anemometre", "Dinamometre"],
        answer: 1,
        fact: "Higrometre havadaki su buharı miktarını (nem) hassas olarak ölçer.",
        grade: "8"
      }
    ];
  }

  start() {
    this.score = 0;
    this.streak = 0;
    this.currentIndex = 0;
    this.usedFiftyFifty = false;
    this.usedExtraTime = false;
    storage.unlockBadge('first_step');

    // 8 soru seç ve karıştır
    this.questions = [...this.allQuestions].sort(() => Math.random() - 0.5).slice(0, 8);
    this.render();
    this.loadQuestion();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timeLeft = 20;
    this.updateTimerDisplay();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.timeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timeEl = this.container.querySelector('#quiz-time');
    if (timeEl) {
      timeEl.textContent = this.timeLeft;
      timeEl.classList.toggle('time-warning', this.timeLeft <= 5);
    }
  }

  loadQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.quizFinished();
      return;
    }

    const q = this.questions[this.currentIndex];
    this.startTimer();

    const qTextEl = this.container.querySelector('#quiz-question-text');
    const qCountEl = this.container.querySelector('#quiz-counter');
    const optsEl = this.container.querySelector('#quiz-options-grid');
    const factBox = this.container.querySelector('#quiz-fact-box');

    if (qTextEl) qTextEl.innerHTML = q.question;
    if (qCountEl) qCountEl.textContent = `${this.currentIndex + 1} / ${this.questions.length}`;
    if (factBox) {
      factBox.innerHTML = '';
      factBox.style.display = 'none';
    }

    if (optsEl) {
      optsEl.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.dataset.index = idx;
        btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span class="opt-text">${opt}</span>`;
        btn.onclick = () => this.handleAnswer(idx);
        optsEl.appendChild(btn);
      });
    }
  }

  handleAnswer(chosenIndex) {
    clearInterval(this.timer);
    const q = this.questions[this.currentIndex];
    const opts = this.container.querySelectorAll('.quiz-opt-btn');
    opts.forEach(b => b.disabled = true);

    const factBox = this.container.querySelector('#quiz-fact-box');

    if (chosenIndex === q.answer) {
      sound.playCorrect();
      opts[chosenIndex].classList.add('correct');
      this.streak++;
      const earned = 100 + (this.streak * 15) + (this.timeLeft * 2);
      this.score += earned;
      storage.addXP(20);

      if (this.currentIndex >= 4) {
        storage.unlockBadge('quiz_genius');
      }
    } else {
      sound.playWrong();
      if (chosenIndex !== -1 && opts[chosenIndex]) {
        opts[chosenIndex].classList.add('wrong');
      }
      opts[q.answer].classList.add('correct');
      this.streak = 0;
    }

    if (factBox) {
      factBox.innerHTML = `<strong>💡 Bilim Notu:</strong> ${q.fact}`;
      factBox.style.display = 'block';
    }

    this.updateUI();

    setTimeout(() => {
      this.currentIndex++;
      this.loadQuestion();
    }, 2000);
  }

  timeUp() {
    this.handleAnswer(-1);
  }

  useFiftyFifty() {
    if (this.usedFiftyFifty) return;
    this.usedFiftyFifty = true;
    sound.playClick();

    const q = this.questions[this.currentIndex];
    const btns = Array.from(this.container.querySelectorAll('.quiz-opt-btn'));
    
    // Yanlış şıklardan 2 tanesini ele
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.answer);
    wrongIndices.sort(() => Math.random() - 0.5);
    const toRemove = wrongIndices.slice(0, 2);

    toRemove.forEach(idx => {
      if (btns[idx]) {
        btns[idx].style.visibility = 'hidden';
      }
    });

    const btnFifty = this.container.querySelector('#joker-fifty');
    if (btnFifty) btnFifty.disabled = true;
  }

  useExtraTime() {
    if (this.usedExtraTime) return;
    this.usedExtraTime = true;
    sound.playClick();
    this.timeLeft += 15;
    this.updateTimerDisplay();

    const btnTime = this.container.querySelector('#joker-time');
    if (btnTime) btnTime.disabled = true;
  }

  updateUI() {
    const scoreEl = this.container.querySelector('#quiz-score');
    const streakEl = this.container.querySelector('#quiz-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = `${this.streak}🔥`;
  }

  quizFinished() {
    this.stop();
    sound.playVictory();
    const isNewHigh = storage.updateScore('scienceQuiz', this.score);
    storage.addXP(Math.floor(this.score / 10));

    this.container.innerHTML = `
      <div class="game-over-card animate-pop">
        <div class="game-over-icon">🏆</div>
        <h2>Sınav Tamamlandı!</h2>
        <p class="final-score">Puanın: <span>${this.score}</span></p>
        ${isNewHigh ? '<div class="new-high-badge">🎉 YENİ REKOR!</div>' : `<p class="high-score-note">En Yüksek Skor: ${storage.getHighScore('scienceQuiz')}</p>`}
        <div class="game-over-actions">
          <button class="btn btn-primary" id="quiz-retry-btn">Tekrar Sına</button>
          <button class="btn btn-secondary" onclick="app.showHome()">Ana Menüye Dön</button>
        </div>
      </div>
    `;

    const btn = this.container.querySelector('#quiz-retry-btn');
    if (btn) btn.onclick = () => this.start();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper quiz-view">
        <div class="game-top-bar">
          <div class="stat-pill"><span class="stat-label">Soru:</span> <strong id="quiz-counter">1 / 8</strong></div>
          <div class="stat-pill"><span class="stat-label">Süre:</span> <strong id="quiz-time">${this.timeLeft}</strong>s</div>
          <div class="stat-pill"><span class="stat-label">Seri:</span> <strong id="quiz-streak">${this.streak}🔥</strong></div>
          <div class="stat-pill"><span class="stat-label">Puan:</span> <strong id="quiz-score">${this.score}</strong></div>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <div class="quiz-jokers-bar">
          <span>Jokerlerin:</span>
          <button class="joker-btn" id="joker-fifty" title="2 Yanlış Şıkkı Eler">🌓 %50 Eleme</button>
          <button class="joker-btn" id="joker-time" title="15 Saniye Ekler">⏳ +15 Saniye</button>
        </div>

        <div class="quiz-card">
          <div id="quiz-question-text" class="quiz-question-box">Yükleniyor...</div>
          <div id="quiz-options-grid" class="quiz-grid"></div>
          <div id="quiz-fact-box" class="quiz-fact-box" style="display:none;"></div>
        </div>
      </div>
    `;

    this.container.querySelector('#joker-fifty').onclick = () => this.useFiftyFifty();
    this.container.querySelector('#joker-time').onclick = () => this.useExtraTime();
  }
}
