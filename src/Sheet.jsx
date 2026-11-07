import React from 'react';
import { numberParity } from './logic.js';

const digitFonts = {
  sans: 'font-digit-sans',
  andika: 'font-digit-andika',
  short: 'font-digit-short',
  xiaoya: 'font-digit-xiaoya',
  round: 'font-digit-round',
  wenkai: 'font-digit-wenkai',
  yozai: 'font-digit-yozai',
  serif: 'font-digit-serif',
  dots: 'font-digit-dots',
  custom: 'font-digit-custom',
};
const fontScales = {
  small: '[--font-scale:.84]',
  normal: '[--font-scale:1]',
  large: '[--font-scale:1.14]',
};
const traceShades = {
  light: '[--trace-ink:var(--color-trace-light)] text-trace-light',
  medium: '[--trace-ink:var(--color-trace)] text-trace',
  dark: '[--trace-ink:var(--color-trace-dark)] text-trace-dark',
};
const fontTags = {
  sans: '印刷黑体',
  andika: '1无底横·4开口',
  short: '单竖1·开口4',
  xiaoya: '斜竖1·开口4',
  round: '圆润饱满',
  wenkai: '楷书运笔',
  yozai: '手写数字',
  serif: '传统衬线',
  dots: '连点控笔',
};
const tones = ['text-print-red', 'text-print-orange', 'text-print-yellow', 'text-print-green', 'text-print-cyan', 'text-print-blue', 'text-print-purple'];
const sheetSizes = {
  '40': '[--cell-size:21.978022cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:4]',
  '50': '[--cell-size:27.472527cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:3]',
  '60': '[--cell-size:32.967033cqw] [--cell-width:var(--cell-size)] [--cell-height:var(--cell-size)] [--columns:3]',
  quarter: '[--cell-size:50cqw] [--cell-width:50cqw] [--cell-height:70.7142857cqw] [--columns:2]',
  eighth: '[--cell-size:35.3571429cqw] [--cell-width:50cqw] [--cell-height:35.3571429cqw] [--columns:2]',
};
const baseCell = 'relative min-h-0 min-w-0 outline-1 outline-dashed outline-cut -outline-offset-[0.5px]';
const box = 'inline-block h-[calc(var(--cell-size)*.2)] w-[calc(var(--cell-size)*.2)] shrink-0 border border-cut mx-[calc(var(--cell-size)*.025)]';

function resolveTraceGlyphClass(trace, traceStyle, bold, font) {
  if (!trace) return bold ? 'font-bold' : '';
  if (font === 'dots' || traceStyle === 'dotted') return `font-digit-dots ${bold ? 'font-bold' : ''}`;
  if (traceStyle === 'solid') return bold ? 'font-bold' : '';
  return bold ? '!text-transparent [-webkit-text-stroke:1.5px_var(--trace-ink)]' : '!text-transparent [-webkit-text-stroke:1px_var(--trace-ink)]';
}

export function FontSample({ settings, customFontName }) {
  const { font = 'sans', fontScale = 'normal', fontWeight = 'normal', template = 'number', traceStyle = 'outline', traceShade = 'medium' } = settings || {};
  const trace = template === 'trace';
  const bold = fontWeight === 'bold';
  const sampleScale = fontScale === 'small' ? 'text-[19px] max-workspace:text-[18px]' : fontScale === 'large' ? 'text-[25px] max-workspace:text-[22px]' : 'text-[22px] max-workspace:text-[20px]';
  const traceClass = trace ? `${traceShades[traceShade] || traceShades.medium} ${resolveTraceGlyphClass(true, traceStyle, bold, font)}` : `text-ink ${bold ? 'font-bold' : ''}`;
  const tag = font === 'custom' ? `本地字体 · ${customFontName || '自定义'}` : fontTags[font] || fontTags.sans;
  return <div className={`flex min-h-12 items-center justify-between gap-2 overflow-hidden rounded-sm bg-well px-3 py-2 ${digitFonts[font] || digitFonts.sans} max-workspace:col-span-2 workspace:mt-2`} aria-label="所选字体预览">
    <span className={`leading-6 tracking-[.06em] whitespace-nowrap lining-nums ${sampleScale} ${traceClass}`}>{template === 'math' ? '12 + 8 = 20' : '1234567890'}</span>
    <span className="font-body text-[11px] leading-4 whitespace-nowrap text-muted">{tag}</span>
  </div>;
}

function GridGuide({ enabled }) {
  if (!enabled) return null;
  return <span className="pointer-events-none absolute inset-0" aria-hidden="true">
    <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-cut/35" />
    <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-cut/35" />
  </span>;
}

