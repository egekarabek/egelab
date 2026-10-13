/**
 * Oyun 6: Güneş Sistemi 3D Astronomi Laboratuvarı
 * Ege Lab içine entegre edilmiş 3D Güneş Sistemi Simülasyonu
 */
class SolarSystemGame {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    this.simDay = 0;
    this.timeSpeed = 5;
    this.isPlaying = true;
    this.lastTime = performance.now();

    // 3D Kamera
    this.camDistance = 680;
    this.targetCamDist = 680;
    this.camPitch = 0.52;
    this.targetCamPitch = 0.52;
    this.camYaw = 0.45;
    this.targetCamYaw = 0.45;

    this.camTarget = { x: 0, y: 0, z: 0 };
    this.targetLookAt = { x: 0, y: 0, z: 0 };

    this.selectedPlanetId = 'earth';
    this.hoveredPlanetId = null;

    this.showOrbits = true;
    this.showLabels = true;
    this.showAsteroids = true;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.planets = [
      {
        id: 'sun', name: 'Güneş', type: 'Merkez Yıldız (G2V)', icon: '☀️', color: '#f59e0b',
        radiusVis: 36, distVis: 0, orbitSpeed: 0, rotPeriod: 27, gravity: 274.0,
        distReal: '0 km', diamReal: '1,392,700 km', yearText: 'Galaksi turu 230M Yıl', dayText: '27 Gün',
        temp: '5,500 °C', moonsText: 'Tüm Sistem',
        desc: 'Güneş Sistemimizin kalbidir. Sistemin toplam kütlesinin %99.86\'sını oluşturur.',
        fact: 'İçine yaklaşık 1.3 milyon adet Dünya sığabilir!'
      },
      {
        id: 'mercury', name: 'Merkür', type: 'Karasal Gezegen', icon: '☿️', color: '#9ca3af',
        radiusVis: 7, distVis: 75, orbitSpeed: 4.15, rotPeriod: 58.6, gravity: 3.7,
        distReal: '57.9M km (0.39 AU)', diamReal: '4,879 km', yearText: '88 Gün', dayText: '58.6 Gün',
        temp: '-180 °C / +430 °C', moonsText: '0 Uydu',
        desc: 'Güneş\'e en yakın gezegen. Atmosferi olmadığı için gece ve gündüz sıcaklık farkı 600°C\'yi aşar.',
        fact: 'Güneş\'e en yakın gezegen olmasına rağmen en sıcak gezegen değildir (atmosfersizdir).'
      },
      {
        id: 'venus', name: 'Venüs', type: 'Karasal Gezegen', icon: '♀️', color: '#fbbf24',
        radiusVis: 12, distVis: 120, orbitSpeed: 1.62, rotPeriod: -243, gravity: 8.87,
        distReal: '108.2M km (0.72 AU)', diamReal: '12,104 km', yearText: '224.7 Gün', dayText: '243 Gün',
        temp: '465 °C', moonsText: '0 Uydu',
        desc: 'Kalın karbondioksit ve asit bulutları nedeniyle kontrolsüz sera etkisi yaşar. En sıcak gezegendir.',
        fact: 'Venüs saat yönünde ters döner (retrograd)! Güneş batıdan doğar, doğudan batar.'
      },
      {
        id: 'earth', name: 'Dünya', type: 'Karasal Gezegen', icon: '🌍', color: '#38bdf8',
        radiusVis: 13, distVis: 175, orbitSpeed: 1.0, rotPeriod: 1.0, gravity: 9.81,
        distReal: '149.6M km (1.0 AU)', diamReal: '12,742 km', yearText: '365.25 Gün', dayText: '24 Saat',
        temp: 'Ortalama 15 °C', moonsText: '1 Uydu (Ay)',
        desc: 'Evrende üzerinde sıvı su ve yaşam barındırdığı bilinen tek mucizevi sığınağımız.',
        fact: 'Güneş etrafında saniyede 30 km (saatte 107,000 km) muazzam bir hızla döner!'
      },
      {
        id: 'mars', name: 'Mars', type: 'Karasal Gezegen', icon: '♂️', color: '#f87171',
        radiusVis: 9, distVis: 235, orbitSpeed: 0.53, rotPeriod: 1.03, gravity: 3.72,
        distReal: '227.9M km (1.52 AU)', diamReal: '6,779 km', yearText: '687 Gün', dayText: '24.6 Saat',
        temp: '-63 °C', moonsText: '2 Uydu (Phobos, Deimos)',
        desc: 'Demir oksit tozuyla kaplı kızıl dünya. 22 km yüksekliğindeki Olimpos Dağı\'na ev sahipliği yapar.',
        fact: 'Mars’taki gün süresi Dünya ile neredeyse aynıdır (24 saat 37 dakika).'
      },
      {
        id: 'jupiter', name: 'Jüpiter', type: 'Gaz Devi', icon: '♃', color: '#fb923c',
        radiusVis: 26, distVis: 310, orbitSpeed: 0.084, rotPeriod: 0.41, gravity: 24.79,
        distReal: '778.5M km (5.2 AU)', diamReal: '139,820 km', yearText: '11.86 Yıl', dayText: '9.9 Saat',
        temp: '-110 °C', moonsText: '95 Uydu (Ganymede, Europa...)',
        desc: 'Güneş Sistemi’nin devasa abisi. Kütlesi diğer tüm gezegenlerin toplamının 2.5 katıdır.',
        fact: 'Kendi ekseni etrafında en hızlı dönen gezegendir; bir günü 10 saat bile sürmez!'
      },
      {
        id: 'saturn', name: 'Satürn', type: 'Gaz Devi & Halkalar', icon: '♄', color: '#fde047',
        radiusVis: 22, distVis: 390, orbitSpeed: 0.034, rotPeriod: 0.44, gravity: 10.44,
        distReal: '1.43 Milyar km (9.58 AU)', diamReal: '116,460 km', yearText: '29.45 Yıl', dayText: '10.7 Saat',
        temp: '-140 °C', moonsText: '146 Uydu (Titan, Enceladus...)',
        desc: 'Buz ve kaya parçalarından oluşan büyüleyici halka sistemine sahip gaz devi.',
        fact: 'Yoğunluğu sudan düşüktür (0.69 g/cm³); dev bir havuza konsaydı batmaz, yüzerdi!'
      },
      {
        id: 'uranus', name: 'Uranüs', type: 'Buz Devi', icon: '♅', color: '#67e8f9',
        radiusVis: 16, distVis: 465, orbitSpeed: 0.012, rotPeriod: -0.72, gravity: 8.69,
        distReal: '2.87 Milyar km (19.2 AU)', diamReal: '50,724 km', yearText: '84 Yıl', dayText: '17.2 Saat',
        temp: '-224 °C', moonsText: '28 Uydu',
        desc: 'Metan gazı nedeniyle turkuaz renkte parlayan, 98 derece yana yatık buz devi.',
        fact: 'Eksen eğikliği yüzünden bir kutbu 42 yıl aralıksız gündüz, 42 yıl gece yaşar!'
      },
      {
        id: 'neptune', name: 'Neptün', type: 'Buz Devi', icon: '♆', color: '#60a5fa',
        radiusVis: 15, distVis: 540, orbitSpeed: 0.006, rotPeriod: 0.67, gravity: 11.15,
        distReal: '4.5 Milyar km (30.0 AU)', diamReal: '49,244 km', yearText: '164.8 Yıl', dayText: '16.1 Saat',
        temp: '-200 °C', moonsText: '16 Uydu (Triton...)',
        desc: 'Saatte 2,100 km hıza varan süpersonik rüzgarlarıyla Güneş\'e en uzak ana gezegen.',
        fact: 'Matematiksel yörünge hesaplamalarıyla yeri tahmin edilerek teleskopla bulunmuştur!'
      },
      {
        id: 'pluto', name: 'Plüton', type: 'Cüce Gezegen', icon: '♇', color: '#e2e8f0',
        radiusVis: 6, distVis: 615, orbitSpeed: 0.004, rotPeriod: 6.4, gravity: 0.62,
        distReal: '5.9 Milyar km (39.5 AU)', diamReal: '2,376 km', yearText: '248 Yıl', dayText: '6.4 Gün',
        temp: '-230 °C', moonsText: '5 Uydu (Charon...)',
        desc: 'Kuiper Kuşağı’nda yer alan, yüzeyinde kalp şeklinde nitrojen buzulu barındıran cüce gezegen.',
        fact: '2006 yılında Uluslararası Astronomi Birliği tarafından Cüce Gezegen sınıfına alınmıştır.'
      }
    ];

