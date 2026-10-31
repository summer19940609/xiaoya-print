const sheets = document.querySelector('#sheets');
const range = document.querySelector('#range');
const font = document.querySelector('#font');
const size = document.querySelector('#size');
const copies = document.querySelector('#copies');
const layouts = { quarter: { columns: 2, rows: 2 }, eighth: { columns: 2, rows: 4 }, 40: { columns: 4, rows: 5 }, 50: { columns: 3, rows: 4 }, 60: { columns: 3, rows: 3 } };

function renderSheets() {
  const template = document.querySelector('input[name="template"]:checked').value;
  const [start, end] = range.value.split('-').map(Number);
  const layout = layouts[size.value];
  const capacity = layout.columns * layout.rows;
  const numbers = Array.from({ length: (end - start + 1) * Number(copies.value) }, (_, index) => start + index % (end - start + 1));
  const pageCount = Math.ceil(numbers.length / capacity);
  document.querySelector('.font-sample').dataset.font = font.value;
  sheets.innerHTML = Array.from({ length: pageCount }, (_, page) => {
    const content = numbers.slice(page * capacity, (page + 1) * capacity).map(number => `<div class="cut-cell" aria-label="${number}"><span class="cell-number">${number}</span></div>`).join('');
    return `<article class="sheet ${template} size-${size.value}" data-font="${font.value}"><div class="sheet-content">${content}</div></article>`;
  }).join('');
  document.querySelector('#page-summary').textContent = `${numbers.length} 个格子，共 ${pageCount} 张 A4 纸，${size.selectedOptions[0].textContent}`;
}

document.querySelectorAll('input[name="template"], #range, #font, #size, #copies').forEach(input => input.addEventListener('change', renderSheets));
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-color]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  sheets.classList.toggle('monochrome', button.dataset.color === 'mono');
}));
document.querySelector('#print').addEventListener('click', async () => {
  await document.fonts.ready;
  window.print();
});
renderSheets();