function QuantityNote({ value, style, trace }) {
  if (style === 'none' || value < 1 || value > 20) return null;
  const traceRing = 'shadow-[inset_0_0_0_1px_var(--trace-ink,var(--color-trace))]';
  if (style === 'ten') {
    return <span className="relative z-1 flex gap-[calc(var(--cell-size)*.05)] leading-none" aria-hidden="true">{Array.from({ length: Math.ceil(value / 10) }, (_, frame) => <span className="grid grid-cols-[repeat(5,calc(var(--cell-size)*var(--mark-size)))] grid-rows-[repeat(2,calc(var(--cell-size)*var(--mark-size)))] gap-px bg-cut p-px" key={frame}>{Array.from({ length: 10 }, (_, index) => {
      const filled = index < Math.min(value - frame * 10, 10);
      return <span className={`${filled && !trace ? 'bg-current' : 'bg-white'} ${filled && trace ? traceRing : ''}`} key={index} />;
    })}</span>)}</span>;
  }
  if (style === 'sticks') {
    return <span className="relative z-1 flex flex-col items-center gap-[calc(var(--cell-size)*var(--mark-gap))] leading-none" aria-hidden="true">{Array.from({ length: Math.ceil(value / 10) }, (_, row) => {
      const rowCount = Math.min(value - row * 10, 10);
      return <span className="flex items-center gap-[calc(var(--cell-size)*var(--mark-gap)*1.6)]" key={row}>{Array.from({ length: Math.ceil(rowCount / 5) }, (_, group) => <span className="flex gap-[calc(var(--cell-size)*var(--mark-gap)*.65)]" key={group}>{Array.from({ length: Math.min(rowCount - group * 5, 5) }, (_, index) => <span className={`h-[calc(var(--cell-size)*var(--mark-size)*1.25)] w-[calc(var(--cell-size)*var(--mark-size)*.28)] rounded-full ${trace ? `bg-transparent ${traceRing}` : 'bg-current'}`} key={index} />)}</span>)}</span>;
    })}</span>;
  }
  if (style === 'blocks') {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return <span className="relative z-1 flex flex-col items-center gap-[calc(var(--cell-size)*var(--mark-gap))] leading-none" aria-hidden="true">
      {tens > 0 ? <span className="flex flex-col gap-[calc(var(--cell-size)*var(--mark-gap)*.7)]">{Array.from({ length: tens }, (_, bar) => <span className="inline-grid grid-cols-[repeat(10,calc(var(--cell-size)*var(--mark-size)*.78))] gap-px bg-cut p-px" key={bar}>{Array.from({ length: 10 }, (_, idx) => <span className={`h-[calc(var(--cell-size)*var(--mark-size)*.78)] w-[calc(var(--cell-size)*var(--mark-size)*.78)] ${trace ? `bg-white ${traceRing}` : 'bg-current'}`} key={idx} />)}</span>)}</span> : null}
      {ones > 0 ? <span className="flex flex-col items-center gap-[calc(var(--cell-size)*var(--mark-gap)*.65)]">{Array.from({ length: Math.ceil(ones / 5) }, (_, row) => <span className="flex gap-[calc(var(--cell-size)*var(--mark-gap)*.65)]" key={row}>{Array.from({ length: Math.min(ones - row * 5, 5) }, (_, idx) => <span className={`h-[calc(var(--cell-size)*var(--mark-size)*.78)] w-[calc(var(--cell-size)*var(--mark-size)*.78)] ${trace ? `bg-transparent ${traceRing}` : 'bg-current'}`} key={idx} />)}</span>)}</span> : null}
    </span>;
  }
  return <span className="relative z-1 flex flex-col items-center gap-[calc(var(--cell-size)*var(--mark-gap))] leading-none" aria-hidden="true">{Array.from({ length: Math.ceil(value / 5) }, (_, row) => <span className="flex gap-[calc(var(--cell-size)*var(--mark-gap))]" key={row}>{Array.from({ length: Math.min(value - row * 5, 5) }, (_, index) => <span className={`h-[calc(var(--cell-size)*var(--mark-size))] w-[calc(var(--cell-size)*var(--mark-size))] rounded-full ${trace ? `bg-transparent ${traceRing}` : 'bg-current'}`} key={index} />)}</span>)}</span>;
}

