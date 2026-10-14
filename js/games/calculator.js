/**
 * Ege Lab - Bilimsel & Laboratuvar Hesap Makinesi
 * Standart, Bilimsel, Ortaokul LGS (EBOB-EKOK & Asal Çarpanlar) ve Fen Birim Dönüştürücü
 */
class ScienceCalculatorGame {
  constructor(container) {
    this.container = container;
    this.expression = '';
    this.currentInput = '0';
    this.lastResult = null;
    this.angleMode = 'deg'; // 'deg' veya 'rad'
    this.memory = 0;
    this.activeTab = 'standard'; // 'standard', 'lgs', 'converter', 'history'
    this.operationCount = 0;
    this.history = this.loadHistory();
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  start() {
    this.render();
    window.addEventListener('keydown', this.boundKeyHandler);
  }

  stop() {
    window.removeEventListener('keydown', this.boundKeyHandler);
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('egelab_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('egelab_calc_history', JSON.stringify(this.history.slice(0, 30)));
    } catch (e) {
      console.error('Hesap geçmişi kaydedilemedi:', e);
    }
  }

  recordOperation(expr, result) {
    this.operationCount++;
    this.history.unshift({
      expr: expr,
      result: result,
      date: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    this.saveHistory();

    // XP ve Başarı Kontrolü
    storage.addXP(2);
    const totalOps = (storage.getHighScore('calculator') || 0) + 1;
    storage.updateScore('calculator', totalOps);

    if (totalOps >= 10) {
      if (storage.unlockBadge('calc_master')) {
        if (window.app && app.showToast) {
          app.showToast('🎖️ Tebrikler! "Hesap Dehası" rozetini kazandın!');
        }
      }
    }
  }

  switchTab(tab) {
    sound.playClick();
    this.activeTab = tab;
    this.render();
  }

  toggleAngleMode() {
    sound.playClick();
    this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
    const angleBtn = this.container.querySelector('#calc-angle-toggle');
    const angleBadge = this.container.querySelector('#calc-angle-badge');
    if (angleBtn) angleBtn.textContent = this.angleMode.toUpperCase();
    if (angleBadge) angleBadge.textContent = this.angleMode.toUpperCase();
  }

  // Tuş İşlemleri
  inputDigit(d) {
    sound.playClick();
    if (this.currentInput === '0' || this.currentInput === 'Hata' || this.lastResult !== null) {
      this.currentInput = String(d);
      this.lastResult = null;
    } else {
      if (this.currentInput.length < 24) {
        this.currentInput += String(d);
      }
    }
    this.updateDisplay();
  }

  inputDot() {
    sound.playClick();
    if (this.lastResult !== null) {
      this.currentInput = '0.';
      this.lastResult = null;
    } else if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
    this.updateDisplay();
  }

  inputOperator(op) {
    sound.playClick();
    if (this.currentInput === 'Hata') {
      this.currentInput = '0';
    }

    if (this.expression !== '' && this.currentInput === '0' && this.lastResult === null) {
      // Son operatörü güncelle
      this.expression = this.expression.trim().replace(/[+\-×÷^%]$/, op) + ' ';
    } else {
      this.expression += `${this.currentInput} ${op} `;
      this.currentInput = '0';
      this.lastResult = null;
    }
    this.updateDisplay();
  }

  inputParenthesis(p) {
    sound.playClick();
    if (p === '(') {
      if (this.currentInput !== '0' && this.lastResult === null) {
        this.expression += `${this.currentInput} × ( `;
      } else {
        this.expression += '( ';
      }
      this.currentInput = '0';
    } else {
      this.expression += `${this.currentInput} ) `;
      this.currentInput = '0';
    }
    this.updateDisplay();
  }

  clearEntry() {
    sound.playClick();
    this.currentInput = '0';
    this.updateDisplay();
  }

  clearAll() {
    sound.playClick();
    this.expression = '';
    this.currentInput = '0';
    this.lastResult = null;
    this.updateDisplay();
  }

  backspace() {
    sound.playClick();
    if (this.lastResult !== null) {
      this.expression = '';
      this.lastResult = null;
      return;
    }
    if (this.currentInput.length > 1 && this.currentInput !== 'Hata') {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
    }
    this.updateDisplay();
  }

  toggleSign() {
    sound.playClick();
    if (this.currentInput === '0' || this.currentInput === 'Hata') return;
    if (this.currentInput.startsWith('-')) {
      this.currentInput = this.currentInput.slice(1);
    } else {
      this.currentInput = '-' + this.currentInput;
    }
    this.updateDisplay();
  }

  inputConstant(name) {
    sound.playClick();
    if (name === 'pi') {
      this.currentInput = String(Math.PI.toFixed(8));
    } else if (name === 'e') {
      this.currentInput = String(Math.E.toFixed(8));
    }
    this.lastResult = null;
    this.updateDisplay();
  }

  // Bilimsel Fonksiyonlar (Tek Değişkenli)
  applyFunction(funcName) {
    sound.playClick();
    let val = parseFloat(this.currentInput);
    if (isNaN(val)) return;

    let res = 0;
    let desc = `${funcName}(${val})`;

    try {
      switch (funcName) {
        case 'sqr':
          res = Math.pow(val, 2);
          desc = `(${val})²`;
          break;
        case 'cube':
          res = Math.pow(val, 3);
          desc = `(${val})³`;
          break;
        case 'sqrt':
          if (val < 0) throw new Error('Geçersiz Kök');
          res = Math.sqrt(val);
          desc = `√(${val})`;
          break;
        case 'cbrt':
          res = Math.cbrt(val);
          desc = `∛(${val})`;
          break;
        case 'inv':
          if (val === 0) throw new Error('Sıfıra Bölünemez');
          res = 1 / val;
          desc = `1/(${val})`;
          break;
        case 'abs':
          res = Math.abs(val);
          desc = `|${val}|`;
          break;
        case 'fact':
          if (val < 0 || !Number.isInteger(val) || val > 170) throw new Error('Geçersiz n!');
          res = this.factorial(val);
          desc = `${val}!`;
          break;
        case 'sin': {
          const rad = this.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          res = Math.sin(rad);
          // Yakınlaştırma (örneğin sin(180) = 0)
          if (Math.abs(res) < 1e-12) res = 0;
          break;
        }
        case 'cos': {
          const rad = this.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          res = Math.cos(rad);
          if (Math.abs(res) < 1e-12) res = 0;
          break;
        }
        case 'tan': {
          const rad = this.angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          if (this.angleMode === 'deg' && (Math.abs(val % 180) === 90)) {
            throw new Error('Tanımsız');
          }
          res = Math.tan(rad);
          if (Math.abs(res) < 1e-12) res = 0;
          break;
        }
        case 'log':
          if (val <= 0) throw new Error('Geçersiz log');
          res = Math.log10(val);
          break;
        case 'ln':
          if (val <= 0) throw new Error('Geçersiz ln');
          res = Math.log(val);
          break;
        case 'percent':
          res = val / 100;
          desc = `${val}%`;
          break;
        default:
          return;
      }

      const formattedRes = this.formatNumber(res);
      this.recordOperation(desc, formattedRes);
      this.currentInput = formattedRes;
      this.lastResult = res;
      this.updateDisplay();
      sound.playCorrect();
    } catch (err) {
      sound.playWrong();
      this.currentInput = err.message || 'Hata';
      this.updateDisplay();
    }
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    let total = 1;
    for (let i = 2; i <= n; i++) total *= i;
    return total;
  }

  // Bellek İşlemleri
  memoryAction(action) {
    sound.playClick();
    const val = parseFloat(this.currentInput) || 0;
    switch (action) {
      case 'MC':
        this.memory = 0;
        break;
      case 'MR':
        this.currentInput = this.formatNumber(this.memory);
        this.lastResult = null;
        break;
      case 'M+':
        this.memory += val;
        break;
      case 'M-':
        this.memory -= val;
        break;
    }
    this.updateDisplay();
  }

  // Hesaplama ve İfade Çözücü
  calculate() {
    let fullExpr = this.expression + this.currentInput;
    if (!fullExpr.trim() || fullExpr.trim() === '0') return;

    try {
      const sanitized = this.prepareExpression(fullExpr);
      const result = this.evaluateTokens(sanitized);

      if (!isFinite(result) || isNaN(result)) {
        throw new Error('Sıfıra Bölünemez');
      }

      const formatted = this.formatNumber(result);
      sound.playCorrect();
      this.recordOperation(fullExpr + ' =', formatted);

      this.expression = fullExpr + ' =';
      this.currentInput = formatted;
      this.lastResult = result;
      this.updateDisplay();
    } catch (err) {
      sound.playWrong();
      this.currentInput = err.message === 'Sıfıra Bölünemez' ? 'Sıfıra Bölünemez' : 'Hata';
      this.updateDisplay();
    }
  }

  prepareExpression(expr) {
    // Görsel operatörleri standart matematiksel simgelere çevir
    return expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, `(${Math.PI})`)
      .replace(/\be\b/g, `(${Math.E})`);
  }

  evaluateTokens(expr) {
    // Güvenli matematiksel ayrıştırıcı (Shunting-Yard & RPN)
    const tokens = this.tokenize(expr);
    const rpn = this.toRPN(tokens);
    return this.evalRPN(rpn);
  }

  tokenize(expr) {
    const tokens = [];
    let i = 0;
    expr = expr.replace(/\s+/g, '');

    while (i < expr.length) {
      const c = expr[i];

      // Sayı yakalama (ondalık veya negatif dahil)
      if (/\d/.test(c) || (c === '.' && /\d/.test(expr[i + 1]))) {
        let numStr = '';
        while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'NUM', val: parseFloat(numStr) });
        continue;
      }

      // Parantezler
      if (c === '(' || c === ')') {
        tokens.push({ type: c });
        i++;
        continue;
      }

      // Operatörler
      if (['+', '-', '*', '/', '^', '%'].includes(c)) {
        // Unary eksi kontrolü: ifadedeki ilk eleman veya önceki token '(' ya da operatörse
        const prev = tokens[tokens.length - 1];
        if (c === '-' && (!prev || prev.type === '(' || prev.type === 'OP')) {
          tokens.push({ type: 'OP', val: 'u-', prec: 4, assoc: 'right' });
        } else {
          let prec = 1;
          let assoc = 'left';
          if (c === '*' || c === '/' || c === '%') prec = 2;
          if (c === '^') {
            prec = 3;
            assoc = 'right';
          }
          tokens.push({ type: 'OP', val: c, prec: prec, assoc: assoc });
        }
        i++;
        continue;
      }

      // Atla
      i++;
    }

    return tokens;
  }

