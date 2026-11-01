import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { chineseNumber, layouts, makeCells, mathLabels, parseCustom, readSettings, settingsQuery, sizeLabels } from './logic.js';
import Sheet, { FontSample } from './Sheet.jsx';
import './styles.css';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
const field = 'range-field min-w-0 mb-4 max-workspace:col-span-2 max-workspace:mb-0';
const fieldLabel = 'mb-2 block text-[12px] text-ink-2';
const selectClass = 'block min-h-9 w-full cursor-pointer appearance-none truncate rounded-md border border-edge bg-panel pr-7 pl-2 text-[14px] text-ink transition-colors hover:bg-well max-workspace:min-h-11 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#4b91b8]';
const printReset = 'print:!block print:!h-auto print:!w-auto print:!max-w-none print:!overflow-visible print:!m-0 print:!p-0 print:!rounded-none print:!border-0 print:!bg-none print:!bg-transparent print:!shadow-none';

function Select({ id, value, onChange, children }) {
  return <span className="field-control relative grid min-w-0"><select className={selectClass} id={id} value={value} onChange={onChange}>{children}</select><svg aria-hidden="true" viewBox="0 0 10 6" className="pointer-events-none absolute top-1/2 right-3 h-1.5 w-2.5 -translate-y-1/2 text-muted"><path d="M1 1l4 3.6L9 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
}

