"use client";

import { useMemo, useState } from "react";

type PatternId =
  | "polka"
  | "duotone"
  | "micro"
  | "checker"
  | "stripe"
  | "diamond"
  | "star"
  | "wave"
  | "geo"
  | "grid";

type PatternPreset = {
  id: PatternId;
  name: string;
  tag: string;
  bg: string;
  bg2: string;
  color1: string;
  color2: string;
  tile: number;
  shape: number;
};

const patterns: PatternPreset[] = [
  { id: "polka", name: "팝 도트", tag: "DOT GRID", bg: "#61DED7", bg2: "#A7EEE8", color1: "#FFF0B8", color2: "#FF9A90", tile: 96, shape: 36 },
  { id: "duotone", name: "투톤 도트", tag: "TWO TONE", bg: "#68DDD7", bg2: "#9BEDE7", color1: "#FFF0A8", color2: "#FF9E94", tile: 108, shape: 44 },
  { id: "micro", name: "마이크로 도트", tag: "MICRO DOT", bg: "#7DEAE4", bg2: "#B1F2EC", color1: "#FFF9E8", color2: "#FFFFFF", tile: 30, shape: 5 },
  { id: "checker", name: "스윗 체크", tag: "CHECKER", bg: "#FFE12F", bg2: "#FFE96C", color1: "#FFFDF5", color2: "#FF8F81", tile: 88, shape: 44 },
  { id: "stripe", name: "소프트 스트라이프", tag: "STRIPE", bg: "#C8B7EE", bg2: "#E6DDF8", color1: "#FFF1B7", color2: "#17336B", tile: 84, shape: 24 },
  { id: "diamond", name: "캔디 다이아", tag: "DIAMOND", bg: "#FF9188", bg2: "#FFBBB3", color1: "#FFF1B7", color2: "#5EDAD4", tile: 102, shape: 46 },
  { id: "star", name: "스타 리듬", tag: "STARS", bg: "#716DE3", bg2: "#AAA6F4", color1: "#FFF09F", color2: "#FF9188", tile: 110, shape: 38 },
  { id: "wave", name: "웨이브 라인", tag: "WAVE", bg: "#FFF0B8", bg2: "#FFF8DC", color1: "#17336B", color2: "#FF8F85", tile: 120, shape: 18 },
  { id: "geo", name: "지오 믹스", tag: "GEO MIX", bg: "#F7F5ED", bg2: "#FFFFFF", color1: "#9A9A9A", color2: "#17336B", tile: 126, shape: 38 },
  { id: "grid", name: "모듈 그리드", tag: "MODULE", bg: "#17336B", bg2: "#284B88", color1: "#69DDD6", color2: "#FF9188", tile: 104, shape: 30 },
];

