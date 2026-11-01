const sheets = document.querySelector('#sheets');
const rangeField = document.querySelector('#range-field');
const mathField = document.querySelector('#math-field');
const math = document.querySelector('#math');
const range = document.querySelector('#range');
const font = document.querySelector('#font');
const size = document.querySelector('#size');
const copies = document.querySelector('#copies');
const customField = document.querySelector('#custom-field');
const customNumbers = document.querySelector('#custom-numbers');
const customHint = document.querySelector('#custom-hint');
const shuffleToggle = document.querySelector('#shuffle');
const blankToggle = document.querySelector('#blank');
const labelToggle = document.querySelector('#label');
const quantity = document.querySelector('#quantity');
const quantityField = document.querySelector('#quantity-field');
const toggleList = document.querySelector('.toggle-list');
const shareButton = document.querySelector('#share');
const layouts = { quarter: { columns: 2, rows: 2 }, eighth: { columns: 2, rows: 4 }, 40: { columns: 4, rows: 5 }, 50: { columns: 3, rows: 4 }, 60: { columns: 3, rows: 3 } };
const customHintDefault = customHint.textContent;
const chineseDigits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
let colorMode = 'mono';

function chineseNumber(value) {
  if (value < 0 || value > 99) return '';
  if (value < 10) return chineseDigits[value];
  if (value === 10) return '十';
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${tens === 1 ? '' : chineseDigits[tens]}十${ones ? chineseDigits[ones] : ''}`;
}

function parseCustom(raw) {
  const numbers = [];
  raw.split(/[,，、;；\s]+/).filter(Boolean).forEach(token => {
    const match = token.match(/^(\d{1,3})\s*[-~—–到至]\s*(\d{1,3})$/);
    if (match) {
      let start = Number(match[1]);
      let end = Number(match[2]);
      if (start > end) [start, end] = [end, start];
      for (let number = start; number <= end && numbers.length < 100; number += 1) numbers.push(number);
    } else if (/^\d{1,3}$/.test(token)) {
      numbers.push(Number(token));
    }
  });
  return [...new Set(numbers)].slice(0, 100);
}

function baseNumbers() {
  if (range.value === 'custom') {
    const custom = parseCustom(customNumbers.value);
    customHint.textContent = custom.length ? customHintDefault : '没有识别到数字，先按 1 到 10 生成。';
    if (custom.length) return custom;
    return Array.from({ length: 10 }, (_, index) => index + 1);
  }
  customHint.textContent = customHintDefault;
  const [start, end] = range.value.split('-').map(Number);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function shuffleList(list) {
  const shuffled = list.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function noteMarkup(value, style) {
  if (style === 'ten') {
    const frames = [];
    for (let start = 0; start < value; start += 10) {
      const filled = Math.min(value - start, 10);
      const boxes = Array.from({ length: 10 }, (_, index) => `<span class="tf-cell${index < filled ? ' filled' : ''}"></span>`).join('');
      frames.push(`<span class="ten-frame">${boxes}</span>`);
    }
    return `<span class="ten-frames" aria-hidden="true">${frames.join('')}</span>`;
  }
  const rows = [];
  for (let left = value; left > 0; left -= 5) rows.push(Math.min(left, 5));
  const dots = rows.map(count => `<span class="dot-row">${'<span class="cell-dot"></span>'.repeat(count)}</span>`).join('');
  return `<span class="cell-dots" aria-hidden="true">${dots}</span>`;
}

function makeProblem(level) {
  const bound = level.endsWith('20') ? 20 : 10;
  const operator = level.startsWith('add') ? '+' : level.startsWith('sub') ? '-' : (Math.random() < 0.5 ? '+' : '-');
  let first;
  let second;
  if (operator === '+') {
    first = 1 + Math.floor(Math.random() * (bound - 1));
    second = 1 + Math.floor(Math.random() * (bound - first));
  } else {
    first = 2 + Math.floor(Math.random() * (bound - 1));
    second = 1 + Math.floor(Math.random() * (first - 1));
  }
  return { text: `${first} ${operator} ${second} =`, key: `${first}${operator}${second}` };
}

function applyColor() {
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === colorMode)));
  sheets.classList.toggle('monochrome', colorMode === 'mono');
}

function currentTemplate() {
  return document.querySelector('input[name="template"]:checked').value;
}

function syncUrl() {
  const isMath = currentTemplate() === 'math';
  const params = new URLSearchParams();
  if (currentTemplate() !== 'number') params.set('template', currentTemplate());
  if (isMath) {
    if (math.value !== 'add10') params.set('math', math.value);
  } else {
    if (range.value !== '1-10') params.set('range', range.value);
    if (range.value === 'custom') params.set('custom', customNumbers.value);
    if (shuffleToggle.checked) params.set('shuffle', '1');
    if (blankToggle.checked) params.set('blank', '1');
    if (labelToggle.checked) params.set('label', '1');
    if (quantity.value !== 'none') params.set('note', quantity.value);
  }
  if (font.value !== 'sans') params.set('font', font.value);
  if (size.value !== '50') params.set('size', size.value);
  if (copies.value !== '1') params.set('copies', copies.value);
  if (colorMode === 'color') params.set('color', 'color');
  const query = params.toString();
  if (location.search.slice(1) !== query) history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function renderSheets() {
  const template = currentTemplate();
  const isMath = template === 'math';
  rangeField.hidden = isMath;
  mathField.hidden = !isMath;
  customField.hidden = isMath || range.value !== 'custom';
  toggleList.hidden = isMath;
  quantityField.hidden = isMath;
  const layout = layouts[size.value];
  const capacity = layout.columns * layout.rows;
  const copiesCount = Number(copies.value);
  const quantityStyle = quantity.value;
  let cells;
  if (isMath) {
    const seen = new Set();
    cells = Array.from({ length: capacity * copiesCount }, () => {
      let problem;
      for (let tries = 0; tries < 50; tries += 1) {
        problem = makeProblem(math.value);
        if (!seen.has(problem.key)) break;
      }
      seen.add(problem.key);
      return { kind: 'math', text: problem.text };
    });
  } else {
    let numbers = [];
    for (let copy = 0; copy < copiesCount; copy += 1) numbers.push(...baseNumbers());
    if (shuffleToggle.checked) numbers = shuffleList(numbers);
    cells = numbers.map(value => ({ kind: 'number', value }));
    if (blankToggle.checked) cells = cells.flatMap(cell => [cell, { kind: 'blank' }]);
  }
  const pageCount = Math.ceil(cells.length / capacity);
  document.querySelector('label[for="copies"]').textContent = isMath ? '题目页数' : '重复份数';
  [...copies.options].forEach((option, index) => { option.textContent = `${index + 1} ${isMath ? '页' : '份'}`; });
  document.querySelector('.font-sample').dataset.font = font.value;
  sheets.innerHTML = Array.from({ length: pageCount }, (_, page) => {
    let toneIndex = 0;
    const content = cells.slice(page * capacity, (page + 1) * capacity).map(cell => {
      if (cell.kind === 'blank') return '<div class="cut-cell blank" aria-label="空白书写格"></div>';
      const tone = `data-tone="${toneIndex % 4 + 1}"`;
      toneIndex += 1;
      if (cell.kind === 'math') return `<div class="cut-cell math-cell" ${tone} aria-label="${cell.text} 作答"><span class="cell-expression">${cell.text} <span class="answer-blank" aria-hidden="true"></span></span></div>`;
      const label = labelToggle.checked ? chineseNumber(cell.value) : '';
      const note = quantityStyle !== 'none' && cell.value >= 1 && cell.value <= 20 ? noteMarkup(cell.value, quantityStyle) : '';
      const classes = ['cut-cell'];
      if (label) classes.push('has-label');
      if (note) classes.push('with-note');
      return `<div class="${classes.join(' ')}" ${tone} aria-label="${cell.value}${label ? `，${label}` : ''}"><span class="cell-number">${cell.value}</span>${label ? `<span class="cell-label">${label}</span>` : ''}${note}</div>`;
    }).join('');
    return `<article class="sheet ${template} size-${size.value}" data-font="${font.value}"><div class="sheet-content">${content}</div></article>`;
  }).join('');
  const summary = isMath
    ? [`${cells.length} 道题`, `共 ${pageCount} 张 A4 纸`, size.selectedOptions[0].textContent]
    : [`${cells.length} 个格子`, `共 ${pageCount} 张 A4 纸`, size.selectedOptions[0].textContent];
  if (!isMath) {
    if (blankToggle.checked) summary.push('含空白练习格');
    if (shuffleToggle.checked) summary.push('已打乱顺序');
    if (labelToggle.checked) summary.push('标注中文数字');
    if (quantityStyle === 'dots') summary.push('含数量点');
    else if (quantityStyle === 'ten') summary.push('含十宫格');
  }
  document.querySelector('#page-summary').textContent = summary.join('，');
  syncUrl();
}

function applySettings() {
  const params = new URLSearchParams(location.search);
  const pick = (select, key) => {
    const value = params.get(key);
    if (value !== null && [...select.options].some(option => option.value === value)) select.value = value;
  };
  const template = params.get('template');
  if (['number', 'trace', 'math'].includes(template)) document.querySelector(`input[name="template"][value="${template}"]`).checked = true;
  pick(range, 'range');
  pick(math, 'math');
  pick(font, 'font');
  pick(size, 'size');
  pick(copies, 'copies');
  const note = params.get('note');
  if (note === 'dots' || note === 'ten') quantity.value = note;
  const custom = params.get('custom');
  if (custom !== null) customNumbers.value = custom;
  shuffleToggle.checked = params.get('shuffle') === '1';
  blankToggle.checked = params.get('blank') === '1';
  labelToggle.checked = params.get('label') === '1';
  colorMode = params.get('color') === 'color' ? 'color' : 'mono';
  applyColor();
}

document.querySelectorAll('input[name="template"], #range, #math, #font, #size, #copies, #shuffle, #blank, #label, #quantity').forEach(input => input.addEventListener('change', renderSheets));
customNumbers.addEventListener('input', renderSheets);
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
  colorMode = button.dataset.color;
  applyColor();
  syncUrl();
}));
shareButton.addEventListener('click', async () => {
  syncUrl();
  const original = shareButton.textContent;
  try {
    await navigator.clipboard.writeText(location.href);
    shareButton.textContent = '已复制链接';
  } catch (error) {
    window.prompt('复制下面的设置链接', location.href);
    return;
  }
  setTimeout(() => { shareButton.textContent = original; }, 1600);
});
document.querySelector('#print').addEventListener('click', async () => {
  await document.fonts.ready;
  window.print();
});
applySettings();
renderSheets();