function Cell({ cell, tone, settings, chineseNumber }) {
  if (cell.kind === 'blank') return <div className={`${baseCell} grid place-items-center`} aria-label="空白书写格"><GridGuide enabled={settings.grid} /></div>;
  const trace = settings.template === 'trace';
  const bold = settings.fontWeight === 'bold';
  const ink = trace ? (traceShades[settings.traceShade] || traceShades.medium) : settings.color === 'mono' ? 'text-print-mono' : tones[tone - 1];
  const mathWeight = bold ? 'font-bold' : '';
  if (cell.kind === 'math') {
    if (cell.type === 'count') {
      const noteStyle = cell.value > 10 ? 'ten' : 'dots';
      return <div className={`${baseCell} flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.055)] [--mark-size:.068] [--mark-gap:.024] ${ink}`} aria-label={`点数 ${cell.value}，填数字`}>
        <span className="font-body text-[calc(var(--cell-size)*.1)] leading-[1.3] whitespace-nowrap text-ink-2" aria-hidden="true">看图填数</span>
        <QuantityNote value={cell.value} style={noteStyle} trace={false} />
        <span className="flex items-center justify-center text-[calc(var(--cell-size)*.15*var(--font-scale,1))] leading-none whitespace-nowrap" aria-hidden="true"><span className={box} /></span>
      </div>;
    }
    if (cell.type === 'bond') {
      const [total, left, right] = cell.values;
      const accessible = cell.missing === 0 ? `${left} 和 ${right} 合成几，填数字` : `${total} 分成 ${cell.missing === 1 ? `几 和 ${right}` : `${left} 和 几`}，填数字`;
      return <div className={`${baseCell} flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.03)] ${ink}`} aria-label={accessible}>
        <span className="font-body text-[calc(var(--cell-size)*.095)] leading-[1.2] whitespace-nowrap text-ink-2" aria-hidden="true">数的分与合</span>
        <span className={`flex flex-col items-center justify-center text-[calc(var(--cell-size)*.15*var(--font-scale,1))] leading-none whitespace-nowrap ${mathWeight}`} aria-hidden="true">
          <span className="flex items-center justify-center">{cell.missing === 0 ? <span className={box} /> : total}</span>
          <svg className="my-[calc(var(--cell-size)*.015)] h-[calc(var(--cell-size)*.11)] w-[calc(var(--cell-size)*.36)] stroke-cut" viewBox="0 0 36 12" fill="none"><path d="M18 1L7 11M18 1L29 11" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <span className="flex items-center justify-center gap-[calc(var(--cell-size)*.12)]">
            <span className="flex items-center justify-center">{cell.missing === 1 ? <span className={box} /> : left}</span>
            <span className="flex items-center justify-center">{cell.missing === 2 ? <span className={box} /> : right}</span>
          </span>
        </span>
      </div>;
    }
    if (cell.type === 'neighbor') {
      const center = cell.values[1];
      return <div className={`${baseCell} flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.08)] ${ink}`} aria-label={`${center} 的相邻数，填数字`}>
        <span className="font-body text-[calc(var(--cell-size)*.1)] leading-[1.3] whitespace-nowrap text-ink-2" aria-hidden="true">填相邻数</span>
        <span className={`flex items-center justify-center text-[calc(var(--cell-size)*.16*var(--font-scale,1))] leading-none whitespace-nowrap ${mathWeight}`} aria-hidden="true"><span className={box} />，{center}，<span className={box} /></span>
      </div>;
    }
    if (cell.type === 'fill') {
      const [first, second, answer] = cell.values;
      const accessible = `${cell.missing === 0 ? '空格' : first} ${cell.operator} ${cell.missing === 1 ? '空格' : second} = ${answer}，填数字`;
      return <div className={`${baseCell} flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.08)] ${ink}`} aria-label={accessible}>
        <span className="font-body text-[calc(var(--cell-size)*.1)] leading-[1.3] whitespace-nowrap text-ink-2" aria-hidden="true">填数字</span>
        <span className={`flex items-center justify-center text-[calc(var(--cell-size)*.15*var(--font-scale,1))] leading-none whitespace-nowrap ${mathWeight}`} aria-hidden="true">{cell.missing === 0 ? <span className={box} /> : first} {cell.operator} {cell.missing === 1 ? <span className={box} /> : second} = {answer}</span>
      </div>;
    }
    if (cell.type === 'compare' || cell.type === 'sequence') {
      const compare = cell.type === 'compare';
      const values = cell.values.map((value, index) => !compare && index === cell.missing ? '空格' : String(value));
      const accessible = compare ? `${values[0]} 和 ${values[1]}，填写大于、小于或等于` : `${values.join('、')}，填数字`;
      return <div className={`${baseCell} flex flex-col items-center justify-center gap-[calc(var(--cell-size)*.08)] ${ink}`} aria-label={accessible}>
        <span className="font-body text-[calc(var(--cell-size)*.1)] leading-[1.3] whitespace-nowrap text-ink-2" aria-hidden="true">{compare ? '填 >、< 或 =' : '填数字'}</span>
        <span className={`flex items-center justify-center text-[calc(var(--cell-size)*.16*var(--font-scale,1))] leading-none whitespace-nowrap ${mathWeight}`} aria-hidden="true">{compare ? <>{cell.values[0]}<span className={box} />{cell.values[1]}</> : cell.values.map((value, index) => <React.Fragment key={index}>{index > 0 ? '，' : null}{index === cell.missing ? <span className={box} /> : value}</React.Fragment>)}</span>
      </div>;
    }
    return <div className={`${baseCell} grid place-items-center ${ink}`} aria-label={`${cell.text} 作答`}><span className={`text-[calc(var(--cell-size)*.15*var(--font-scale,1))] leading-none tracking-[.02em] whitespace-nowrap lining-nums [text-box:trim-both_cap_alphabetic] ${mathWeight}`}>{cell.text} <span className="ml-[.08em] inline-block h-0 w-[1.2em] border-b border-cut align-baseline" aria-hidden="true" /></span></div>;
  }
  const cn = settings.label ? chineseNumber(cell.value) : '';
  const parity = settings.parity ? numberParity(cell.value) : '';
  const label = [cn, parity].filter(Boolean).join(' · ');
  const note = settings.note !== 'none' && cell.value >= 1 && cell.value <= 20;
  const stacked = Boolean(note || label);
  const variables = note && label ? '[--num-scale:.42] [--note-gap:.028] [--mark-size:.06] [--mark-gap:.022] [--label-scale:.105]' : `[--mark-size:.072] [--mark-gap:.028] [--label-scale:.12] [--note-gap:.045] ${note ? '[--num-scale:.5]' : label ? '[--num-scale:.56]' : '[--num-scale:.67]'}`;
  const fallback = settings.font === 'wenkai' || settings.font === 'yozai' ? 'supports-not-[text-box:trim-both_cap_alphabetic]:translate-y-[.016em]' : settings.font === 'serif' ? 'supports-not-[text-box:trim-both_cap_alphabetic]:-translate-y-[.075em]' : 'supports-not-[text-box:trim-both_cap_alphabetic]:-translate-y-[.077em]';
  const glyphClass = resolveTraceGlyphClass(trace, settings.traceStyle || 'outline', bold, settings.font);
  return <div className={`${baseCell} ${stacked ? 'flex flex-col items-center justify-center gap-[calc(var(--cell-size)*var(--note-gap))]' : 'grid place-items-center'} ${variables} ${ink}`} aria-label={`${cell.value}${label ? `，${label}` : ''}`}>
    <GridGuide enabled={settings.grid} />
    <span className={`relative z-1 text-[calc(var(--cell-size)*var(--num-scale)*var(--font-scale,1))] leading-none lining-nums [text-box:trim-both_cap_alphabetic] ${fallback} ${glyphClass}`}>{cell.value}</span>{label ? <span className="relative z-1 font-body text-[calc(var(--cell-size)*var(--label-scale))] leading-none font-medium tracking-[.03em] whitespace-nowrap">{label}</span> : null}<QuantityNote value={cell.value} style={settings.note} trace={trace} />
  </div>;
}