  toRPN(tokens) {
    const output = [];
    const ops = [];

    for (const t of tokens) {
      if (t.type === 'NUM') {
        output.push(t);
      } else if (t.type === 'OP') {
        while (
          ops.length > 0 &&
          ops[ops.length - 1].type === 'OP' &&
          ((t.assoc === 'left' && t.prec <= ops[ops.length - 1].prec) ||
            (t.assoc === 'right' && t.prec < ops[ops.length - 1].prec))
        ) {
          output.push(ops.pop());
        }
        ops.push(t);
      } else if (t.type === '(') {
        ops.push(t);
      } else if (t.type === ')') {
        while (ops.length > 0 && ops[ops.length - 1].type !== '(') {
          output.push(ops.pop());
        }
        if (ops.length > 0 && ops[ops.length - 1].type === '(') {
          ops.pop();
        }
      }
    }

    while (ops.length > 0) {
      const top = ops.pop();
      if (top.type !== '(') output.push(top);
    }

    return output;
  }

  evalRPN(rpn) {
    const stack = [];

    for (const t of rpn) {
      if (t.type === 'NUM') {
        stack.push(t.val);
      } else if (t.type === 'OP') {
        if (t.val === 'u-') {
          const a = stack.pop() || 0;
          stack.push(-a);
        } else {
          const b = stack.pop();
          const a = stack.pop();
          if (a === undefined || b === undefined) throw new Error('Geçersiz İfade');

          let res = 0;
          switch (t.val) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) throw new Error('Sıfıra Bölünemez');
              res = a / b;
              break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
          }
          stack.push(res);
        }
      }
    }

    if (stack.length !== 1) throw new Error('Hata');
    return stack[0];
  }

  formatNumber(num) {
    if (isNaN(num)) return 'Hata';
    if (!isFinite(num)) return 'Sonsuz';
    // Çok küçük/büyük sayılar hariç ondalık yuvarlama
    const rounded = Math.round(num * 1e10) / 1e10;
    if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6);
    }
    return String(rounded);
  }

  updateDisplay() {
    const exprEl = this.container.querySelector('#calc-expr-line');
    const mainEl = this.container.querySelector('#calc-main-display');
    const memBadge = this.container.querySelector('#calc-memory-badge');

    if (exprEl) exprEl.textContent = this.expression || ' ';
    if (mainEl) mainEl.textContent = this.currentInput;
    if (memBadge) {
      memBadge.style.opacity = this.memory !== 0 ? '1' : '0.2';
    }
  }

  copyResult() {
    sound.playClick();
    if (navigator.clipboard && this.currentInput) {
      navigator.clipboard.writeText(this.currentInput)
        .then(() => {
          if (window.app && app.showToast) {
            app.showToast(`📋 Sonuç kopyalandı: ${this.currentInput}`);
          }
        })
        .catch(() => {});
    }
  }

  handleKeyDown(e) {
    // Yalnızca standart hesap makinesi sekmesinde klavye dinle
    if (this.activeTab !== 'standard') return;

    // Hedef input alanı değilse dinle
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      this.inputDigit(parseInt(e.key, 10));
    } else if (e.key === '.' || e.key === ',') {
      e.preventDefault();
      this.inputDot();
    } else if (e.key === '+' || e.key === '-') {
      e.preventDefault();
      this.inputOperator(e.key);
    } else if (e.key === '*') {
      e.preventDefault();
      this.inputOperator('×');
    } else if (e.key === '/') {
      e.preventDefault();
      this.inputOperator('÷');
    } else if (e.key === '%') {
      e.preventDefault();
      this.inputOperator('%');
    } else if (e.key === '^') {
      e.preventDefault();
      this.inputOperator('^');
    } else if (e.key === '(' || e.key === ')') {
      e.preventDefault();
      this.inputParenthesis(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      this.calculate();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspace();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.clearAll();
    }
  }

  // ==========================================================
  // ORTAOKUL LGS ARAÇLARI: EBOB-EKOK & ASAL ÇARPANLAR
  // ==========================================================
  solveEbobEkok() {
    sound.playClick();
    const num1 = parseInt(this.container.querySelector('#lgs-num1').value, 10);
    const num2 = parseInt(this.container.querySelector('#lgs-num2').value, 10);
    const resultBox = this.container.querySelector('#lgs-ebob-result');

    if (!num1 || !num2 || num1 <= 0 || num2 <= 0) {
      if (resultBox) {
        resultBox.innerHTML = '<p class="error-msg">⚠️ Lütfen 0\'dan büyük pozitif tam sayılar girin.</p>';
      }
      return;
    }

    const gcdVal = this.getGcd(num1, num2);
    const lcmVal = (num1 * num2) / gcdVal;

    // Asal çarpan algoritması adımları
    const steps = this.generateDivisionLadder(num1, num2);

    resultBox.innerHTML = `
      <div class="lgs-summary-cards animate-pop">
        <div class="lgs-stat-box ebob-box">
          <span class="lgs-box-label">EBOB (${num1}, ${num2})</span>
          <strong class="lgs-box-val">${gcdVal}</strong>
          <span class="lgs-box-desc">En Büyük Ortak Bölen</span>
        </div>
        <div class="lgs-stat-box ekok-box">
          <span class="lgs-box-label">EKOK (${num1}, ${num2})</span>
          <strong class="lgs-box-val">${lcmVal}</strong>
          <span class="lgs-box-desc">En Küçük Ortak Kat</span>
        </div>
      </div>

      <div class="lgs-ladder-container">
        <h4>🪜 Adım Adım Ortak Bölen Algoritması (Bölme Merdiveni):</h4>
        <div class="ladder-table-wrap">
          <table class="ladder-table">
            <thead>
              <tr>
                <th>1. Sayı</th>
                <th>2. Sayı</th>
                <th>Bölen Asal</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              ${steps.map(s => `
                <tr class="${s.isCommon ? 'common-row' : ''}">
                  <td>${s.a}</td>
                  <td>${s.b}</td>
                  <td class="divisor-cell"><strong>${s.divisor}</strong> ${s.isCommon ? '⭐' : ''}</td>
                  <td>${s.isCommon ? '<span class="tag-common">İkisini de böler (EBOB)</span>' : '<span class="tag-single">Tekini böler</span>'}</td>
                </tr>
              `).join('')}
              <tr class="end-row">
                <td>1</td>
                <td>1</td>
                <td>-</td>
                <td><span class="tag-done">Tamamlandı ✔️</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ladder-expl">
          💡 <strong>İpucu:</strong> Yanında ⭐ işareti olan ortak asal bölenlerin çarpımı <strong>EBOB</strong>'u, 
          sağ sütundaki tüm asal sayıların çarpımı ise <strong>EKOK</strong>'u verir!
        </p>
      </div>
    `;

    sound.playCorrect();
    storage.addXP(4);
    this.recordOperation(`EBOB(${num1}, ${num2}) = ${gcdVal}, EKOK = ${lcmVal}`, 'Tamamlandı');
  }

  getGcd(a, b) {
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  generateDivisionLadder(a, b) {
    const steps = [];
    let curA = a;
    let curB = b;
    let divisor = 2;

    while (curA > 1 || curB > 1) {
      if (curA % divisor === 0 || curB % divisor === 0) {
        const dividesA = curA % divisor === 0;
        const dividesB = curB % divisor === 0;
        const isCommon = dividesA && dividesB;

        steps.push({
          a: curA,
          b: curB,
          divisor: divisor,
          isCommon: isCommon
        });

        if (dividesA) curA = curA / divisor;
        if (dividesB) curB = curB / divisor;
      } else {
        divisor = divisor === 2 ? 3 : divisor + 2;
      }
    }

    return steps;
  }

  solvePrimeFactors() {
    sound.playClick();
    const numInput = this.container.querySelector('#lgs-prime-num');
    const resultBox = this.container.querySelector('#lgs-prime-result');
    const n = parseInt(numInput.value, 10);

    if (!n || n <= 1) {
      resultBox.innerHTML = '<p class="error-msg">⚠️ Lütfen 1\'den büyük bir tam sayı girin.</p>';
      return;
    }

    const isPrime = this.checkIsPrime(n);
    const factorMap = this.getPrimeFactorization(n);
    const divisors = this.getAllDivisors(n);

    // Üslü gösterim stringi oluştur
    const expStr = Object.entries(factorMap)
      .map(([prime, exp]) => `${prime}<sup>${exp}</sup>`)
      .join(' &times; ');

    resultBox.innerHTML = `
      <div class="prime-analysis-card animate-pop">
        <div class="prime-header-status ${isPrime ? 'is-prime' : 'not-prime'}">
          <span class="status-icon">${isPrime ? '✨' : '🧩'}</span>
          <div>
            <h3>${n} sayısı ${isPrime ? 'bir ASAL SAYIDIR!' : 'asal sayı DEĞİLDİR (Bileşik Sayıdır).'}</h3>
            <p>${isPrime ? 'Yalnızca 1\'e ve kendisine kalansız bölünür.' : 'Birden fazla asal çarpanın çarpımı şeklinde yazılabilir.'}</p>
          </div>
        </div>

        <div class="factor-details-grid">
          <div class="factor-stat-card">
            <span class="f-label">Asal Çarpanlar Üslü Gösterimi:</span>
            <div class="f-math">${expStr}</div>
          </div>
          <div class="factor-stat-card">
            <span class="f-label">Farklı Asal Çarpanları:</span>
            <div class="f-tags">
              ${Object.keys(factorMap).map(p => `<span class="prime-pill">${p}</span>`).join('')}
            </div>
          </div>
          <div class="factor-stat-card">
            <span class="f-label">Pozitif Bölen Sayısı (PBS):</span>
            <div class="f-math"><strong>${divisors.length}</strong> Adet</div>
          </div>
        </div>

        <div class="all-divisors-box">
          <span class="div-label">Tüm Pozitif Bölenleri (${divisors.length} adet):</span>
          <div class="div-chips-wrap">
            ${divisors.map(d => `<span class="divisor-chip">${d}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    sound.playCorrect();
    storage.addXP(4);
    this.recordOperation(`Asal Çarpan(${n}) = ${Object.keys(factorMap).join(',')}`, isPrime ? 'Asal' : 'Bileşik');
  }

  checkIsPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  getPrimeFactorization(num) {
    const factors = {};
    let d = 2;
    let temp = num;

    while (d * d <= temp) {
      if (temp % d === 0) {
        factors[d] = (factors[d] || 0) + 1;
        temp /= d;
      } else {
        d = d === 2 ? 3 : d + 2;
      }
    }
    if (temp > 1) {
      factors[temp] = (factors[temp] || 0) + 1;
    }
    return factors;
  }

  getAllDivisors(num) {
    const list = [];
    for (let i = 1; i * i <= num; i++) {
      if (num % i === 0) {
        list.push(i);
        if (i * i !== num) {
          list.push(num / i);
        }
      }
    }
    list.sort((a, b) => a - b);
    return list;
  }

  // ==========================================================
  // FEN & BİLİM BİRİM DÖNÜŞTÜRÜCÜ
  // ==========================================================
  convertUnits() {
    sound.playClick();
    const cat = this.container.querySelector('#conv-category').value;
    const fromUnit = this.container.querySelector('#conv-from').value;
    const toUnit = this.container.querySelector('#conv-to').value;
    const valInput = parseFloat(this.container.querySelector('#conv-value').value);
    const resultBox = this.container.querySelector('#conv-result-box');

    if (isNaN(valInput)) {
      resultBox.innerHTML = '<p class="error-msg">⚠️ Lütfen geçerli bir sayı girin.</p>';
      return;
    }

    let result = 0;
    let formula = '';

    if (cat === 'length') {
      // Temel metre (m)
      const toMeters = { km: 1000, m: 1, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048 };
      const meters = valInput * toMeters[fromUnit];
      result = meters / toMeters[toUnit];
      formula = `1 ${fromUnit} = ${(toMeters[fromUnit] / toMeters[toUnit]).toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;
    } else if (cat === 'mass') {
      // Temel gram (g)
      const toGrams = { ton: 1000000, kg: 1000, g: 1, mg: 0.001, lb: 453.59237 };
      const grams = valInput * toGrams[fromUnit];
      result = grams / toGrams[toUnit];
      formula = `1 ${fromUnit} = ${(toGrams[fromUnit] / toGrams[toUnit]).toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;
    } else if (cat === 'temp') {
      // Sıcaklık
      let celsius = valInput;
      if (fromUnit === 'f') celsius = (valInput - 32) * (5 / 9);
      if (fromUnit === 'k') celsius = valInput - 273.15;

      if (toUnit === 'c') result = celsius;
      else if (toUnit === 'f') result = (celsius * (9 / 5)) + 32;
      else if (toUnit === 'k') result = celsius + 273.15;

      formula = `${fromUnit.toUpperCase()} &rarr; ${toUnit.toUpperCase()} Termodinamik Dönüşümü`;
    } else if (cat === 'volume') {
      // Temel Litre (L)
      const toLiters = { m3: 1000, l: 1, ml: 0.001, cm3: 0.001 };
      const liters = valInput * toLiters[fromUnit];
      result = liters / toLiters[toUnit];
      formula = `1 ${fromUnit} = ${(toLiters[fromUnit] / toLiters[toUnit]).toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;
    } else if (cat === 'speed') {
      // Temel m/s
      const toMs = { kmh: 1 / 3.6, ms: 1, mph: 0.44704 };
      const ms = valInput * toMs[fromUnit];
      result = ms / toMs[toUnit];
      formula = `1 ${fromUnit} = ${(toMs[fromUnit] / toMs[toUnit]).toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`;
    }

    const formattedResult = this.formatNumber(result);

    resultBox.innerHTML = `
      <div class="conv-result-card animate-pop">
        <span class="conv-res-sub">${valInput} ${fromUnit.toUpperCase()} eşittir:</span>
        <div class="conv-res-main">
          <strong>${formattedResult}</strong> <span>${toUnit.toUpperCase()}</span>
        </div>
        <div class="conv-formula-tag">📐 Formül: ${formula}</div>
        <button class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText('${formattedResult}'); app.showToast('Kopyalandı: ${formattedResult}');">📋 Sonucu Kopyala</button>
      </div>
    `;

    sound.playCorrect();
    storage.addXP(2);
    this.recordOperation(`${valInput} ${fromUnit} &rarr; ${toUnit}`, formattedResult);
  }

  updateUnitOptions() {
    const cat = this.container.querySelector('#conv-category').value;
    const fromSelect = this.container.querySelector('#conv-from');
    const toSelect = this.container.querySelector('#conv-to');

    const unitDefs = {
      length: [
        { id: 'km', label: 'Kilometre (km)' },
        { id: 'm', label: 'Metre (m)' },
        { id: 'cm', label: 'Santimetre (cm)' },
        { id: 'mm', label: 'Milimetre (mm)' },
        { id: 'in', label: 'İnç (in)' },
        { id: 'ft', label: 'Fit (ft)' }
      ],
      mass: [
        { id: 'ton', label: 'Ton (t)' },
        { id: 'kg', label: 'Kilogram (kg)' },
        { id: 'g', label: 'Gram (g)' },
        { id: 'mg', label: 'Miligram (mg)' },
        { id: 'lb', label: 'Pound (lb)' }
      ],
      temp: [
        { id: 'c', label: 'Santigrat (°C)' },
        { id: 'f', label: 'Fahrenhayt (°F)' },
        { id: 'k', label: 'Kelvin (K)' }
      ],
      volume: [
        { id: 'm3', label: 'Metreküp (m³)' },
        { id: 'l', label: 'Litre (L)' },
        { id: 'ml', label: 'Mililitre (mL)' },
        { id: 'cm3', label: 'Santimetreküp (cm³)' }
      ],
      speed: [
        { id: 'kmh', label: 'Kilometre/Saat (km/h)' },
        { id: 'ms', label: 'Metre/Saniye (m/s)' },
        { id: 'mph', label: 'Mil/Saat (mph)' }
      ]
    };

    const opts = unitDefs[cat] || [];
    const html = opts.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
    fromSelect.innerHTML = html;
    toSelect.innerHTML = html;
    if (opts.length > 1) {
      toSelect.selectedIndex = 1;
    }
  }

  // ==========================================================
  // ANA ARAYÜZ (RENDER)
  // ==========================================================
  render() {
    this.container.innerHTML = `
      <div class="game-wrapper calculator-view animate-fade">
        <!-- Üst Başlık & Sekmeler -->
        <div class="game-top-bar">
          <div class="calc-header-title">
            <span class="calc-badge-icon">🧮</span>
            <div>
              <h2 class="calc-main-title">Ege Lab Bilimsel Hesap Makinesi</h2>
              <span class="calc-sub-text">Standart, Bilimsel, LGS EBOB-EKOK & Fen Dönüştürücü</span>
            </div>
          </div>

          <div class="calc-nav-tabs">
            <button class="calc-tab-btn ${this.activeTab === 'standard' ? 'active' : ''}" onclick="app.activeGame.switchTab('standard')">
              🧮 Hesap Makinesi
            </button>
            <button class="calc-tab-btn ${this.activeTab === 'lgs' ? 'active' : ''}" onclick="app.activeGame.switchTab('lgs')">
              📐 LGS Matematik Lab
            </button>
            <button class="calc-tab-btn ${this.activeTab === 'converter' ? 'active' : ''}" onclick="app.activeGame.switchTab('converter')">
              🧪 Birim Dönüştürücü
            </button>
            <button class="calc-tab-btn ${this.activeTab === 'history' ? 'active' : ''}" onclick="app.activeGame.switchTab('history')">
              📜 Geçmiş (${this.history.length})
            </button>
          </div>

          <button class="btn btn-sm btn-ghost" onclick="app.showHome()">&larr; Menüye Dön</button>
        </div>

        <!-- Sekme İçeriği -->
        <div class="calc-body-area">
          ${this.renderActiveTabContent()}
        </div>
      </div>
    `;

    // Sekmeye özel başlatmalar
    if (this.activeTab === 'standard') {
      this.updateDisplay();
    } else if (this.activeTab === 'converter') {
      this.updateUnitOptions();
    }
  }

  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'standard':
        return this.renderStandardCalculator();
      case 'lgs':
        return this.renderLgsTools();
      case 'converter':
        return this.renderUnitConverter();
      case 'history':
        return this.renderHistoryTape();
      default:
        return '';
    }
  }

  // 1. STANDART & BİLİMSEL HESAP MAKİNESİ GÖRÜNÜMÜ
  renderStandardCalculator() {
    return `
      <div class="calc-main-layout">
        <!-- Ekran Alanı (Glassmorphism & Neon LCD) -->
        <div class="calc-screen-panel">
          <div class="calc-screen-header">
            <div class="calc-screen-indicators">
              <span id="calc-angle-badge" class="calc-indicator-pill">${this.angleMode.toUpperCase()}</span>
              <span id="calc-memory-badge" class="calc-indicator-pill mem-pill">M</span>
              <span class="calc-indicator-hint">Klavye Aktif ⌨️</span>
            </div>
            <button class="calc-copy-btn" title="Sonucu Kopyala" onclick="app.activeGame.copyResult()">
              📋 Kopyala
            </button>
          </div>

          <div id="calc-expr-line" class="calc-expr-line">${this.expression || ' '}</div>
          <div id="calc-main-display" class="calc-main-display">${this.currentInput}</div>
        </div>

        <!-- Tuş Takımı -->
        <div class="calc-keypad-panel">
          
          <!-- Bilimsel Fonksiyonlar Çubuğu -->
          <div class="calc-grid-scientific">
            <button id="calc-angle-toggle" class="calc-key key-util key-toggle" onclick="app.activeGame.toggleAngleMode()" title="Açı Modu (Derece / Radyan)">${this.angleMode.toUpperCase()}</button>
            <button class="calc-key key-mem" onclick="app.activeGame.memoryAction('MC')" title="Belleği Temizle">MC</button>
            <button class="calc-key key-mem" onclick="app.activeGame.memoryAction('MR')" title="Belleği Çağır">MR</button>
            <button class="calc-key key-mem" onclick="app.activeGame.memoryAction('M+')" title="Belleğe Ekle">M+</button>
            <button class="calc-key key-mem" onclick="app.activeGame.memoryAction('M-')" title="Bellekten Çıkar">M-</button>
            <button class="calc-key key-fn" onclick="app.activeGame.inputParenthesis('(')">(</button>
            <button class="calc-key key-fn" onclick="app.activeGame.inputParenthesis(')')">)</button>

            <!-- 2. Satır: Trigonometri ve Üsler -->
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('sin')">sin</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('cos')">cos</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('tan')">tan</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('sqr')" title="Karesi (x²)">x²</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('cube')" title="Küpü (x³)">x³</button>
            <button class="calc-key key-sci" onclick="app.activeGame.inputOperator('^')" title="Üs Alma (xʸ)">xʸ</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('sqrt')" title="Karekök (√x)">√x</button>

            <!-- 3. Satır: Logaritma ve Sabitler -->
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('log')">log</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('ln')">ln</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('inv')" title="Çarpmaya göre tersi (1/x)">1/x</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('abs')" title="Mutlak Değer (|x|)">|x|</button>
            <button class="calc-key key-sci" onclick="app.activeGame.applyFunction('fact')" title="Faktöriyel (n!)">n!</button>
            <button class="calc-key key-sci" onclick="app.activeGame.inputConstant('pi')" title="Pi Sayısı (π = 3.14159...)">π</button>
            <button class="calc-key key-sci" onclick="app.activeGame.inputConstant('e')" title="Euler Sayısı (e = 2.71828...)">e</button>
          </div>

          <!-- Standart Rakam & Temel İşlem Tuşları (4 Sütun) -->
          <div class="calc-grid-standard">
            <!-- Satır 1 -->
            <button class="calc-key key-clear" onclick="app.activeGame.clearAll()" title="Tümünü Temizle (Esc)">AC</button>
            <button class="calc-key key-backspace" onclick="app.activeGame.backspace()" title="Geri Sil (Backspace)">⌫</button>
            <button class="calc-key key-fn" onclick="app.activeGame.applyFunction('percent')" title="Yüzde (%)">%</button>
            <button class="calc-key key-op" onclick="app.activeGame.inputOperator('÷')">÷</button>

            <!-- Satır 2 -->
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(7)">7</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(8)">8</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(9)">9</button>
            <button class="calc-key key-op" onclick="app.activeGame.inputOperator('×')">×</button>

            <!-- Satır 3 -->
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(4)">4</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(5)">5</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(6)">6</button>
            <button class="calc-key key-op" onclick="app.activeGame.inputOperator('-')">-</button>

            <!-- Satır 4 -->
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(1)">1</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(2)">2</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(3)">3</button>
            <button class="calc-key key-op" onclick="app.activeGame.inputOperator('+')">+</button>

            <!-- Satır 5 -->
            <button class="calc-key key-fn" onclick="app.activeGame.toggleSign()" title="İşaret Değiştir (±)">±</button>
            <button class="calc-key key-num" onclick="app.activeGame.inputDigit(0)">0</button>
            <button class="calc-key key-fn" onclick="app.activeGame.inputDot()">.</button>
            <button class="calc-key key-equal" onclick="app.activeGame.calculate()" title="Eşittir (Enter)">=</button>
          </div>

        </div>
      </div>
    `;
  }

  // 2. ORTAOKUL LGS MATEMATİK ARAÇLARI GÖRÜNÜMÜ
  renderLgsTools() {
    return `
      <div class="lgs-tools-wrapper animate-fade">
        <!-- 1. Bölüm: EBOB & EKOK -->
        <div class="lgs-tool-card">
          <div class="lgs-card-header">
            <span class="tool-icon">🪜</span>
            <div>
              <h3>EBOB & EKOK Hesaplayıcı</h3>
              <p>İki sayının En Büyük Ortak Bölenini, En Küçük Ortak Katını ve adım adım bölme algoritmasını incele.</p>
            </div>
          </div>

          <div class="lgs-input-row">
            <div class="lgs-input-group">
              <label for="lgs-num1">1. Sayı:</label>
              <input type="number" id="lgs-num1" min="1" value="24" />
            </div>
            <div class="lgs-input-group">
              <label for="lgs-num2">2. Sayı:</label>
              <input type="number" id="lgs-num2" min="1" value="36" />
            </div>
            <button class="btn btn-primary lgs-action-btn" onclick="app.activeGame.solveEbobEkok()">
              ⚡ EBOB & EKOK Hesapla
            </button>
          </div>

          <div id="lgs-ebob-result" class="lgs-result-area"></div>
        </div>

        <!-- 2. Bölüm: Asal Çarpanlara Ayırma & Asal Testi -->
        <div class="lgs-tool-card">
          <div class="lgs-card-header">
            <span class="tool-icon">⚛️</span>
            <div>
              <h3>Asal Çarpanlara Ayırma & Asallık Testi</h3>
              <p>Bir sayının asal olup olmadığını öğren, üslü biçimde asal çarpanlarını ve pozitif bölenlerini listele.</p>
            </div>
          </div>

          <div class="lgs-input-row">
            <div class="lgs-input-group" style="flex: 1;">
              <label for="lgs-prime-num">İncelenecek Sayı:</label>
              <input type="number" id="lgs-prime-num" min="2" value="360" />
            </div>
            <button class="btn btn-accent lgs-action-btn" onclick="app.activeGame.solvePrimeFactors()">
              🔍 Asal Çarpanları Bul
            </button>
          </div>

          <div id="lgs-prime-result" class="lgs-result-area"></div>
        </div>
      </div>
    `;
  }

  // 3. FEN & BİLİM BİRİM DÖNÜŞTÜRÜCÜ GÖRÜNÜMÜ
  renderUnitConverter() {
    return `
      <div class="converter-wrapper animate-fade">
        <div class="conv-tool-card">
          <div class="conv-card-header">
            <span class="tool-icon">🌡️</span>
            <div>
              <h3>Fen Bilimleri & Fizik Birim Dönüştürücüsü</h3>
              <p>Ortaokul Fen Bilimleri derslerindeki uzunluk, kütle, sıcaklık, hacim ve hız birimlerini anında çevir.</p>
            </div>
          </div>

          <div class="conv-controls-grid">
            <div class="conv-control-field">
              <label>Kategori Seçin:</label>
              <select id="conv-category" onchange="app.activeGame.updateUnitOptions(); app.activeGame.convertUnits();">
                <option value="length">📏 Uzunluk (km, m, cm, mm...)</option>
                <option value="mass">⚖️ Kütle & Ağırlık (ton, kg, g...)</option>
                <option value="temp">🌡️ Sıcaklık (°C, °F, Kelvin)</option>
                <option value="volume">🧪 Hacim & Sıvı (L, mL, m³...)</option>
                <option value="speed">🚀 Hız (km/h, m/s, mph)</option>
              </select>
            </div>

            <div class="conv-control-field">
              <label>Miktar / Değer:</label>
              <input type="number" id="conv-value" value="100" oninput="app.activeGame.convertUnits()" />
            </div>

            <div class="conv-control-field">
              <label>Dönüştürülecek Birim (Kaynak):</label>
              <select id="conv-from" onchange="app.activeGame.convertUnits()"></select>
            </div>

            <div class="conv-control-field">
              <label>Hedef Birim:</label>
              <select id="conv-to" onchange="app.activeGame.convertUnits()"></select>
            </div>
          </div>

          <div id="conv-result-box" class="conv-result-container"></div>
        </div>
      </div>
    `;
  }

  // 4. HESAP GEÇMİŞİ GÖRÜNÜMÜ
  renderHistoryTape() {
    if (this.history.length === 0) {
      return `
        <div class="history-empty-state animate-fade">
          <span class="empty-icon">📜</span>
          <h3>Henüz bir hesaplama yapılmadı</h3>
          <p>Standart hesap makinesinde veya LGS araçlarında işlem yaptıkça tüm adımlar burada listelenecektir.</p>
          <button class="btn btn-primary" onclick="app.activeGame.switchTab('standard')">Hesap Yapmaya Başla</button>
        </div>
      `;
    }

    return `
      <div class="history-wrapper animate-fade">
        <div class="history-top-actions">
          <h3>📜 Son Yapılan Hesaplamalar (${this.history.length})</h3>
          <button class="btn btn-sm btn-ghost text-danger" onclick="app.activeGame.clearHistory()">
            🗑️ Geçmişi Temizle
          </button>
        </div>

        <div class="history-tape-list">
          ${this.history.map((item, idx) => `
            <div class="history-tape-item" onclick="app.activeGame.restoreFromHistory('${item.result}')">
              <div class="tape-header">
                <span class="tape-time">${item.date}</span>
                <span class="tape-copy-hint">Geri Yükle &rarr;</span>
              </div>
              <div class="tape-expr">${item.expr}</div>
              <div class="tape-result">= ${item.result}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  restoreFromHistory(val) {
    sound.playClick();
    this.currentInput = String(val);
    this.expression = '';
    this.lastResult = null;
    this.switchTab('standard');
    if (window.app && app.showToast) {
      app.showToast(`Değer aktarıldı: ${val}`);
    }
  }

  clearHistory() {
    sound.playClick();
    this.history = [];
    this.saveHistory();
    this.render();
    if (window.app && app.showToast) {
      app.showToast('Hesap geçmişi temizlendi.');
    }
  }
}
