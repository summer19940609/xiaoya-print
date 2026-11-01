import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { chineseNumber, layouts, makeCells, mathLabels, parseCustom, readSettings, settingsQuery, sizeLabels } from './logic.js';

function QuantityNote({ value, style }) {
  if (style === 'none' || value < 1 || value > 20) return null;
  if (style === 'ten') {
    return <span className="ten-frames" aria-hidden="true">{Array.from({ length: Math.ceil(value / 10) }, (_, frame) => <span className="ten-frame" key={frame}>{Array.from({ length: 10 }, (_, index) => <span className={`tf-cell${index < Math.min(value - frame * 10, 10) ? ' filled' : ''}`} key={index} />)}</span>)}</span>;
  }
  return <span className="cell-dots" aria-hidden="true">{Array.from({ length: Math.ceil(value / 5) }, (_, row) => <span className="dot-row" key={row}>{Array.from({ length: Math.min(value - row * 5, 5) }, (_, index) => <span className="cell-dot" key={index} />)}</span>)}</span>;
}

function Cell({ cell, tone, settings }) {
  if (cell.kind === 'blank') return <div className="cut-cell blank" aria-label="空白书写格" />;
  if (cell.kind === 'math') {
    if (cell.type === 'compare' || cell.type === 'sequence') {
      const compare = cell.type === 'compare';
      const values = cell.values.map((value, index) => !compare && index === cell.missing ? '空格' : String(value));
      const accessible = compare ? `${values[0]} 和 ${values[1]}，填写大于、小于或等于` : `${values.join('、')}，填数字`;
      return <div className="cut-cell math-cell learning-cell" data-tone={tone} aria-label={accessible}>
        <span className="problem-hint" aria-hidden="true">{compare ? '填 >、< 或 =' : '填数字'}</span>
        <span className="learning-expression" aria-hidden="true">{compare ? <>{cell.values[0]}<span className="problem-box" />{cell.values[1]}</> : cell.values.map((value, index) => <React.Fragment key={index}>{index > 0 ? '，' : null}{index === cell.missing ? <span className="problem-box" /> : value}</React.Fragment>)}</span>
      </div>;
    }
    return <div className="cut-cell math-cell" data-tone={tone} aria-label={`${cell.text} 作答`}><span className="cell-expression">{cell.text} <span className="answer-blank" aria-hidden="true" /></span></div>;
  }
  const label = settings.label ? chineseNumber(cell.value) : '';
  const note = settings.note !== 'none' && cell.value >= 1 && cell.value <= 20;
  return <div className={`cut-cell${label ? ' has-label' : ''}${note ? ' with-note' : ''}`} data-tone={tone} aria-label={`${cell.value}${label ? `，${label}` : ''}`}>
    <span className="cell-number">{cell.value}</span>{label ? <span className="cell-label">{label}</span> : null}<QuantityNote value={cell.value} style={settings.note} />
  </div>;
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
  let toneIndex = 0;
  return <>
    <header className="site-header"><a className="brand" href="./" aria-label="小芽印坊首页"><img src="favicon.svg" alt="" width="32" height="32" /><h1 className="brand-name">小芽印坊</h1><span className="brand-tag">数字裁剪格打印工具</span></a></header>
    <main><div className="workspace">
      <aside className="settings" aria-label="练习纸设置">
        <div className="settings-title"><h2>打印设置</h2></div><div className="settings-body">
          <fieldset className="template-picker"><legend>内容</legend>{Object.entries(templates).map(([value, text]) => <label className="template-option" key={value}><input type="radio" name="template" value={value} checked={template === value} onChange={() => update('template', value)} /><span>{text}</span></label>)}</fieldset>
          <div className="range-field" id="range-field" hidden={isMath}><label htmlFor="range">数字范围</label><span className="field-control"><select id="range" value={range} onChange={e => update('range', e.target.value)}><option value="1-10">1 到 10</option><option value="11-20">11 到 20</option><option value="1-20">1 到 20</option><option value="custom">自定义数字…</option></select></span></div>
          <div className="custom-field" id="custom-field" hidden={isMath || range !== 'custom'}><label htmlFor="custom-numbers">自定义数字</label><input id="custom-numbers" type="text" inputMode="numeric" autoComplete="off" spellCheck="false" placeholder="例：1, 3, 5-8, 12" value={custom} onChange={e => update('custom', e.target.value)} aria-describedby="custom-hint" /><p className="field-hint" id="custom-hint">{parseCustom(custom).length ? '用逗号或空格分隔，也可以写 5-8 这样的范围，最多 100 个。' : '没有识别到数字，先按 1 到 10 生成。'}</p></div>
          <div className="range-field" id="math-field" hidden={!isMath}><label htmlFor="math">题目类型</label><span className="field-control"><select id="math" value={math} onChange={e => update('math', e.target.value)}>{Object.entries(mathLabels).map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></span></div>
          <div className="toggle-list" hidden={isMath}>{[['shuffle', '打乱顺序'], ['blank', '空白书写格'], ['label', '中文数字']].map(([key, text]) => <label className="toggle" key={key}><input type="checkbox" id={key} checked={settings[key]} onChange={e => update(key, e.target.checked)} /><span>{text}</span></label>)}</div>
          <div className="range-field" id="quantity-field" hidden={isMath}><label htmlFor="quantity">数量提示</label><span className="field-control"><select id="quantity" value={settings.note} onChange={e => update('note', e.target.value)}><option value="none">不显示</option><option value="dots">圆点</option><option value="ten">十宫格</option></select></span></div>
          <div className="range-field font-field"><label htmlFor="font">数字字体</label><span className="field-control"><select id="font" value={settings.font} onChange={e => update('font', e.target.value)}><option value="sans">思源黑体</option><option value="wenkai">霞鹜文楷</option><option value="serif">思源宋体</option></select></span><div className="font-sample" data-font={settings.font} aria-label="所选字体预览">1234567890</div></div>
          <div className="field-row"><div className="range-field"><label htmlFor="size">格子大小</label><span className="field-control"><select id="size" value={size} onChange={e => update('size', e.target.value)}>{['quarter', 'eighth', '40', '50', '60'].map(value => <option value={value} key={value}>{sizeLabels[value]}</option>)}</select></span></div><div className="range-field"><label htmlFor="copies">{isMath ? '题目页数' : '重复份数'}</label><span className="field-control"><select id="copies" value={copies} onChange={e => update('copies', e.target.value)}>{['1', '2', '3'].map(value => <option value={value} key={value}>{value} {isMath ? '页' : '份'}</option>)}</select></span></div></div>
          <div className="color-field"><span id="color-label">打印颜色</span><div className="segmented" role="group" aria-labelledby="color-label">{[['mono', '黑白省墨'], ['color', '鲜艳彩色']].map(([value, text]) => <button type="button" data-color={value} aria-pressed={settings.color === value} onClick={() => update('color', value)} key={value}><span className={`swatch swatch-${value}`} aria-hidden="true" />{text}</button>)}</div></div>
        </div><p className="printing-note">选择 A4、纵向、100% 实际大小，关闭浏览器页眉页脚；也可以在打印窗口中保存为 PDF。</p>
      </aside>
      <section className="preview" aria-label="练习纸预览"><div className="preview-toolbar"><div><h2>打印预览</h2></div><div className="toolbar-actions"><span className="paper-badge">A4 纵向</span><button className="print-button" id="print" type="button" onClick={print}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 13h10v8H7z"/><path d="M16 10h2"/></svg>打印练习纸</button></div></div>
        <div className="paper-stage"><div className={`paper-stack${settings.color === 'mono' ? ' monochrome' : ''}`} id="sheets">{Array.from({ length: pageCount }, (_, page) => <article className={`sheet ${template} size-${size}`} data-font={settings.font} key={page}><div className="sheet-content">{cells.slice(page * capacity, (page + 1) * capacity).map((cell, index) => <Cell cell={cell} settings={settings} tone={cell.kind === 'blank' ? undefined : toneIndex++ % 7 + 1} key={index} />)}</div></article>)}</div></div>
        <div className="preview-footer"><span id="page-summary" role="status" aria-live="polite">{summary.join('，')}</span><button className="share-button" id="share" type="button" onClick={share}>{copied ? '已复制链接' : '复制设置链接'}</button></div>
      </section>
    </div></main>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
