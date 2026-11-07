import test from 'node:test';
import assert from 'node:assert/strict';
import { chineseNumber, defaults, makeCells, makeProblem, mathLabels, numberParity, parseCustom, readSettings, settingsQuery } from '../src/logic.js';

test('自定义数字、中文数字与单双数', () => {
  assert.deepEqual(parseCustom('1, 3，5-8, 3'), [1, 3, 5, 6, 7, 8]);
  assert.deepEqual(parseCustom('8-5'), [5, 6, 7, 8]);
  assert.equal(parseCustom('0-999').length, 100);
  assert.equal(chineseNumber(0), '零');
  assert.equal(chineseNumber(10), '十');
  assert.equal(chineseNumber(21), '二十一');
  assert.equal(chineseNumber(100), '');
  assert.equal(numberParity(0), '双数');
  assert.equal(numberParity(7), '单数');
  assert.equal(numberParity(18), '双数');
  assert.equal(numberParity(-1), '');
});

test('链接设置校验与还原', () => {
  const settings = { ...defaults, template: 'trace', range: 'custom', custom: '2, 4-6', blank: true, parity: true, grid: true, note: 'sticks', font: 'yozai', fontScale: 'large', fontWeight: 'bold', traceStyle: 'solid', traceShade: 'dark', size: '40', color: 'color' };
  assert.deepEqual(readSettings(`?${settingsQuery(settings)}`), settings);
  assert.equal(readSettings('?size=invalid&font=invalid&fontScale=invalid').size, defaults.size);
  assert.equal(readSettings('?font=dots&traceStyle=dotted').font, 'dots');
  assert.equal(settingsQuery({ ...defaults, font: 'custom' }), '');
  const math = { ...defaults, template: 'math', math: 'bond20' };
  assert.deepEqual(readSettings(`?${settingsQuery(math)}`), math);
});

test('数字格子份数、预设范围、空白格与无效输入', () => {
  const cells = makeCells({ ...defaults, range: 'custom', custom: '2,4', copies: '2', blank: true });
  assert.deepEqual(cells.map(cell => cell.kind === 'blank' ? null : cell.value), [2, null, 4, null, 2, null, 4, null]);
  assert.equal(makeCells({ ...defaults, range: '0-10' }).length, 11);
  assert.equal(makeCells({ ...defaults, range: '0-10' })[0].value, 0);
  assert.equal(makeCells({ ...defaults, range: '1-100' }).length, 100);
  assert.equal(makeCells({ ...defaults, range: 'custom', custom: '' }).length, 10);
});

test('所有题型生成合法且在指定范围内', () => {
  for (const level of Object.keys(mathLabels)) {
    const bound = level.endsWith('20') ? 20 : 10;
    for (let i = 0; i < 300; i += 1) {
      const problem = makeProblem(level);
      if (problem.type === 'count') {
        assert(problem.value >= 1 && problem.value <= bound);
      } else if (problem.type === 'bond') {
        assert.equal(problem.values.length, 3);
        const [total, left, right] = problem.values;
        assert(total >= 2 && total <= bound);
        assert(left >= 1 && right >= 1);
        assert.equal(total, left + right);
        assert(problem.missing >= 0 && problem.missing <= 2);
      } else if (problem.type === 'compare') {
        assert.equal(problem.values.length, 2);
        assert(problem.values.every(value => value >= 0 && value <= bound));
      } else if (problem.type === 'sequence') {
        assert(problem.missing >= 0 && problem.missing <= 2);
        assert(problem.values.every(value => value >= 0 && value <= bound));
        assert.equal(problem.values[1], problem.values[0] + 1);
        assert.equal(problem.values[2], problem.values[1] + 1);
      } else if (problem.type === 'neighbor') {
        assert.equal(problem.values.length, 3);
        assert(problem.values.every(value => value >= 0 && value <= bound));
        assert.equal(problem.values[1], problem.values[0] + 1);
        assert.equal(problem.values[2], problem.values[1] + 1);
      } else if (problem.type === 'fill') {
        assert(problem.missing === 0 || problem.missing === 1);
        const [first, second, answer] = problem.values;
        assert(first >= 1 && second >= 1);
        assert.equal(answer, problem.operator === '+' ? first + second : first - second);
        assert(answer >= 0 && answer <= bound);
      } else {
        const match = problem.text.match(/^(\d+) ([+-]) (\d+) =$/);
        assert(match);
        const [, first, operator, second] = match;
        const answer = operator === '+' ? Number(first) + Number(second) : Number(first) - Number(second);
        assert(answer >= 0 && answer <= bound);
      }
    }
  }
  assert.equal(makeCells({ ...defaults, template: 'math', math: 'compare10', size: 'quarter', copies: '3' }).length, 12);
});
