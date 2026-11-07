export const layouts = { quarter: { columns: 2, rows: 2 }, eighth: { columns: 2, rows: 4 }, 40: { columns: 4, rows: 5 }, 50: { columns: 3, rows: 4 }, 60: { columns: 3, rows: 3 } };
export const sizeLabels = { quarter: 'A4 四等分（4 格）', eighth: 'A4 八等分（8 格）', 40: '4 厘米正方形', 50: '5 厘米正方形', 60: '6 厘米正方形' };
export const mathLabels = {
  add10: '10 以内加法',
  sub10: '10 以内减法',
  mix10: '10 以内加减混合',
  add20: '20 以内加法',
  sub20: '20 以内减法',
  mix20: '20 以内加减混合',
  fill10: '10 以内算式填空',
  fill20: '20 以内算式填空',
  bond10: '10 以内数的分与合',
  bond20: '20 以内数的分与合',
  compare10: '10 以内比大小',
  compare20: '20 以内比大小',
  sequence10: '10 以内数列填空',
  sequence20: '20 以内数列填空',
  neighbor10: '10 以内相邻数',
  neighbor20: '20 以内相邻数',
  count10: '10 以内看图点数',
  count20: '20 以内看图点数',
};
export const fontLabels = {
  sans: '思源黑体（印刷黑体）',
  andika: '绘本印刷体（无底1·开口4）',
  short: '绘本童书体（单竖1·开口4）',
  xiaoya: '幼教铅笔体（斜竖1·开口4）',
  round: '启蒙圆体（圆润饱满）',
  wenkai: '霞鹜文楷（楷书手写）',
  yozai: '悠哉手写（圆体手写）',
  serif: '思源宋体（传统衬线）',
  dots: '点阵虚线（连点控笔）',
};
export const fontScaleLabels = { small: '紧凑留白', normal: '标准适中', large: '饱满大字' };
export const fontWeightLabels = { normal: '标准笔画', bold: '加粗醒目' };
export const traceStyleLabels = { outline: '空心双线', solid: '浅灰实心', dotted: '点阵虚线' };
export const traceShadeLabels = { light: '浅淡省墨', medium: '适中清晰', dark: '加深醒目' };
export const defaults = { template: 'number', range: '1-10', custom: '1, 3, 5-8, 12', math: 'add10', shuffle: false, blank: false, label: false, parity: false, grid: false, note: 'none', font: 'sans', fontScale: 'normal', fontWeight: 'normal', traceStyle: 'outline', traceShade: 'medium', size: '50', copies: '1', color: 'mono' };

export function readSettings(search) {
  const params = new URLSearchParams(search);
  const settings = { ...defaults };
  const choices = { template: ['number', 'trace', 'math'], range: ['0-10', '1-10', '11-20', '1-20', '1-50', '1-100', 'custom'], math: Object.keys(mathLabels), note: ['none', 'dots', 'ten', 'sticks', 'blocks'], font: Object.keys(fontLabels), fontScale: Object.keys(fontScaleLabels), fontWeight: Object.keys(fontWeightLabels), traceStyle: Object.keys(traceStyleLabels), traceShade: Object.keys(traceShadeLabels), size: Object.keys(sizeLabels), copies: ['1', '2', '3'], color: ['mono', 'color'] };
  for (const [key, values] of Object.entries(choices)) if (values.includes(params.get(key))) settings[key] = params.get(key);
  for (const key of ['shuffle', 'blank', 'label', 'parity', 'grid']) settings[key] = params.get(key) === '1';
  if (params.has('custom')) settings.custom = params.get('custom');
  return settings;
}

export function settingsQuery(settings) {
  const params = new URLSearchParams();
  if (settings.template !== defaults.template) params.set('template', settings.template);
  if (settings.template === 'math') {
    if (settings.math !== defaults.math) params.set('math', settings.math);
  } else {
    if (settings.range !== defaults.range) params.set('range', settings.range);
    if (settings.range === 'custom') params.set('custom', settings.custom);
    for (const key of ['shuffle', 'blank', 'label', 'parity', 'grid']) if (settings[key]) params.set(key, '1');
    if (settings.note !== defaults.note) params.set('note', settings.note);
  }
  for (const key of ['font', 'fontScale', 'fontWeight', 'traceStyle', 'traceShade', 'size', 'copies', 'color']) {
    if (key === 'font' && settings.font === 'custom') continue;
    if (settings[key] !== defaults[key]) params.set(key, settings[key]);
  }
  return params.toString();
}

