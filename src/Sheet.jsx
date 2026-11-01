import React from 'react';

const digitFonts = {
  sans: 'font-[XiaoyaSans,var(--font-body)]',
  wenkai: 'font-[XiaoyaWenkai,var(--font-body)]',
  serif: 'font-[XiaoyaSerif,var(--font-body)]',
};
const tones = ['text-print-red', 'text-print-orange', 'text-print-yellow', 'text-print-green', 'text-print-cyan', 'text-print-blue', 'text-print-purple'];
const sheetSizes = {
  '40': '[--cell-size:21.978022cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:4]',
  '50': '[--cell-size:27.472527cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:3]',
  '60': '[--cell-size:32.967033cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:3]',
  quarter: '[--cell-size:50cqw] [--cell-width:50cqw] [--cell-height:70.7142857cqw] [--columns:2]',
  eighth: '[--cell-size:35.3571429cqw] [--cell-width:50cqw] [--cell-height:35.3571429cqw] [--columns:2]',
};
const baseCell = 'cut-cell min-h-0 min-w-0 outline-1 outline-dashed outline-cut -outline-offset-[0.5px]';
const box = 'problem-box inline-block h-[calc(var(--cell-size)*.2)] w-[calc(var(--cell-size)*.2)] shrink-0 border border-cut mx-[calc(var(--cell-size)*.025)]';

export function FontSample({ font }) {
  return <div className={`font-sample min-h-12 overflow-hidden rounded-sm bg-well p-3 text-[22px] leading-6 tracking-[.06em] whitespace-nowrap text-ink ${digitFonts[font]} max-workspace:col-start-2 max-workspace:row-start-2 max-workspace:text-[20px] max-workspace:tracking-[.04em] workspace:mt-2`} data-font={font} aria-label="所选字体预览">1234567890</div>;
}

function QuantityNote({ value, style, trace }) {
  if (style === 'none' || value < 1 || value > 20) return null;
  if (style === 'ten') {
    return <span className="ten-frames flex gap-[calc(var(--cell-size)*.05)] leading-none" aria-hidden="true">{Array.from({ length: Math.ceil(value / 10) }, (_, frame) => <span className="ten-frame grid grid-cols-[repeat(5,calc(var(--cell-size)*var(--mark-size)))] grid-rows-[repeat(2,calc(var(--cell-size)*var(--mark-size)))] gap-px bg-cut p-px" key={frame}>{Array.from({ length: 10 }, (_, index) => {
      const filled = index < Math.min(value - frame * 10, 10);
      return <span className={`tf-cell ${filled ? 'filled' : ''} ${filled && !trace ? 'bg-current' : 'bg-white'} ${filled && trace ? 'shadow-[inset_0_0_0_1px_var(--color-trace)]' : ''}`} key={index} />;
    })}</span>)}</span>;
  }
  return <span className="cell-dots flex flex-col items-center gap-[calc(var(--cell-size)*var(--mark-gap))] leading-none" aria-hidden="true">{Array.from({ length: Math.ceil(value / 5) }, (_, row) => <span className="dot-row flex gap-[calc(var(--cell-size)*var(--mark-gap))]" key={row}>{Array.from({ length: Math.min(value - row * 5, 5) }, (_, index) => <span className={`cell-dot h-[calc(var(--cell-size)*var(--mark-size))] w-[calc(var(--cell-size)*var(--mark-size))] rounded-full ${trace ? 'bg-transparent shadow-[inset_0_0_0_1px_var(--color-trace)]' : 'bg-current'}`} key={index} />)}</span>)}</span>;
}

