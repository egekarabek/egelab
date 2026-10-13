/**
 * Oyun 2: Robotik Kodlama Lab (Algoritma Macerası)
 * Blok komut dizisi ile robotu engeller arasından hedefe ulaştırma bulmacası
 */
class RobotCodeGame {
  constructor(container) {
    this.container = container;
    this.currentLevel = 0;
    this.commands = [];
    this.isExecuting = false;
    this.robot = { x: 0, y: 0, dir: 1 }; // dir: 0:North, 1:East, 2:South, 3:West
    
    // Seviye Tasarımları (0: Boş, 1: Engel, 2: Başlangıç, 3: Hedef, 4: Kristal)
    this.levels = [
      {
        id: 1,
        title: "Temel Adımlar: Düz Rota",
        width: 5,
        height: 5,
        startDir: 1, // Doğu
        grid: [
          [0, 0, 0, 0, 0],
          [2, 0, 0, 0, 3],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 2,
        title: "Dönemeç: İlk Viraj",
        width: 5,
        height: 5,
        startDir: 1, // Doğu
        grid: [
          [0, 0, 0, 0, 0],
          [2, 0, 0, 1, 0],
          [1, 1, 0, 1, 0],
          [0, 0, 0, 0, 3],
          [0, 0, 0, 0, 0]
        ]
      },
      {
        id: 3,
        title: "Enerji Toplama",
        width: 5,
        height: 5,
        startDir: 0, // Kuzey
        grid: [
          [1, 0, 3, 0, 0],
          [1, 0, 1, 1, 0],
          [0, 4, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 2, 0, 0, 0]
        ]
      },
      {
        id: 4,
        title: "Labirent Kaçışı",
        width: 6,
        height: 6,
        startDir: 1,
        grid: [
          [2, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0],
          [0, 0, 0, 0, 1, 0],
          [0, 1, 1, 4, 1, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 3]
        ]
      },
      {
        id: 5,
        title: "Büyük Siber Sınav",
        width: 6,
        height: 6,
        startDir: 1,
        grid: [
          [2, 0, 0, 1, 0, 0],
          [1, 1, 0, 1, 4, 0],
          [0, 0, 0, 0, 1, 0],
          [0, 1, 1, 0, 1, 0],
          [0, 4, 1, 0, 0, 0],
          [1, 0, 0, 0, 1, 3]
        ]
      }
    ];
  }

  start() {
    this.currentLevel = 0;
    this.commands = [];
    this.isExecuting = false;
    storage.unlockBadge('first_step');
    this.loadLevel(this.currentLevel);
  }

  stop() {
    this.isExecuting = false;
  }

  loadLevel(index) {
    if (index >= this.levels.length) {
      this.gameWon();
      return;
    }
    this.currentLevel = index;
    this.commands = [];
    this.isExecuting = false;

    const lvl = this.levels[this.currentLevel];
    this.activeGrid = lvl.grid.map(row => [...row]);
    
    // Başlangıç pozisyonunu bul
    for (let r = 0; r < lvl.height; r++) {
      for (let c = 0; c < lvl.width; c++) {
        if (this.activeGrid[r][c] === 2) {
          this.robot = { x: c, y: r, dir: lvl.startDir };
        }
      }
    }

    this.render();
  }

  addCommand(type) {
    if (this.isExecuting) return;
    if (this.commands.length >= 25) return;
    sound.playClick();
    this.commands.push(type);
    this.updateCommandList();
  }

  removeLastCommand() {
    if (this.isExecuting) return;
    sound.playClick();
    this.commands.pop();
    this.updateCommandList();
  }

  clearCommands() {
    if (this.isExecuting) return;
    sound.playClick();
    this.commands = [];
    this.updateCommandList();
  }

  async runAlgorithm() {
    if (this.isExecuting || this.commands.length === 0) return;
    this.isExecuting = true;
    this.setControlsDisabled(true);

    const lvl = this.levels[this.currentLevel];
    // Robotu başlangıç noktasına al
    for (let r = 0; r < lvl.height; r++) {
      for (let c = 0; c < lvl.width; c++) {
        if (lvl.grid[r][c] === 2) {
          this.robot = { x: c, y: r, dir: lvl.startDir };
        }
      }
    }
    this.drawGrid();

    // Komutları sırayla çalıştır
    for (let i = 0; i < this.commands.length; i++) {
      if (!this.isExecuting) break;

      this.highlightCommand(i);
      const cmd = this.commands[i];
      sound.playStep();

      let success = this.executeStep(cmd);
      this.drawGrid();

      await new Promise(r => setTimeout(r, 450));

      if (!success) {
        sound.playWrong();
        this.showMessage('🚨 Dikkat! Robot duvara veya engele çarptı. Tekrar dene!', 'error');
        this.resetRobotToStart();
        this.isExecuting = false;
        this.setControlsDisabled(false);
        this.clearHighlight();
        return;
      }

      // Enerji pili/kristali toplandı mı?
      if (this.activeGrid[this.robot.y][this.robot.x] === 4) {
        sound.playCorrect();
        this.activeGrid[this.robot.y][this.robot.x] = 0; // Kristali topla
        storage.addXP(15);
        this.showMessage('🔋 +15 XP! Enerji pili toplandı!', 'success');
      }

      // Hedefe ulaşıldı mı?
      if (this.activeGrid[this.robot.y][this.robot.x] === 3) {
        sound.playVictory();
        this.isExecuting = false;
        this.clearHighlight();

        storage.addXP(40);
        if (this.currentLevel >= 2) {
          storage.unlockBadge('code_hacker');
        }

        this.showMessage('🎉 Harika Algoritma! Seviye Başarıyla Tamamlandı!', 'success');
        setTimeout(() => {
          this.loadLevel(this.currentLevel + 1);
        }, 1200);
        return;
      }
    }

    this.clearHighlight();
    this.isExecuting = false;
    this.setControlsDisabled(false);

    if (this.activeGrid[this.robot.y][this.robot.x] !== 3) {
      sound.playWrong();
      this.showMessage('🤔 Robot hedefe ulaşamadı. Komutları gözden geçir!', 'info');
      this.resetRobotToStart();
    }
  }

  executeStep(cmd) {
    const lvl = this.levels[this.currentLevel];
    // dir: 0: K (Up), 1: D (Right), 2: G (Down), 3: B (Left)
    if (cmd === 'FORWARD') {
      let nx = this.robot.x;
      let ny = this.robot.y;
      if (this.robot.dir === 0) ny--;
      else if (this.robot.dir === 1) nx++;
      else if (this.robot.dir === 2) ny++;
      else if (this.robot.dir === 3) nx--;

      // Sınır kontrolü
      if (nx < 0 || nx >= lvl.width || ny < 0 || ny >= lvl.height) {
        return false;
      }
      // Engel kontrolü
      if (this.activeGrid[ny][nx] === 1) {
        return false;
      }
      this.robot.x = nx;
      this.robot.y = ny;
    } else if (cmd === 'TURN_LEFT') {
      this.robot.dir = (this.robot.dir + 3) % 4;
    } else if (cmd === 'TURN_RIGHT') {
      this.robot.dir = (this.robot.dir + 1) % 4;
    }
    return true;
  }

  resetRobotToStart() {
    const lvl = this.levels[this.currentLevel];
    this.activeGrid = lvl.grid.map(row => [...row]);
    for (let r = 0; r < lvl.height; r++) {
      for (let c = 0; c < lvl.width; c++) {
        if (this.activeGrid[r][c] === 2) {
          this.robot = { x: c, y: r, dir: lvl.startDir };
        }
      }
    }
    this.drawGrid();
  }

  setControlsDisabled(disabled) {
    const btns = this.container.querySelectorAll('.code-cmd-btn, .run-algo-btn, .clear-cmd-btn');
    btns.forEach(b => b.disabled = disabled);
  }

  highlightCommand(index) {
    const items = this.container.querySelectorAll('.cmd-chip');
    items.forEach((item, idx) => {
      item.classList.toggle('active-step', idx === index);
    });
  }

  clearHighlight() {
    const items = this.container.querySelectorAll('.cmd-chip');
    items.forEach(item => item.classList.remove('active-step'));
  }

  showMessage(msg, type) {
    const box = this.container.querySelector('#robot-msg-box');
    if (box) {
      box.textContent = msg;
      box.className = `robot-msg-box msg-${type}`;
    }
  }

  gameWon() {
    sound.playVictory();
    storage.unlockBadge('code_hacker');
    storage.addXP(100);

    this.container.innerHTML = `
      <div class="game-over-card animate-pop">
        <div class="game-over-icon">🏆</div>
        <h2>Tebrikler Usta Yazılımcı!</h2>
        <p>Bütün Robotik Kodlama seviyelerini başarıyla tamamladın!</p>
        <div class="new-high-badge">🎖️ Kodlama Şampiyonu</div>
        <div class="game-over-actions">
          <button class="btn btn-primary" id="robot-replay-btn">Baştan Oyna</button>
          <button class="btn btn-secondary" onclick="app.showHome()">Ana Menüye Dön</button>
        </div>
      </div>
    `;

    const btn = this.container.querySelector('#robot-replay-btn');
    if (btn) btn.onclick = () => this.start();
  }

  drawGrid() {
    const boardEl = this.container.querySelector('#robot-board');
    if (!boardEl) return;
    const lvl = this.levels[this.currentLevel];

    boardEl.style.gridTemplateColumns = `repeat(${lvl.width}, 1fr)`;
    boardEl.innerHTML = '';

    for (let r = 0; r < lvl.height; r++) {
      for (let c = 0; c < lvl.width; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';

        const cellType = this.activeGrid[r][c];
        if (cellType === 1) {
          cell.classList.add('cell-wall');
          cell.innerHTML = '🧱';
        } else if (cellType === 3) {
          cell.classList.add('cell-goal');
          cell.innerHTML = '🎯';
        } else if (cellType === 4) {
          cell.classList.add('cell-crystal');
          cell.innerHTML = '🔋';
        }

        // Robot buradaysa
        if (this.robot.x === c && this.robot.y === r) {
          const rob = document.createElement('div');
          rob.className = `robot-avatar dir-${this.robot.dir}`;
          rob.innerHTML = '🤖';
          cell.appendChild(rob);
        }

        boardEl.appendChild(cell);
      }
    }
  }

  updateCommandList() {
    const listEl = this.container.querySelector('#command-queue');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (this.commands.length === 0) {
      listEl.innerHTML = '<span class="empty-hint">Aşağıdaki bloklara tıklayarak algoritmanı oluştur...</span>';
      return;
    }

    const labels = {
      'FORWARD': '⬆️ İleri',
      'TURN_LEFT': '↩️ Sola',
      'TURN_RIGHT': '↪️ Sağa'
    };

    this.commands.forEach((cmd, idx) => {
      const chip = document.createElement('div');
      chip.className = 'cmd-chip';
      chip.textContent = `${idx + 1}. ${labels[cmd] || cmd}`;
      listEl.appendChild(chip);
    });
  }

  render() {
    const lvl = this.levels[this.currentLevel];

    this.container.innerHTML = `
      <div class="game-wrapper robot-code-view">
        <div class="game-top-bar">
          <div class="stat-pill"><span class="stat-label">Seviye:</span> <strong>${this.currentLevel + 1} / ${this.levels.length}</strong></div>
          <div class="stat-pill"><span class="stat-label">Görev:</span> <span>${lvl.title}</span></div>
          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menü</button>
        </div>

        <div id="robot-msg-box" class="robot-msg-box">Robotunu yönlendirerek hedef laboratuvara (🎯) ulaştır!</div>

        <div class="robot-play-area">
          <div class="board-container">
            <div id="robot-board" class="robot-grid"></div>
          </div>

          <div class="code-editor-panel">
            <div class="editor-header">
              <span>Algoritma Blokları</span>
              <div class="editor-subactions">
                <button class="btn-micro clear-cmd-btn" id="del-last-btn">⌫ Geri Al</button>
                <button class="btn-micro clear-cmd-btn" id="clear-all-btn">Temizle</button>
              </div>
            </div>

            <div id="command-queue" class="command-queue-area"></div>

            <div class="block-palette">
              <button class="code-cmd-btn btn-forward" id="cmd-forward">⬆️ İleri Git</button>
              <button class="code-cmd-btn btn-turn" id="cmd-left">↩️ Sola Dön</button>
              <button class="code-cmd-btn btn-turn" id="cmd-right">↪️ Sağa Dön</button>
            </div>

            <button class="btn btn-primary run-algo-btn" id="run-algo-btn">▶️ KODU ÇALIŞTIR</button>
          </div>
        </div>
      </div>
    `;

    this.drawGrid();
    this.updateCommandList();

    // Event listeners
    this.container.querySelector('#cmd-forward').onclick = () => this.addCommand('FORWARD');
    this.container.querySelector('#cmd-left').onclick = () => this.addCommand('TURN_LEFT');
    this.container.querySelector('#cmd-right').onclick = () => this.addCommand('TURN_RIGHT');
    this.container.querySelector('#del-last-btn').onclick = () => this.removeLastCommand();
    this.container.querySelector('#clear-all-btn').onclick = () => this.clearCommands();
    this.container.querySelector('#run-algo-btn').onclick = () => this.runAlgorithm();
  }
}