    this.planetStates = {};
    this.planets.forEach(p => {
      this.planetStates[p.id] = {
        angle: Math.random() * Math.PI * 2,
        rotAngle: 0,
        x: 0, y: 0, z: 0,
        screenX: 0, screenY: 0, screenRadius: 0
      };
    });

    this.stars = [];
    this.asteroids = [];
  }

  start() {
    storage.unlockBadge('first_step');
    storage.unlockBadge('solar_explorer');
    storage.addXP(40);

    this.render();
    this.initCanvas();
    this.generateCosmicElements();
    this.setupListeners();
    this.selectPlanet('earth');

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    this.animId = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    if (this.canvas) this.resizeCanvas();
  };

  initCanvas() {
    this.canvas = this.container.querySelector('#solar-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.userHasZoomed = false;
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const w = Math.min(rect.width, 1000);
    const isMobile = w < 600;
    const h = isMobile ? Math.max(280, Math.min(w * 0.85, 380)) : Math.max(420, Math.min(w * 0.58, 540));
    this.canvas.width = w;
    this.canvas.height = h;
    this.fov = isMobile ? Math.min(w * 0.95, 380) : Math.min(w * 0.65, 580);

    if (!this.userHasZoomed) {
      const defaultDist = isMobile ? 1050 : 680;
      const defaultPitch = isMobile ? 0.65 : 0.52;
      this.targetCamDist = defaultDist;
      this.targetCamPitch = defaultPitch;
      this.camDistance = defaultDist;
      this.camPitch = defaultPitch;
    }
  }

  generateCosmicElements() {
    this.stars = [];
    for (let i = 0; i < 400; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2 * Math.PI;
      const phi = Math.acos(2 * v - 1);
      const r = 1800 + Math.random() * 400;
      this.stars.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    this.asteroids = [];
    for (let i = 0; i < 280; i++) {
      const dist = 260 + Math.random() * 38;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 14;
      this.asteroids.push({ dist, angle, height, speed: 0.18 + Math.random() * 0.1 });
    }
  }

  setupListeners() {
    // Sürükleme ile Kamera Döndürme (Fare)
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.targetCamYaw -= dx * 0.006;
        this.targetCamPitch = Math.max(-1.4, Math.min(1.4, this.targetCamPitch + dy * 0.006));
      } else if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.checkHover(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Dokunmatik Jestler (Mobil Ekranlar)
    let initialPinchDist = null;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = e.touches[0].clientX;
        this.dragStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.userHasZoomed = true;
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.dragStartX;
        const dy = e.touches[0].clientY - this.dragStartY;
        this.dragStartX = e.touches[0].clientX;
        this.dragStartY = e.touches[0].clientY;
        this.targetCamYaw -= dx * 0.006;
        this.targetCamPitch = Math.max(-1.4, Math.min(1.4, this.targetCamPitch + dy * 0.006));
      } else if (e.touches.length === 2 && initialPinchDist) {
        this.userHasZoomed = true;
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (initialPinchDist - currentDist) * 2;
        initialPinchDist = currentDist;
        this.targetCamDist = Math.max(90, Math.min(2200, this.targetCamDist + delta));
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      initialPinchDist = null;
    });

    // Tekerlek ile Yakınlaştırma
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.userHasZoomed = true;
      this.targetCamDist = Math.max(90, Math.min(2200, this.targetCamDist + e.deltaY * 0.8));
    }, { passive: false });

    // Tıklayarak Gezegen Seçme
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickedId = this.findPlanetAtScreen(e.clientX - rect.left, e.clientY - rect.top);
      if (clickedId) {
        sound.playClick();
        this.selectPlanet(clickedId);
      }
    });

    // Zaman Kontrolleri
    const playBtn = this.container.querySelector('#solar-play-btn');
    if (playBtn) {
      playBtn.onclick = () => {
        this.isPlaying = !this.isPlaying;
        playBtn.textContent = this.isPlaying ? '⏸ Durdur' : '▶ Oynat';
      };
    }

    const resetBtn = this.container.querySelector('#solar-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => this.resetCamera();
    }

    const speedRange = this.container.querySelector('#solar-speed-range');
    if (speedRange) {
      speedRange.oninput = (e) => {
        this.timeSpeed = parseFloat(e.target.value);
        const lbl = this.container.querySelector('#solar-speed-lbl');
        if (lbl) lbl.textContent = `${this.timeSpeed}x`;
      };
    }

    // Ağırlık Girişi
    const weightInput = this.container.querySelector('#solar-calc-input');
    if (weightInput) {
      weightInput.oninput = () => this.updateWeightOutput();
    }
  }

  checkHover(mx, my) {
    const hitId = this.findPlanetAtScreen(mx, my);
    if (hitId !== this.hoveredPlanetId) {
      this.hoveredPlanetId = hitId;
      this.canvas.style.cursor = hitId ? 'pointer' : (this.isDragging ? 'grabbing' : 'grab');
    }
  }

  findPlanetAtScreen(sx, sy) {
    const isMobile = this.canvas.width < 600;
    for (let i = this.planets.length - 1; i >= 0; i--) {
      const p = this.planets[i];
      const state = this.planetStates[p.id];
      const dist = Math.hypot(sx - state.screenX, sy - state.screenY);
      const clickRadius = Math.max(state.screenRadius + (isMobile ? 14 : 7), isMobile ? 26 : 16);
      if (dist <= clickRadius) {
        return p.id;
      }
    }
    return null;
  }

  selectPlanet(id) {
    this.selectedPlanetId = id;
    const p = this.planets.find(x => x.id === id);
    if (!p) return;

    this.targetCamDist = id === 'sun' ? 260 : Math.max(90, p.radiusVis * 5);
    this.targetCamPitch = 0.32;

    // Alt dock butonlarını güncelle
    this.container.querySelectorAll('.solar-dock-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === id);
    });

    this.updateInfoCard(p);
  }

  resetCamera() {
    this.selectedPlanetId = null;
    this.userHasZoomed = false;
    this.targetLookAt = { x: 0, y: 0, z: 0 };
    const isMobile = this.canvas.width < 600;
    this.targetCamDist = isMobile ? 1050 : 680;
    this.targetCamPitch = isMobile ? 0.65 : 0.52;
    this.targetCamYaw = 0.45;
    this.container.querySelectorAll('.solar-dock-pill').forEach(b => b.classList.remove('active'));
  }

  updateInfoCard(p) {
    const nameEl = this.container.querySelector('#solar-info-name');
    const typeEl = this.container.querySelector('#solar-info-type');
    const descEl = this.container.querySelector('#solar-info-desc');
    const distEl = this.container.querySelector('#solar-val-dist');
    const diamEl = this.container.querySelector('#solar-val-diam');
    const yearEl = this.container.querySelector('#solar-val-year');
    const dayEl = this.container.querySelector('#solar-val-day');
    const gravEl = this.container.querySelector('#solar-val-grav');
    const tempEl = this.container.querySelector('#solar-val-temp');
    const factEl = this.container.querySelector('#solar-info-fact');

    if (nameEl) nameEl.innerHTML = `${p.icon} ${p.name}`;
    if (typeEl) typeEl.textContent = p.type;
    if (descEl) descEl.textContent = p.desc;
    if (distEl) distEl.textContent = p.distReal;
    if (diamEl) diamEl.textContent = p.diamReal;
    if (yearEl) yearEl.textContent = p.yearText;
    if (dayEl) dayEl.textContent = p.dayText;
    if (gravEl) gravEl.textContent = `${p.gravity} m/s²`;
    if (tempEl) tempEl.textContent = p.temp;
    if (factEl) factEl.textContent = p.fact;

    this.updateWeightOutput();
  }

  updateWeightOutput() {
    const input = this.container.querySelector('#solar-calc-input');
    const out = this.container.querySelector('#solar-calc-result');
    if (!input || !out) return;
    const kg = parseFloat(input.value) || 50;
    const p = this.planets.find(x => x.id === this.selectedPlanetId) || this.planets[3];
    const calc = (kg * (p.gravity / 9.81)).toFixed(1);
    out.textContent = `${calc} kg`;
  }

  project3D(x, y, z) {
    const rx = x - this.camTarget.x;
    const ry = y - this.camTarget.y;
    const rz = z - this.camTarget.z;

    const cosY = Math.cos(this.camYaw);
    const sinY = Math.sin(this.camYaw);
    const x1 = rx * cosY - rz * sinY;
    const z1 = rx * sinY + rz * cosY;

    const cosP = Math.cos(this.camPitch);
    const sinP = Math.sin(this.camPitch);
    const y2 = ry * cosP - z1 * sinP;
    const z2 = ry * sinP + z1 * cosP + this.camDistance;

    if (z2 <= 20) return { visible: false, screenX: 0, screenY: 0, scale: 0, depth: z2 };

    const fov = this.fov || (this.canvas.width < 600 ? 360 : 580);
    const scale = fov / z2;
    const screenX = this.canvas.width / 2 + x1 * scale;
    const screenY = this.canvas.height / 2 - y2 * scale;

    return { visible: true, screenX, screenY, scale, depth: z2 };
  }

  animate(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.isPlaying) {
      this.simDay += this.timeSpeed * dt;
      const dayEl = this.container.querySelector('#solar-sim-day-lbl');
      if (dayEl) {
        const year = Math.floor(this.simDay / 365.25) + 1;
        const d = Math.floor(this.simDay % 365.25);
        dayEl.textContent = `${year}. Yıl, ${d}. Gün`;
      }
    }

    // Gezegen pozisyonları
    this.planets.forEach(p => {
      const state = this.planetStates[p.id];
      if (p.id === 'sun') {
        state.x = 0; state.y = 0; state.z = 0;
      } else {
        const orbitRad = (this.simDay / 365.25) * (p.orbitSpeed * Math.PI * 2);
        state.x = Math.cos(orbitRad) * p.distVis;
        state.z = Math.sin(orbitRad) * p.distVis;
        state.y = 0;
      }
    });

    // Kamera Takibi
    const lerp = 0.08;
    this.camDistance += (this.targetCamDist - this.camDistance) * lerp;
    this.camPitch += (this.targetCamPitch - this.camPitch) * lerp;
    this.camYaw += (this.targetCamYaw - this.camYaw) * lerp;

    if (this.selectedPlanetId) {
      const targetState = this.planetStates[this.selectedPlanetId];
      this.targetLookAt = { x: targetState.x, y: targetState.y, z: targetState.z };
    }
    this.camTarget.x += (this.targetLookAt.x - this.camTarget.x) * lerp;
    this.camTarget.y += (this.targetLookAt.y - this.camTarget.y) * lerp;
    this.camTarget.z += (this.targetLookAt.z - this.camTarget.z) * lerp;

    this.draw();
    this.animId = requestAnimationFrame(this.animate);
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Uzay Arka Planı
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#090d1c');
    bgGrad.addColorStop(1, '#020409');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Yıldızlar
    this.stars.forEach(s => {
      const proj = this.project3D(s.x, s.y, s.z);
      if (proj.visible) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(proj.screenX, proj.screenY, s.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1.0;

    // Yörünge Çizgileri
    if (this.showOrbits) {
      this.planets.forEach(p => {
        if (p.id === 'sun') return;
        ctx.beginPath();
        const segments = 60;
        let started = false;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const proj = this.project3D(Math.cos(theta) * p.distVis, 0, Math.sin(theta) * p.distVis);
          if (proj.visible) {
            if (!started) { ctx.moveTo(proj.screenX, proj.screenY); started = true; }
            else { ctx.lineTo(proj.screenX, proj.screenY); }
          }
        }
        ctx.strokeStyle = p.id === this.selectedPlanetId ? 'rgba(56, 189, 248, 0.7)' : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = p.id === this.selectedPlanetId ? 2 : 1;
        ctx.stroke();
      });
    }

    // Asteroit Kuşağı
    if (this.showAsteroids) {
      ctx.fillStyle = '#94a3b8';
      this.asteroids.forEach(a => {
        const curA = a.angle + (this.simDay * 0.005 * a.speed);
        const proj = this.project3D(Math.cos(curA) * a.dist, a.height, Math.sin(curA) * a.dist);
        if (proj.visible) {
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
    }

    // Gezegenleri Derinliğe Göre Çiz
    const renderList = this.planets.map(p => {
      const state = this.planetStates[p.id];
      const proj = this.project3D(state.x, state.y, state.z);
      state.screenX = proj.screenX;
      state.screenY = proj.screenY;
      state.screenRadius = Math.max(this.canvas.width < 600 ? 4.5 : 3.5, p.radiusVis * proj.scale);
      return { p, state, depth: proj.depth, visible: proj.visible };
    }).filter(item => item.visible);

    renderList.sort((a, b) => b.depth - a.depth);

    renderList.forEach(item => {
      const p = item.p;
      const st = item.state;
      const sx = st.screenX;
      const sy = st.screenY;
      const sr = st.screenRadius;

      if (p.id === 'sun') {
        // Güneş ve Korona
        const cGrad = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 1.8);
        cGrad.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
        cGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 1.8, 0, Math.PI * 2);
        ctx.fill();

        const sGrad = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, sr * 0.1, sx, sy, sr);
        sGrad.addColorStop(0, '#ffffff');
        sGrad.addColorStop(0.3, '#fef08a');
        sGrad.addColorStop(0.8, '#f59e0b');
        sGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Gezegen ve Işık Açısı
        const sunSt = this.planetStates['sun'];
        const lightA = Math.atan2(sunSt.screenY - sy, sunSt.screenX - sx);

        // Satürn Halkası (Arka)
        if (p.id === 'saturn') this.drawRings(sx, sy, sr, true);

        // 3D Küre
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.clip();

        const lx = sx + Math.cos(lightA) * (sr * 0.4);
        const ly = sy + Math.sin(lightA) * (sr * 0.4);
        const spGrad = ctx.createRadialGradient(lx, ly, sr * 0.1, sx, sy, sr);
        spGrad.addColorStop(0, '#ffffff');
        spGrad.addColorStop(0.3, p.color);
        spGrad.addColorStop(0.85, '#040711');
        ctx.fillStyle = spGrad;
        ctx.fill();
        ctx.restore();

        // Satürn Halkası (Ön)
        if (p.id === 'saturn') this.drawRings(sx, sy, sr, false);

        // Dünya'nın Ay'ı
        if (p.id === 'earth') {
          const ma = this.simDay * 0.25;
          const mx = sx + Math.cos(ma) * (sr * 2.3);
          const my = sy + Math.sin(ma) * (sr * 1.1);
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(2, sr * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Seçim Halesi
      if (p.id === this.selectedPlanetId || p.id === this.hoveredPlanetId) {
        ctx.strokeStyle = p.id === this.selectedPlanetId ? '#38bdf8' : 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, sr + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // İsim Etiketi
      if (this.showLabels) {
        ctx.font = '11px Segoe UI, sans-serif';
        ctx.fillStyle = p.id === this.selectedPlanetId ? '#38bdf8' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, sx, sy + sr + 14);
      }
    });
  }

  drawRings(sx, sy, sr, isBack) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.35);
    ctx.beginPath();
    const rxInner = sr * 1.35;
    const ryInner = sr * 0.45;
    const rxOuter = sr * 2.3;
    const ryOuter = sr * 0.75;

    if (isBack) {
      ctx.ellipse(0, 0, rxOuter, ryOuter, 0, Math.PI, 0);
      ctx.ellipse(0, 0, rxInner, ryInner, 0, 0, Math.PI, true);
    } else {
      ctx.ellipse(0, 0, rxOuter, ryOuter, 0, 0, Math.PI);
      ctx.ellipse(0, 0, rxInner, ryInner, 0, Math.PI, 0, true);
    }
    ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.fill();
    ctx.restore();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-wrapper solar-system-lab">
        <!-- Üst Kontrol Çubuğu -->
        <div class="game-top-bar">
          <div class="stat-pill">
            <span class="stat-label">🪐 Simülasyon Tarihi:</span>
            <strong id="solar-sim-day-lbl">1. Yıl, 0. Gün</strong>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" id="solar-play-btn">⏸ Durdur</button>
            <button class="btn btn-sm btn-ghost" id="solar-reset-btn">🔄 Sıfırla</button>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span style="font-size:0.75rem; color:#94a3b8;">Hız:</span>
            <input type="range" id="solar-speed-range" min="1" max="30" value="5" style="width:70px; accent-color:#38bdf8;" />
            <strong id="solar-speed-lbl" style="font-size:0.8rem; color:#38bdf8;">5x</strong>
          </div>
          <a href="solar-system.html" target="_blank" class="btn btn-sm btn-accent" style="text-decoration:none;">
            🚀 Tam Ekran Simülatör &rarr;
          </a>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <!-- 3D Canvas Sahnesi -->
        <div class="canvas-holder" style="position:relative; background:#020409; border-radius:16px; overflow:hidden; border:1px solid rgba(56,189,248,0.25);">
          <canvas id="solar-canvas"></canvas>
          <div style="position:absolute; top:10px; left:12px; pointer-events:none; font-size:0.75rem; color:#94a3b8; background:rgba(15,23,42,0.7); padding:4px 10px; border-radius:999px;">
            🖱️ Döndürmek için sürükleyin &bull; Yakınlaştırmak için tekerlek
          </div>
        </div>

        <!-- Hızlı Gezegen Seçim Çubuğu -->
        <div class="solar-dock-row" style="display:flex; gap:0.4rem; overflow-x:auto; padding:0.6rem 0; scrollbar-width:none;">
          ${this.planets.map(p => `
            <button class="solar-dock-pill ${p.id === 'earth' ? 'active' : ''}" data-id="${p.id}" onclick="app.activeGame.selectPlanet('${p.id}')" style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.4rem 0.8rem; border-radius:999px; font-size:0.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:0.3rem; white-space:nowrap; transition:all 0.2s;">
              <span>${p.icon}</span> <span>${p.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Seçili Gezegen Bilim Kartı -->
        <div class="solar-details-grid" style="display:grid; grid-template-columns:1.2fr 1fr; gap:1rem; margin-top:0.6rem;">
          <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1rem; display:flex; flex-direction:column; gap:0.6rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 id="solar-info-name" style="font-size:1.2rem; font-weight:800; color:#38bdf8;">🌍 Dünya</h3>
              <span id="solar-info-type" style="font-size:0.75rem; color:#94a3b8; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px;">Karasal Gezegen</span>
            </div>
            <p id="solar-info-desc" style="font-size:0.84rem; color:#cbd5e1; line-height:1.45;">
              Üzerinde sıvı su ve yaşam barındıran bildiğimiz tek gezegen.
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.8rem; margin-top:0.3rem;">
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">Güneş'e Uzaklık</span>
                <strong id="solar-val-dist">149.6M km (1.0 AU)</strong>
              </div>
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">Çap</span>
                <strong id="solar-val-diam">12,742 km</strong>
              </div>
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">1 Yıl Süresi</span>
                <strong id="solar-val-year">365.25 Gün</strong>
              </div>
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">1 Gün Süresi</span>
                <strong id="solar-val-day">24 Saat</strong>
              </div>
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">Yerçekimi ($g$)</span>
                <strong id="solar-val-grav">9.81 m/s²</strong>
              </div>
              <div style="background:rgba(30,41,59,0.6); padding:0.4rem 0.6rem; border-radius:8px;">
                <span style="color:#94a3b8; display:block; font-size:0.7rem;">Yüzey Sıcaklığı</span>
                <strong id="solar-val-temp">Ortalama 15 °C</strong>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.6rem;">
            <!-- Kilo Hesaplama -->
            <div style="background:linear-gradient(135deg, rgba(14,165,233,0.15), rgba(168,85,247,0.15)); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:0.9rem; display:flex; flex-direction:column; gap:0.4rem;">
              <span style="font-size:0.8rem; font-weight:700; color:#38bdf8;">⚖️ Bu Gezegende Ağırlığın Ne Olurdu?</span>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <input type="number" id="solar-calc-input" value="50" min="10" max="250" style="width:65px; background:#0f172a; border:1px solid rgba(56,189,248,0.3); color:#fff; border-radius:6px; padding:0.3rem 0.5rem; font-weight:700; text-align:center;">
                <span style="font-size:0.8rem; color:#94a3b8;">kg isen &rarr;</span>
                <strong id="solar-calc-result" style="font-size:1.1rem; color:#f59e0b;">50.0 kg</strong>
              </div>
            </div>

            <!-- Biliyor muydunuz? -->
            <div style="background:rgba(245,158,11,0.1); border-left:3px solid #f59e0b; border-radius:0 12px 12px 0; padding:0.7rem 0.9rem; font-size:0.8rem; color:#fef3c7; line-height:1.45;">
              <strong style="color:#f59e0b; display:block; margin-bottom:2px;">💡 Biliyor Muydunuz?</strong>
              <span id="solar-info-fact">Güneş etrafında saniyede 30 km hızla hareket ederiz!</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