function Cell({ cell, tone, settings, chineseNumber }) {
  if (cell.kind === 'blank') return <div className={`${baseCell} blank grid place-items-center`} aria-label="空白书写格" />;
  const trace = settings.template === 'trace';
  const ink = trace ? 'text-trace' : settings.color === 'mono' ? 'text-print-mono' : tones[tone - 1];
  if (cell.kind === 'math') {
    if (cell.type === 'compare' || cell.type === 'sequence') {
      const compare = cell.type === 'compare';
      const values = cell.values.map((value, index) => !compare && index === cell.missing ? '空格' : String(value));
      const accessible = compare ? `${values[0]} 和 ${values[1]}，填写大于、小于或等于` : `${values.join('、')}，填数字`;
      return <div className={`${baseCell} math-cell learning-cell flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.08)] ${ink}`} data-tone={tone} aria-label={accessible}>
        <span className="problem-hint font-body text-[calc(var(--cell-size)*.1)] leading-[1.3] whitespace-nowrap text-ink-2" aria-hidden="true">{compare ? '填 >、< 或 =' : '填数字'}</span>
        <span className="learning-expression flex items-center justify-center text-[calc(var(--cell-size)*.16)] leading-none whitespace-nowrap" aria-hidden="true">{compare ? <>{cell.values[0]}<span className={box} />{cell.values[1]}</> : cell.values.map((value, index) => <React.Fragment key={index}>{index > 0 ? '，' : null}{index === cell.missing ? <span className={box} /> : value}</React.Fragment>)}</span>
      </div>;
    }
    return <div className={`${baseCell} math-cell grid place-items-center ${ink}`} data-tone={tone} aria-label={`${cell.text} 作答`}><span className="cell-expression text-[calc(var(--cell-size)*.15)] leading-none tracking-[.02em] whitespace-nowrap [font-variant-numeric:lining-nums] [text-box:trim-both_cap_alphabetic]">{cell.text} <span className="answer-blank ml-[.08em] inline-block h-0 w-[1.2em] border-b border-cut align-baseline" aria-hidden="true" /></span></div>;
  }
  const label = settings.label ? chineseNumber(cell.value) : '';
  const note = settings.note !== 'none' && cell.value >= 1 && cell.value <= 20;
  const variables = note && label ? '[--num-scale:.42] [--note-gap:.028] [--mark-size:.06] [--mark-gap:.022] [--label-scale:.11]' : `[--mark-size:.072] [--mark-gap:.028] [--label-scale:.13] ${note ? '[--num-scale:.5] [--note-gap:.04]' : label ? '[--num-scale:.6]' : '[--num-scale:.67]'}`;
  const fallback = settings.font === 'wenkai' ? 'supports-not-[text-box:trim-both_cap_alphabetic]:translate-y-[.016em]' : settings.font === 'serif' ? 'supports-not-[text-box:trim-both_cap_alphabetic]:-translate-y-[.075em]' : 'supports-not-[text-box:trim-both_cap_alphabetic]:-translate-y-[.077em]';
  return <div className={`${baseCell} ${note ? 'with-note flex flex-col items-center justify-center gap-[calc(var(--cell-size)*var(--note-gap))]' : 'grid place-items-center'} ${label ? 'has-label' : ''} ${variables} ${ink}`} data-tone={tone} aria-label={`${cell.value}${label ? `，${label}` : ''}`}>
    <span className={`cell-number text-[calc(var(--cell-size)*var(--num-scale))] leading-none [font-variant-numeric:lining-nums] [text-box:trim-both_cap_alphabetic] ${fallback} ${trace ? '!text-transparent [-webkit-text-stroke:1px_var(--color-trace)]' : ''}`}>{cell.value}</span>{label ? <span className="cell-label font-body text-[calc(var(--cell-size)*var(--label-scale))] leading-none font-medium tracking-[.04em]">{label}</span> : null}<QuantityNote value={cell.value} style={settings.note} trace={trace} />
  </div>;
}

export default function Sheet({ cells, page, capacity, settings, chineseNumber }) {
  const size = settings.size;
  const split = size === 'quarter' || size === 'eighth';
  let toneIndex = cells.slice(0, page * capacity).filter(cell => cell.kind !== 'blank').length;
  return <article className={`sheet ${settings.template} size-${size} @container flex aspect-[210/297] flex-col bg-white shadow-sheet ${digitFonts[settings.font]} ${sheetSizes[size]} ${split ? 'p-0 print:!h-[297mm] print:!p-0' : 'p-[6.6666667%] print:!h-[296mm] print:!p-[14mm]'} print:!m-0 print:!w-[210mm] print:!aspect-auto print:!overflow-hidden print:!shadow-none print:[break-after:page] print:[break-inside:avoid] print:last:[break-after:auto]`} data-font={settings.font}>
    <div className="sheet-content grid min-h-0 flex-1 grid-cols-[repeat(var(--columns),var(--cell-width))] auto-rows-[var(--cell-height)] content-start justify-center">{cells.slice(page * capacity, (page + 1) * capacity).map((cell, index) => <Cell cell={cell} settings={settings} tone={cell.kind === 'blank' ? undefined : toneIndex++ % 7 + 1} chineseNumber={chineseNumber} key={index} />)}</div>
  </article>;
}