export function parseCustom(raw) {
  const numbers = [];
  raw.split(/[,，、;；\s]+/).filter(Boolean).forEach(token => {
    const match = token.match(/^(\d{1,3})[-~—–到至](\d{1,3})$/);
    if (match) {
      let start = Number(match[1]);
      let end = Number(match[2]);
      if (start > end) [start, end] = [end, start];
      for (let number = start; number <= end && numbers.length < 100; number += 1) numbers.push(number);
    } else if (/^\d{1,3}$/.test(token)) numbers.push(Number(token));
  });
  return [...new Set(numbers)].slice(0, 100);
}

export function chineseNumber(value) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value < 0 || value > 99) return '';
  if (value < 10) return digits[value];
  const tens = Math.floor(value / 10);
  return `${tens === 1 ? '' : digits[tens]}十${value % 10 ? digits[value % 10] : ''}`;
}

export function numberParity(value) {
  if (value < 0 || !Number.isInteger(value)) return '';
  return value % 2 === 0 ? '双数' : '单数';
}

function shuffleList(list) {
  const shuffled = list.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

export function makeProblem(level) {
  const bound = level.endsWith('20') ? 20 : 10;
  if (level.startsWith('count')) {
    const value = 1 + Math.floor(Math.random() * bound);
    return { type: 'count', value, key: `count:${value}` };
  }
  if (level.startsWith('bond')) {
    const total = 2 + Math.floor(Math.random() * (bound - 1));
    const left = 1 + Math.floor(Math.random() * (total - 1));
    const right = total - left;
    const missing = Math.floor(Math.random() * 3);
    return { type: 'bond', values: [total, left, right], missing, key: `bond:${total}:${left}:${missing}` };
  }
  if (level.startsWith('compare')) {
    const first = Math.floor(Math.random() * (bound + 1));
    const second = Math.floor(Math.random() * (bound + 1));
    return { type: 'compare', values: [first, second], key: `compare:${first}:${second}` };
  }
  if (level.startsWith('sequence')) {
    const start = Math.floor(Math.random() * (bound - 1));
    const missing = Math.floor(Math.random() * 3);
    return { type: 'sequence', values: [start, start + 1, start + 2], missing, key: `sequence:${start}:${missing}` };
  }
  if (level.startsWith('neighbor')) {
    const center = 1 + Math.floor(Math.random() * (bound - 1));
    return { type: 'neighbor', values: [center - 1, center, center + 1], key: `neighbor:${center}` };
  }
  const operator = level.startsWith('add') ? '+' : level.startsWith('sub') ? '-' : (Math.random() < 0.5 ? '+' : '-');
  const first = operator === '+' ? 1 + Math.floor(Math.random() * (bound - 1)) : 2 + Math.floor(Math.random() * (bound - 1));
  const second = operator === '+' ? 1 + Math.floor(Math.random() * (bound - first)) : 1 + Math.floor(Math.random() * (first - 1));
  if (level.startsWith('fill')) {
    const answer = operator === '+' ? first + second : first - second;
    const missing = Math.floor(Math.random() * 2);
    return { type: 'fill', operator, values: [first, second, answer], missing, key: `fill:${first}${operator}${second}:${missing}` };
  }
  return { text: `${first} ${operator} ${second} =`, key: `${first}${operator}${second}` };
}

export function makeCells(settings) {
  const capacity = layouts[settings.size].columns * layouts[settings.size].rows;
  if (settings.template === 'math') {
    const seen = new Set();
    return Array.from({ length: capacity * Number(settings.copies) }, () => {
      let problem;
      for (let tries = 0; tries < 50; tries += 1) {
        problem = makeProblem(settings.math);
        if (!seen.has(problem.key)) break;
      }
      seen.add(problem.key);
      return { kind: 'math', ...problem };
    });
  }
  let numbers;
  if (settings.range === 'custom') {
    numbers = parseCustom(settings.custom);
    if (!numbers.length) numbers = Array.from({ length: 10 }, (_, index) => index + 1);
  } else {
    const [start, end] = settings.range.split('-').map(Number);
    numbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
  numbers = Array.from({ length: Number(settings.copies) }, () => numbers).flat();
  if (settings.shuffle) numbers = shuffleList(numbers);
  const cells = numbers.map(value => ({ kind: 'number', value }));
  return settings.blank ? cells.flatMap(cell => [cell, { kind: 'blank' }]) : cells;
}