const palettes = [
  ["#61DED7", "#A7EEE8", "#FFF0B8", "#FF9A90"],
  ["#FFE12F", "#FFF3A6", "#FFFFFF", "#FF8F81"],
  ["#17336B", "#31599B", "#FF9188", "#FFF0B8"],
  ["#C8B7EE", "#EEE8FC", "#5EDAD4", "#FF8F85"],
  ["#FAF6EC", "#FFFFFF", "#969696", "#151515"],
  ["#FF8F85", "#FFB7A8", "#FFF1B7", "#645FD2"],
];

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function buildPatternSvg({
  pattern,
  bg,
  bg2,
  color1,
  color2,
  tile,
  shape,
  rotation,
  softness,
  backgroundGradient,
  shapeGradient,
  gradientAngle,
}: {
  pattern: PatternId;
  bg: string;
  bg2: string;
  color1: string;
  color2: string;
  tile: number;
  shape: number;
  rotation: number;
  softness: number;
  backgroundGradient: boolean;
  shapeGradient: boolean;
  gradientAngle: number;
}) {
  const half = tile / 2;
  const quarter = tile / 4;
  const r = Math.min(shape / 2, tile * 0.42);
  const motifFill = shapeGradient ? "url(#motifGradient)" : color1;
  const bgFill = backgroundGradient ? "url(#backgroundGradient)" : bg;
  const filter = softness > 0 ? ' filter="url(#soften)"' : "";
  const transform = rotation ? ` transform="rotate(${rotation} ${half} ${half})"` : "";
  let shapes = "";

  if (pattern === "polka" || pattern === "micro") {
    shapes = [
      `<circle cx="0" cy="0" r="${r}" fill="${motifFill}"/>`,
      `<circle cx="${tile}" cy="0" r="${r}" fill="${motifFill}"/>`,
      `<circle cx="0" cy="${tile}" r="${r}" fill="${motifFill}"/>`,
      `<circle cx="${tile}" cy="${tile}" r="${r}" fill="${motifFill}"/>`,
      `<circle cx="${half}" cy="${half}" r="${r}" fill="${color2}"/>`,
    ].join("");
  } else if (pattern === "duotone") {
    const splitCircle = (cx: number, cy: number, radius: number) =>
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color1}"/><path d="M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} L ${cx} ${cy - radius} Z" fill="${color2}"/>`;
    shapes = `${splitCircle(0, 0, r)}${splitCircle(tile, 0, r)}${splitCircle(0, tile, r)}${splitCircle(tile, tile, r)}${splitCircle(half, half, r)}`;
  } else if (pattern === "checker") {
    shapes = `<rect width="${half}" height="${half}" fill="${motifFill}"/><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${motifFill}"/><rect x="${half}" width="${half}" height="${half}" fill="${color2}" opacity=".2"/><rect y="${half}" width="${half}" height="${half}" fill="${color2}" opacity=".2"/>`;
  } else if (pattern === "stripe") {
    const width = Math.max(4, shape * 0.58);
    shapes = `<path d="M ${-tile} ${tile} L ${tile} ${-tile} M ${-half} ${tile * 1.5} L ${tile * 1.5} ${-half} M 0 ${tile * 2} L ${tile * 2} 0" stroke="${motifFill}" stroke-width="${width}"/><path d="M ${-tile * 0.75} ${tile * 1.75} L ${tile * 1.75} ${-tile * 0.75}" stroke="${color2}" stroke-width="${Math.max(2, width * 0.24)}"/>`;
  } else if (pattern === "diamond") {
    shapes = `<polygon points="${half},${half - r} ${half + r},${half} ${half},${half + r} ${half - r},${half}" fill="${motifFill}"/><polygon points="0,${-r} ${r},0 0,${r} ${-r},0" fill="${color2}"/><polygon points="${tile},${tile - r} ${tile + r},${tile} ${tile},${tile + r} ${tile - r},${tile}" fill="${color2}"/>`;
  } else if (pattern === "star") {
    shapes = `<polygon points="${starPoints(half, half, r, r * 0.42)}" fill="${motifFill}"/><polygon points="${starPoints(0, 0, r * 0.68, r * 0.28)}" fill="${color2}"/><polygon points="${starPoints(tile, tile, r * 0.68, r * 0.28)}" fill="${color2}"/>`;
  } else if (pattern === "wave") {
    const amp = Math.min(shape, tile / 3);
    shapes = `<path d="M -${quarter} ${quarter} Q ${quarter} ${quarter - amp} ${half + quarter} ${quarter} T ${tile + quarter * 3} ${quarter}" fill="none" stroke="${motifFill}" stroke-width="${Math.max(4, shape * 0.38)}" stroke-linecap="round"/><path d="M -${quarter} ${half + quarter} Q ${quarter} ${half + quarter + amp} ${half + quarter} ${half + quarter} T ${tile + quarter * 3} ${half + quarter}" fill="none" stroke="${color2}" stroke-width="${Math.max(3, shape * 0.24)}" stroke-linecap="round"/>`;
  } else if (pattern === "grid") {
    const bar = Math.max(6, shape * 0.32);
    shapes = `<rect x="${quarter - bar / 2}" width="${bar}" height="${tile}" rx="${bar / 2}" fill="${motifFill}"/><rect y="${quarter - bar / 2}" width="${tile}" height="${bar}" rx="${bar / 2}" fill="${motifFill}"/><circle cx="${quarter}" cy="${quarter}" r="${r * 0.42}" fill="${color2}"/><rect x="${half + quarter - r * 0.55}" y="${half + quarter - r * 0.55}" width="${r * 1.1}" height="${r * 1.1}" fill="${color2}" transform="rotate(45 ${half + quarter} ${half + quarter})"/>`;
  } else {
    const tri = `${quarter},${quarter - r} ${quarter + r},${quarter + r} ${quarter - r},${quarter + r}`;
    shapes = `<polygon points="${tri}" fill="${motifFill}"/><circle cx="${half + quarter}" cy="${quarter}" r="${r * 0.72}" fill="${color2}"/><rect x="${quarter - r * 0.72}" y="${half + quarter - r * 0.72}" width="${r * 1.44}" height="${r * 1.44}" fill="${color2}" transform="rotate(45 ${quarter} ${half + quarter})"/><path d="M ${half + quarter - r} ${half + quarter} A ${r} ${r} 0 0 0 ${half + quarter + r} ${half + quarter}" fill="none" stroke="${motifFill}" stroke-width="${Math.max(5, r * 0.38)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}"><defs><linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${gradientAngle} .5 .5)"><stop stop-color="${bg}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="motifGradient" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${gradientAngle} .5 .5)"><stop stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient><filter id="soften" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${softness}"/></filter></defs><rect width="${tile}" height="${tile}" fill="${bgFill}"/><g${transform}${filter}>${shapes}</g></svg>`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export default function PatternStudio() {
  const initial = patterns[0];
  const [pattern, setPattern] = useState<PatternId>(initial.id);
  const [bg, setBg] = useState(initial.bg);
  const [bg2, setBg2] = useState(initial.bg2);
  const [color1, setColor1] = useState(initial.color1);
  const [color2, setColor2] = useState(initial.color2);
  const [tile, setTile] = useState(initial.tile);
  const [shape, setShape] = useState(initial.shape);
  const [rotation, setRotation] = useState(0);
  const [softness, setSoftness] = useState(0);
  const [backgroundGradient, setBackgroundGradient] = useState(false);
  const [shapeGradient, setShapeGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [tileView, setTileView] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState("");

  const current = patterns.find((item) => item.id === pattern) ?? patterns[0];
  const svg = useMemo(
    () => buildPatternSvg({ pattern, bg, bg2, color1, color2, tile, shape, rotation, softness, backgroundGradient, shapeGradient, gradientAngle }),
    [pattern, bg, bg2, color1, color2, tile, shape, rotation, softness, backgroundGradient, shapeGradient, gradientAngle],
  );
  const dataUri = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const applyPreset = (preset: PatternPreset) => {
    setPattern(preset.id);
    setBg(preset.bg);
    setBg2(preset.bg2);
    setColor1(preset.color1);
    setColor2(preset.color2);
    setTile(preset.tile);
    setShape(preset.shape);
    setRotation(0);
    setSoftness(preset.id === "polka" || preset.id === "duotone" ? 0.6 : 0);
  };

  const randomize = () => {
    const nextPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const nextPalette = palettes[Math.floor(Math.random() * palettes.length)];
    setPattern(nextPattern.id);
    setBg(nextPalette[0]);
    setBg2(nextPalette[1]);
    setColor1(nextPalette[2]);
    setColor2(nextPalette[3]);
    setTile(Math.round(56 + Math.random() * 96));
    setShape(Math.round(12 + Math.random() * 46));
    setRotation(Math.round(Math.random() * 90));
    showToast("새 조합을 만들었어요");
  };

  const exportSvg = () => {
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `loop-lab-${pattern}-tile.svg`);
    setExportOpen(false);
    showToast("SVG 타일을 저장했어요");
  };

  const exportPng = (size: number) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) return;
      for (let y = 0; y < size; y += tile) {
        for (let x = 0; x < size; x += tile) context.drawImage(image, x, y, tile, tile);
      }
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `loop-lab-${pattern}-${size}.png`);
      }, "image/png");
      URL.revokeObjectURL(objectUrl);
      setExportOpen(false);
      showToast(`${size}px PNG를 저장했어요`);
    };
    image.src = objectUrl;
  };

  const copyCss = async () => {
    const css = `background-color: ${bg};\nbackground-image: url("${dataUri}");\nbackground-size: ${tile}px ${tile}px;`;
    await navigator.clipboard.writeText(css);
    setExportOpen(false);
    showToast("CSS를 복사했어요");
  };

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LOOP LAB 홈">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>LOOP LAB</span>
          <em>PATTERN MAKER</em>
        </a>
        <div className="top-actions">
          <span className="save-state"><i /> 브라우저에서 바로 작업</span>
          <div className="export-wrap">
            <button className="export-button" type="button" onClick={() => setExportOpen((value) => !value)} aria-expanded={exportOpen}>내보내기 ↗</button>
            {exportOpen && (
              <div className="export-menu">
                <div><b>패턴 내보내기</b><button aria-label="내보내기 닫기" onClick={() => setExportOpen(false)}>×</button></div>
                <button onClick={() => exportPng(960)}><span>PNG</span><b>960 × 960</b></button>
                <button onClick={() => exportPng(1920)}><span>PNG</span><b>1920 × 1920</b></button>
                <button onClick={() => exportPng(3840)}><span>PNG</span><b>3840 × 3840</b></button>
                <button onClick={exportSvg}><span>SVG</span><b>Seamless tile</b></button>
                <button onClick={copyCss}><span>CSS</span><b>배경 코드 복사</b></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="workspace" id="top">
        <aside className="control-panel">
          <div className="panel-heading">
            <p className="eyebrow">MAKE IT LOOP · 01</p>
            <h1>반복되는<br />리듬을 만드세요.</h1>
            <p>단순한 도형도 색과 간격이 달라지면 한 편의 뮤직비디오 같은 배경이 됩니다.</p>
          </div>

          <section className="control-block">
            <div className="control-label"><span>패턴</span><strong>{current.tag}</strong></div>
            <div className="pattern-picker" aria-label="패턴 종류">
              {patterns.map((item) => (
                <button key={item.id} className={pattern === item.id ? "pattern-option active" : "pattern-option"} onClick={() => applyPreset(item)} aria-pressed={pattern === item.id}>
                  <i className={`pattern-thumb thumb-${item.id}`} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="control-block color-controls">
            <div className="control-label"><span>컬러</span><strong>4 COLORS</strong></div>
            <div className="color-grid">
              <label><span>배경 1</span><i style={{ backgroundColor: bg }}><input type="color" value={bg} onChange={(event) => setBg(event.target.value)} /></i><b>{bg}</b></label>
              <label><span>배경 2</span><i style={{ backgroundColor: bg2 }}><input type="color" value={bg2} onChange={(event) => setBg2(event.target.value)} /></i><b>{bg2}</b></label>
              <label><span>도형 1</span><i style={{ backgroundColor: color1 }}><input type="color" value={color1} onChange={(event) => setColor1(event.target.value)} /></i><b>{color1}</b></label>
              <label><span>도형 2</span><i style={{ backgroundColor: color2 }}><input type="color" value={color2} onChange={(event) => setColor2(event.target.value)} /></i><b>{color2}</b></label>
            </div>
            <div className="toggle-row">
              <label><input type="checkbox" checked={backgroundGradient} onChange={(event) => setBackgroundGradient(event.target.checked)} /><span />배경 그라데이션</label>
              <label><input type="checkbox" checked={shapeGradient} onChange={(event) => setShapeGradient(event.target.checked)} /><span />도형 그라데이션</label>
            </div>
            {(backgroundGradient || shapeGradient) && (
              <RangeControl label="그라데이션 방향" value={gradientAngle} suffix="°" min={0} max={360} onChange={setGradientAngle} />
            )}
          </section>

          <section className="control-block sliders">
            <div className="control-label"><span>모양 조절</span><strong>LIVE</strong></div>
            <RangeControl label="타일 크기" value={tile} suffix=" px" min={24} max={220} onChange={setTile} />
            <RangeControl label="도형 크기" value={shape} suffix=" px" min={4} max={96} onChange={setShape} />
            <RangeControl label="회전" value={rotation} suffix="°" min={0} max={180} onChange={setRotation} />
            <RangeControl label="가장자리 번짐" value={softness} suffix="" min={0} max={5} step={0.2} onChange={setSoftness} />
          </section>

          <button className="random-mobile" onClick={randomize}>↻ 랜덤 조합 만들기</button>
        </aside>

        <section className="preview-stage" aria-label="패턴 미리보기">
          <div className="preview-toolbar">
            <div className="view-switch" aria-label="미리보기 방식">
              <button className={!tileView ? "active" : ""} onClick={() => setTileView(false)}>전체 채우기</button>
              <button className={tileView ? "active" : ""} onClick={() => setTileView(true)}>타일 경계</button>
            </div>
            <div className="preview-actions">
              <label className="zoom-control">미리보기 <input type="range" min="45" max="180" value={previewZoom} onChange={(event) => setPreviewZoom(Number(event.target.value))} /><b>{previewZoom}%</b></label>
              <button className="shuffle-button" onClick={randomize}>↻ 랜덤 조합</button>
            </div>
          </div>

          <div className={tileView ? "pattern-preview tile-view" : "pattern-preview"} style={{ backgroundColor: bg, backgroundImage: `url("${dataUri}")`, backgroundSize: `${tile * (previewZoom / 100)}px ${tile * (previewZoom / 100)}px` }}>
            <div className="preview-badge"><span className="pulse" />SEAMLESS PREVIEW</div>
            {tileView && <div className="tile-guide" style={{ width: tile * (previewZoom / 100), height: tile * (previewZoom / 100) }}><span>1 TILE</span></div>}
            <div className="scale-note">{tile} × {tile}px TILE</div>
          </div>

          <div className="preset-strip">
            <span>QUICK START</span>
            {patterns.slice(0, 8).map((item) => (
              <button key={item.id} className={pattern === item.id ? "mini-pattern selected" : "mini-pattern"} onClick={() => applyPreset(item)} aria-label={`${item.name} 프리셋`} style={{ backgroundColor: item.bg, backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPatternSvg({ pattern: item.id, bg: item.bg, bg2: item.bg2, color1: item.color1, color2: item.color2, tile: item.tile, shape: item.shape, rotation: 0, softness: 0, backgroundGradient: false, shapeGradient: false, gradientAngle: 45 }))}")` }} />
            ))}
            <span className="preset-name">{current.name}</span>
          </div>
        </section>
      </section>

      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}

function RangeControl({ label, value, suffix, min, max, step = 1, onChange }: { label: string; value: number; suffix: string; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="range-control">
      <span>{label}</span><b>{value}{suffix}</b>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
