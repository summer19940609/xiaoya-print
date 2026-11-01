import test from 'node:test';
import assert from 'node:assert/strict';
import { chineseNumber, defaults, makeCells, makeProblem, parseCustom, readSettings, settingsQuery } from '../src/logic.js';

test('自定义数字与中文数字', () => {
  assert.deepEqual(parseCustom('1, 3，5-8, 3'), [1, 3, 5, 6, 7, 8]);
  assert.deepEqual(parseCustom('8-5'), [5, 6, 7, 8]);
  assert.equal(parseCustom('0-999').length, 100);
  assert.equal(chineseNumber(0), '零');
  assert.equal(chineseNumber(10), '十');
  assert.equal(chineseNumber(21), '二十一');
  assert.equal(chineseNumber(100), '');
});

test('链接设置校验与还原', () => {
  const settings = { ...defaults, template: 'trace', range: 'custom', custom: '2, 4-6', blank: true, note: 'ten', size: '40', color: 'color' };
  assert.deepEqual(readSettings(`?${settingsQuery(settings)}`), settings);
  assert.equal(readSettings('?size=invalid&font=invalid').size, defaults.size);
  const math = { ...defaults, template: 'math', math: 'sequence20' };
  assert.deepEqual(readSettings(`?${settingsQuery(math)}`), math);
});

test('数字格子份数、空白格与无效输入', () => {
  const cells = makeCells({ ...defaults, range: 'custom', custom: '2,4', copies: '2', blank: true });
  assert.deepEqual(cells.map(cell => cell.kind === 'blank' ? null : cell.value), [2, null, 4, null, 2, null, 4, null]);
  assert.equal(makeCells({ ...defaults, range: 'custom', custom: '' }).length, 10);
});

test('所有题型生成合法且在指定范围内', () => {
  for (const level of ['add10', 'sub10', 'mix10', 'add20', 'sub20', 'mix20', 'compare10', 'compare20', 'sequence10', 'sequence20']) {
    const bound = level.endsWith('20') ? 20 : 10;
    for (let i = 0; i < 300; i += 1) {
      const problem = makeProblem(level);
      if (problem.type === 'compare') {
        assert.equal(problem.values.length, 2);
        assert(problem.values.every(value => value >= 0 && value <= bound));
      } else if (problem.type === 'sequence') {
        assert(problem.missing >= 0 && problem.missing <= 2);
        assert(problem.values.every(value => value >= 0 && value <= bound));
        assert.equal(problem.values[1], problem.values[0] + 1);
        assert.equal(problem.values[2], problem.values[1] + 1);
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