function App() {
  const [settings, setSettings] = useState(() => readSettings(window.location.search));
  const [copied, setCopied] = useState(false);
  const isMath = settings.template === 'math';
  const { template, range, custom, math, size, copies, shuffle, blank } = settings;
  const cells = useMemo(() => makeCells({ template, range, custom, math, size, copies, shuffle, blank }), [template, range, custom, math, size, copies, shuffle, blank]);
  const capacity = layouts[size].columns * layouts[size].rows;
  const pageCount = Math.ceil(cells.length / capacity);
  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }));
  useEffect(() => {
    const query = settingsQuery(settings);
    const url = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
    if (`${location.pathname}${location.search}${location.hash}` !== url) history.replaceState(null, '', url);
  }, [settings]);

  const summary = [`${cells.length} ${isMath ? '道题' : '个格子'}`, `共 ${pageCount} 张 A4 纸`, sizeLabels[size]];
  if (!isMath) {
    if (blank) summary.push('含空白练习格');
    if (shuffle) summary.push('已打乱顺序');
    if (settings.label) summary.push('标注中文数字');
    if (settings.note === 'dots') summary.push('含数量点');
    if (settings.note === 'ten') summary.push('含十宫格');
  }
  async function share() {
    const query = settingsQuery(settings);
    const url = new URL(location.href);
    url.search = query;
    try {
      await navigator.clipboard.writeText(url.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('复制下面的设置链接', url.href);
    }
  }
  async function print() {
    await document.fonts.ready;
    window.print();
  }
  const templates = { number: '数字格子', trace: '描红格子', math: '算术题卡' };
  return <>
    <header className="site-header flex h-12 shrink-0 items-center px-3 workspace:h-14 workspace:px-6 print:!hidden"><a className={`brand flex min-w-0 items-center gap-2 whitespace-nowrap ${focus}`} href="./" aria-label="小芽印坊首页"><img className="h-7 w-7 shrink-0 workspace:h-8 workspace:w-8" src="favicon.svg" alt="" width="32" height="32" /><h1 className="brand-name text-[16px] leading-[1.2] font-semibold workspace:text-[18px]">小芽印坊</h1><span className="brand-tag border-l border-rule-2 pl-3 text-[12px] text-muted">数字裁剪格打印工具</span></a></header>
    <main className={`min-h-0 flex-1 px-2 pb-2 workspace:px-4 workspace:pb-4 ${printReset}`}><div className={`workspace flex h-auto flex-col overflow-hidden rounded-[10px] border border-rule bg-panel workspace:grid workspace:h-full workspace:grid-cols-[320px_minmax(0,1fr)] ${printReset}`}>
      <aside className="settings flex min-h-0 flex-col border-b border-rule bg-panel p-3 workspace:overflow-hidden workspace:border-r workspace:border-b-0 workspace:px-4 workspace:pt-4 workspace:pb-6 print:!hidden">
        <div className="settings-title shrink-0 workspace:mb-4"><h2 className="text-[16px] leading-[1.3] font-semibold">打印设置</h2></div><div className="settings-body grid min-h-0 grid-cols-2 gap-3 workspace:block workspace:flex-1 workspace:overflow-auto workspace:overscroll-contain workspace:[scrollbar-gutter:stable]">
          <fieldset className="template-picker col-span-2 grid min-w-0 grid-cols-3 gap-2 border-0 p-0 workspace:mb-4"><legend className={fieldLabel}>内容</legend>{Object.entries(templates).map(([value, text]) => <label className={`template-option relative flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-edge bg-panel px-2 text-muted transition-colors hover:bg-well-2 has-checked:border-brand has-checked:bg-well has-checked:text-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus workspace:min-h-9`} key={value}><input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="radio" name="template" value={value} checked={template === value} onChange={() => update('template', value)} /><span>{text}</span></label>)}</fieldset>
          <div className={field} id="range-field" hidden={isMath}><label className={fieldLabel} htmlFor="range">数字范围</label><Select id="range" value={range} onChange={e => update('range', e.target.value)}><option value="1-10">1 到 10</option><option value="11-20">11 到 20</option><option value="1-20">1 到 20</option><option value="custom">自定义数字…</option></Select></div>
          <div className="custom-field col-span-2 min-w-0 workspace:mb-4" id="custom-field" hidden={isMath || range !== 'custom'}><label className={fieldLabel} htmlFor="custom-numbers">自定义数字</label><input className={`block min-h-11 w-full rounded-md border border-edge bg-panel px-2 text-[14px] text-ink tabular-nums placeholder:text-muted workspace:min-h-9 ${focus}`} id="custom-numbers" type="text" inputMode="numeric" autoComplete="off" spellCheck="false" placeholder="例：1, 3, 5-8, 12" value={custom} onChange={e => update('custom', e.target.value)} aria-describedby="custom-hint" /><p className="field-hint mt-1 text-[12px] leading-[1.5] text-muted" id="custom-hint">{parseCustom(custom).length ? '用逗号或空格分隔，也可以写 5-8 这样的范围，最多 100 个。' : '没有识别到数字，先按 1 到 10 生成。'}</p></div>
          <div className={field} id="math-field" hidden={!isMath}><label className={fieldLabel} htmlFor="math">题目类型</label><Select id="math" value={math} onChange={e => update('math', e.target.value)}>{Object.entries(mathLabels).map(([value, text]) => <option value={value} key={value}>{text}</option>)}</Select></div>
          <div className="toggle-list col-span-2 flex min-w-0 flex-wrap gap-2 workspace:mb-4" hidden={isMath}>{[['shuffle', '打乱顺序'], ['blank', '空白书写格'], ['label', '中文数字']].map(([key, text]) => <label className="toggle flex min-h-11 flex-[1_1_calc(50%-4px)] cursor-pointer items-center gap-2 rounded-md border border-edge bg-panel px-3 text-[12px] whitespace-nowrap text-ink-2 transition-colors hover:bg-well-2 has-checked:border-brand has-checked:bg-well has-checked:text-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus workspace:min-h-9" key={key}><input className="h-3.5 w-3.5 shrink-0 accent-brand" type="checkbox" id={key} checked={settings[key]} onChange={e => update(key, e.target.checked)} /><span>{text}</span></label>)}</div>
          <div className={field} id="quantity-field" hidden={isMath}><label className={fieldLabel} htmlFor="quantity">数量提示</label><Select id="quantity" value={settings.note} onChange={e => update('note', e.target.value)}><option value="none">不显示</option><option value="dots">圆点</option><option value="ten">十宫格</option></Select></div>
          <div className={`${field} font-field max-workspace:grid max-workspace:grid-cols-2 max-workspace:gap-x-3`}><label className={`${fieldLabel} max-workspace:col-span-2`} htmlFor="font">数字字体</label><Select id="font" value={settings.font} onChange={e => update('font', e.target.value)}><option value="sans">思源黑体</option><option value="wenkai">霞鹜文楷</option><option value="serif">思源宋体</option></Select><FontSample font={settings.font} /></div>
          <div className="field-row col-span-2 grid grid-cols-1 gap-3 min-[481px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"><div className="range-field min-w-0 workspace:mb-4"><label className={fieldLabel} htmlFor="size">格子大小</label><Select id="size" value={size} onChange={e => update('size', e.target.value)}>{['quarter', 'eighth', '40', '50', '60'].map(value => <option value={value} key={value}>{sizeLabels[value]}</option>)}</Select></div><div className="range-field min-w-0 workspace:mb-4"><label className={fieldLabel} htmlFor="copies">{isMath ? '题目页数' : '重复份数'}</label><Select id="copies" value={copies} onChange={e => update('copies', e.target.value)}>{['1', '2', '3'].map(value => <option value={value} key={value}>{value} {isMath ? '页' : '份'}</option>)}</Select></div></div>
          <div className="color-field col-span-2"><span className={fieldLabel} id="color-label">打印颜色</span><div className="segmented flex gap-1 rounded-md bg-well p-1" role="group" aria-labelledby="color-label">{[['mono', '黑白省墨'], ['color', '鲜艳彩色']].map(([value, text]) => <button className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent px-2 text-[12px] whitespace-nowrap text-muted transition-colors hover:text-ink aria-pressed:border-rule-2 aria-pressed:bg-panel aria-pressed:font-medium aria-pressed:text-ink workspace:min-h-8 ${focus}`} type="button" data-color={value} aria-pressed={settings.color === value} onClick={() => update('color', value)} key={value}><span className={`swatch h-3 w-3 shrink-0 rounded-sm shadow-[inset_0_0_0_1px_var(--color-rule-2)] ${value === 'mono' ? 'swatch-mono bg-print-mono' : 'swatch-color bg-[conic-gradient(var(--color-print-red),var(--color-print-orange),var(--color-print-yellow),var(--color-print-green),var(--color-print-cyan),var(--color-print-blue),var(--color-print-purple),var(--color-print-red))]'}`} aria-hidden="true" />{text}</button>)}</div></div>
        </div><p className="printing-note shrink-0 border-t border-rule pt-3 text-[12px] leading-[1.6] text-muted workspace:pt-4">选择 A4、纵向、100% 实际大小，关闭浏览器页眉页脚；也可以在打印窗口中保存为 PDF。</p>
      </aside>
      <section className={`preview flex min-h-0 min-w-0 flex-col bg-mat ${printReset}`} aria-label="练习纸预览"><div className="preview-toolbar flex h-12 shrink-0 items-center justify-between gap-2 border-b border-rule bg-paper-2 px-3 workspace:gap-3 workspace:px-6 print:!hidden"><div><h2 className="text-[16px] leading-[1.3] font-semibold whitespace-nowrap">打印预览</h2></div><div className="toolbar-actions flex shrink-0 items-center gap-2 workspace:gap-3"><span className="paper-badge text-[12px] whitespace-nowrap text-muted">A4 纵向</span><button className={`print-button flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-md border border-transparent bg-brand px-3 text-[12px] font-medium whitespace-nowrap text-accent-ink transition-colors hover:bg-brand-2 active:translate-y-px workspace:min-h-8 ${focus}`} id="print" type="button" onClick={print}><svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 13h10v8H7z"/><path d="M16 10h2"/></svg>打印练习纸</button></div></div>
        <div className={`paper-stage min-h-0 flex-none overflow-visible bg-[radial-gradient(var(--color-mat-dot)_0.75px,transparent_0.75px)] bg-size-[10px_10px] p-3 workspace:flex-1 workspace:overflow-auto workspace:overscroll-contain workspace:p-6 ${printReset}`}><div className={`paper-stack mx-auto flex w-full max-w-[960px] flex-col gap-4 workspace:gap-6 ${settings.color === 'mono' ? 'monochrome' : ''} ${printReset}`} id="sheets">{Array.from({ length: pageCount }, (_, page) => <Sheet cells={cells} page={page} capacity={capacity} settings={settings} chineseNumber={chineseNumber} key={page} />)}</div></div>
        <div className="preview-footer flex min-h-9 shrink-0 items-center justify-between gap-3 border-t border-rule bg-paper-2 px-3 py-2 text-[12px] text-muted tabular-nums workspace:px-6 print:!hidden"><span className="min-w-0" id="page-summary" role="status" aria-live="polite">{summary.join('，')}</span><button className={`share-button min-h-[26px] cursor-pointer rounded-sm border border-rule-2 bg-panel px-2 text-[12px] whitespace-nowrap text-ink-2 transition-colors hover:border-edge hover:bg-well ${focus}`} id="share" type="button" onClick={share}>{copied ? '已复制链接' : '复制设置链接'}</button></div>
      </section>
    </div></main>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
