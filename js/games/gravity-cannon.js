/**
 * Oyun 3: Fizik Laboratuvarı: Yerçekimi ve Açı Topu
 * 2D Canvas Yerçekimi, Rüzgar ve Açı Simülasyonu
 */
class GravityCannonGame {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    
    this.ballsLeft = 5;
    this.score = 0;
    this.angle = 45; // Derece
    this.power = 65; // Güç (10-100)
    this.wind = 0;   // Rüzgar (-5 ile +5)
    
    this.ball = null; // { x, y, vx, vy, active, trail: [] }
    this.target = { x: 550, y: 320, width: 45, height: 45, hit: false };
    this.obstacles = [];
    this.gravity = 0.38;
  }

  start() {
    this.ballsLeft = 5;
    this.score = 0;
    this.angle = 45;
    this.power = 65;
    this.ball = null;
    storage.unlockBadge('first_step');

    this.render();
    this.initCanvas();
    this.nextRound();
    this.animate();
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#physics-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    if (this.canvas) this.resizeCanvas();
  };

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const width = Math.min(rect.width, 800);
    const height = Math.min(width * 0.58, 460);
    this.canvas.width = width;
    this.canvas.height = height;
  }

  nextRound() {
    if (this.ballsLeft <= 0) {
      this.gameOver();
      return;
    }

    const w = this.canvas ? this.canvas.width : 700;
    const h = this.canvas ? this.canvas.height : 400;

    // Rastgele rüzgar
    this.wind = (Math.random() * 0.3 - 0.15); // Hafif rüzgar ivmesi
    
    // Hedef konumu (sağ tarafta)
    const tx = w * 0.65 + Math.random() * (w * 0.25);
    const ty = h * 0.45 + Math.random() * (h * 0.35);
    this.target = {
      x: tx,
      y: ty,
      width: 44,
      height: 44,
      hit: false,
      pulse: 0
    };

    // İsteğe bağlı 1 adet engel duvar
    this.obstacles = [];
    if (Math.random() > 0.4) {
      const ox = w * 0.45 + Math.random() * (w * 0.1);
      const oh = h * 0.45;
      this.obstacles.push({
        x: ox,
        y: h - oh - 20,
        width: 18,
        height: oh
      });
    }

    this.ball = null;
    this.updateUI();
  }

  fire() {
    if (this.ball && this.ball.active) return; // Mermi havadayken tekrar ateşleme
    if (this.ballsLeft <= 0) return;

    sound.playLaunch();
    this.ballsLeft--;

    const startX = 60;
    const startY = this.canvas.height - 50;
    const rad = (this.angle * Math.PI) / 180;
    const speed = (this.power / 100) * 22;

    this.ball = {
      x: startX,
      y: startY,
      vx: Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
      radius: 9,
      active: true,
      trail: []
    };

    this.updateUI();
  }

  animate = () => {
    this.updatePhysics();
    this.draw();
    this.animId = requestAnimationFrame(this.animate);
  };

  updatePhysics() {
    if (!this.ball || !this.ball.active) return;

    // Yerçekimi ve rüzgar uygula
    this.ball.vy += this.gravity;
    this.ball.vx += this.wind;

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // İz ekle
    if (this.ball.trail.length > 25) this.ball.trail.shift();
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });

    // Hedef vurma kontrolü (AABB)
    if (!this.target.hit) {
      const dx = this.ball.x - (this.target.x + this.target.width / 2);
      const dy = this.ball.y - (this.target.y + this.target.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.ball.radius + this.target.width / 2) {
        sound.playImpact();
        this.target.hit = true;
        this.ball.active = false;
        
        const earned = 100 + Math.floor(Math.abs(this.angle - 45) * 2);
        this.score += earned;
        storage.addXP(25);

        if (this.score >= 300) {
          storage.unlockBadge('gravity_ace');
        }

        setTimeout(() => this.nextRound(), 1200);
        return;
      }
    }

    // Engel çarpışma kontrolü
    for (const obs of this.obstacles) {
      if (
        this.ball.x + this.ball.radius > obs.x &&
        this.ball.x - this.ball.radius < obs.x + obs.width &&
        this.ball.y + this.ball.radius > obs.y &&
        this.ball.y - this.ball.radius < obs.y + obs.height
      ) {
        sound.playImpact();
        this.ball.active = false;
        setTimeout(() => this.nextRound(), 800);
        return;
      }
    }

    // Zemin ve sınır kontrolü
    if (this.ball.y > this.canvas.height - 30 || this.ball.x > this.canvas.width + 50 || this.ball.x < -20) {
      this.ball.active = false;
      setTimeout(() => this.nextRound(), 800);
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Arka Plan Izgarası (Laboratuvar Simülasyon Ekranı)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Zemin Çizimi
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, h - 30, w, 30);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, h - 32, w, 2);

    // Engeller (Güvenlik Kalkanı)
    for (const obs of this.obstacles) {
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, 3);
    }

    // Hedef (Deney Kristali / Şişesi)
    if (this.target) {
      ctx.save();
      ctx.translate(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
      
      if (this.target.hit) {
        // Vuruldu patlama efekti
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', 0, 0);
      } else {
        // Platform
        ctx.fillStyle = '#334155';
        ctx.fillRect(-22, 20, 44, 8);
        
        // Parıldayan Hedef İkonu
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', 0, 0);
      }
      ctx.restore();
    }

    // Topun İzi (Trajectory Trail)
    if (this.ball && this.ball.trail.length > 1) {
      ctx.save();
      for (let i = 0; i < this.ball.trail.length; i++) {
        const pt = this.ball.trail[i];
        const alpha = (i / this.ball.trail.length) * 0.7;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Top
    if (this.ball && this.ball.active) {
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.ball.x - 2, this.ball.y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Top Atıcı (Top Namlusu ve Tabanı)
    const cannonBaseX = 60;
    const cannonBaseY = h - 50;

    ctx.save();
    ctx.translate(cannonBaseX, cannonBaseY);
    ctx.rotate(-(this.angle * Math.PI) / 180);

    // Namlu
    const cannonGrad = ctx.createLinearGradient(0, -9, 45, 9);
    cannonGrad.addColorStop(0, '#64748b');
    cannonGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = cannonGrad;
    ctx.fillRect(0, -9, 42, 18);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, -9, 42, 18);
    ctx.restore();

    // Top Tabanı (Döner yarım küre)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cannonBaseX, cannonBaseY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tahmini Nişan Hattı (Kısa kesikli çizgi)
    const rad = (this.angle * Math.PI) / 180;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cannonBaseX + Math.cos(rad) * 45, cannonBaseY - Math.sin(rad) * 45);
    ctx.lineTo(cannonBaseX + Math.cos(rad) * 120, cannonBaseY - Math.sin(rad) * 120);
    ctx.stroke();
    ctx.restore();
  }

  updateUI() {
    const scoreEl = this.container.querySelector('#phys-score');
    const ballsEl = this.container.querySelector('#phys-balls');
    const angleValEl = this.container.querySelector('#angle-val');
    const powerValEl = this.container.querySelector('#power-val');
    const windEl = this.container.querySelector('#phys-wind');

    if (scoreEl) scoreEl.textContent = this.score;
    if (ballsEl) ballsEl.textContent = this.ballsLeft;
    if (angleValEl) angleValEl.textContent = `${this.angle}°`;
    if (powerValEl) powerValEl.textContent = `${this.power}%`;
    if (windEl) {
      const wVal = Math.round(this.wind * 40);
      if (wVal > 0) windEl.innerHTML = `Sağ &rarr; ${wVal} m/s`;
      else if (wVal < 0) windEl.innerHTML = `&larr; Sol ${Math.abs(wVal)} m/s`;
      else windEl.innerHTML = 'Durgun 0 m/s';
    }
  }

  gameOver() {
    this.stop();
    sound.playVictory();
    const isNewHigh = storage.updateScore('gravityCannon', this.score);
    storage.addXP(Math.floor(this.score / 5));

    this.container.innerHTML = `
      <div class="game-over-card animate-pop">
        <div class="game-over-icon">🎯</div>
        <h2>Deney Tamamlandı!</h2>
        <p class="final-score">Fizik Skorun: <span>${this.score}</span></p>
        ${isNewHigh ? '<div class="new-high-badge">🎉 YENİ REKOR!</div>' : `<p class="high-score-note">En Yüksek Skor: ${storage.getHighScore('gravityCannon')}</p>`}
        <div class="game-over-actions">
          <button class="btn btn-primary" id="phys-retry-btn">Yeniden Fırlat</button>
          <button class="btn btn-secondary" onclick="app.showHome()">Ana Menüye Dön</button>
        </div>
      </div>
    `;

    const retryBtn = this.container.querySelector('#phys-retry-btn');
    if (retryBtn) retryBtn.onclick = () => this.start();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper physics-view">
        <div class="game-top-bar">
          <div class="stat-pill"><span class="stat-label">Kalan Top:</span> <strong id="phys-balls">${this.ballsLeft}</strong></div>
          <div class="stat-pill"><span class="stat-label">Rüzgar:</span> <strong id="phys-wind">0 m/s</strong></div>
          <div class="stat-pill"><span class="stat-label">Skor:</span> <strong id="phys-score">${this.score}</strong></div>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <div class="canvas-holder">
          <canvas id="physics-canvas"></canvas>
        </div>

        <div class="cannon-controls-panel">
          <div class="control-slider-group">
            <div class="slider-label">
              <span>📐 Fırlatma Açısı:</span>
              <strong id="angle-val">${this.angle}°</strong>
            </div>
            <input type="range" id="angle-slider" min="15" max="85" value="${this.angle}" />
          </div>

          <div class="control-slider-group">
            <div class="slider-label">
              <span>🚀 İtiş Gücü:</span>
              <strong id="power-val">${this.power}%</strong>
            </div>
            <input type="range" id="power-slider" min="20" max="100" value="${this.power}" />
          </div>

          <button class="btn btn-primary fire-btn" id="fire-btn">💥 ATEŞ ET!</button>
        </div>
      </div>
    `;

    const angleSlider = this.container.querySelector('#angle-slider');
    const powerSlider = this.container.querySelector('#power-slider');
    const fireBtn = this.container.querySelector('#fire-btn');

    angleSlider.oninput = (e) => {
      this.angle = parseInt(e.target.value, 10);
      this.updateUI();
    };

    powerSlider.oninput = (e) => {
      this.power = parseInt(e.target.value, 10);
      this.updateUI();
    };

    fireBtn.onclick = () => this.fire();
  }
}