export default function Sheet({ cells, page, capacity, settings, chineseNumber }) {
  const size = settings.size;
  const split = size === 'quarter' || size === 'eighth';
  let toneIndex = cells.slice(0, page * capacity).filter(cell => cell.kind !== 'blank').length;
  const fontClass = digitFonts[settings.font] || digitFonts.sans;
  const scaleClass = fontScales[settings.fontScale] || fontScales.normal;
  return <article className={`@container flex aspect-[210/297] flex-col bg-white shadow-sheet ${fontClass} ${scaleClass} ${sheetSizes[size]} ${split ? 'p-0 print:!h-[297mm] print:!p-0' : 'p-[6.6666667%] print:!h-[296mm] print:!p-[14mm]'} print:!m-0 print:!w-[210mm] print:!aspect-auto print:!overflow-hidden print:!shadow-none print:break-after-page print:break-inside-avoid print:last:break-after-auto`}>
    <div className="grid min-h-0 flex-1 grid-cols-[repeat(var(--columns),var(--cell-width))] auto-rows-[var(--cell-height)] content-start justify-center">{cells.slice(page * capacity, (page + 1) * capacity).map((cell, index) => <Cell cell={cell} settings={settings} tone={cell.kind === 'blank' ? undefined : toneIndex++ % 7 + 1} chineseNumber={chineseNumber} key={index} />)}</div>
  </article>;
}
