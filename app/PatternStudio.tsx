"use client";

import { useMemo, useState, type PointerEvent } from "react";

type PatternId =
  | "polka"
  | "duotone"
  | "micro"
  | "checker"
  | "stripe"
  | "diamond"
  | "star"
  | "diamondgrid"
  | "geo"
  | "wave"
  | "grid"
  | "heart";

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
  { id: "checker", name: "스윗 체크", tag: "CHECKER", bg: "#FFE12F", bg2: "#FFE96C", color1: "#FFFDF5", color2: "#FF8F81", tile: 90, shape: 44 },
  { id: "stripe", name: "소프트 스트라이프", tag: "STRIPE", bg: "#C8B7EE", bg2: "#E6DDF8", color1: "#FFF1B7", color2: "#17336B", tile: 80, shape: 24 },
  { id: "diamond", name: "캔디 다이아", tag: "DIAMOND", bg: "#FF9188", bg2: "#FFBBB3", color1: "#FFF1B7", color2: "#5EDAD4", tile: 96, shape: 46 },
  { id: "star", name: "스타 리듬", tag: "STARS", bg: "#716DE3", bg2: "#AAA6F4", color1: "#FFF09F", color2: "#FF9188", tile: 108, shape: 38 },
  { id: "diamondgrid", name: "올 다이아", tag: "ALL DIAMONDS", bg: "#FFF0B8", bg2: "#FFF8DC", color1: "#FF8F85", color2: "#61DED7", tile: 120, shape: 42 },
  { id: "geo", name: "지오 그리드", tag: "SHAPE GRID", bg: "#F7F5ED", bg2: "#FFFFFF", color1: "#9A9A9A", color2: "#17336B", tile: 128, shape: 38 },
  { id: "wave", name: "웨이브 사인", tag: "SINE WAVE", bg: "#FFF0B8", bg2: "#FFF8DC", color1: "#17336B", color2: "#FF8F85", tile: 120, shape: 24 },
  { id: "grid", name: "클린 격자", tag: "GRID ONLY", bg: "#FFF9E8", bg2: "#FFF1B7", color1: "#17336B", color2: "#FF9188", tile: 96, shape: 8 },
  { id: "heart", name: "하트 팝", tag: "HEART", bg: "#FFB7A8", bg2: "#FFE1D4", color1: "#FF5E68", color2: "#FFF1B7", tile: 108, shape: 44 },
];

const tileSizes = [24, 27, 30, 32, 36, 40, 45, 48, 54, 60, 64, 72, 80, 90, 96, 108, 120, 128, 135, 160, 180, 192, 216];
const bothAxisTileSizes = new Set([24, 30, 40, 60, 120]);

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

function heartPath(cx: number, cy: number, size: number) {
  return `M ${cx} ${cy + size * 0.95} C ${cx - size * 1.2} ${cy + size * 0.15} ${cx - size * 1.05} ${cy - size * 0.9} ${cx - size * 0.45} ${cy - size * 0.9} C ${cx - size * 0.15} ${cy - size * 0.9} ${cx - size * 0.04} ${cy - size * 0.65} ${cx} ${cy - size * 0.4} C ${cx + size * 0.04} ${cy - size * 0.65} ${cx + size * 0.15} ${cy - size * 0.9} ${cx + size * 0.45} ${cy - size * 0.9} C ${cx + size * 1.05} ${cy - size * 0.9} ${cx + size * 1.2} ${cy + size * 0.15} ${cx} ${cy + size * 0.95} Z`;
}

function shuffledShapeGrid(seed: number) {
  const order = ["triangle", "quarter", "triangle", "quarter"];
  let state = (seed >>> 0) || 1;

  for (let index = order.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = Math.floor((state / 4294967296) * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  return order;
}

function createSeededRandom(seed: number) {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildPatternSvg({
  pattern,
  color1,
  color2,
  tile,
  shape,
  rotation,
  softness,
  shapeGradient,
  gradientAngle,
  shapeGridSeed,
}: {
  pattern: PatternId;
  color1: string;
  color2: string;
  tile: number;
  shape: number;
  rotation: number;
  softness: number;
  shapeGradient: boolean;
  gradientAngle: number;
  shapeGridSeed: number;
}) {
  const half = tile / 2;
  const quarter = tile / 4;
  const r = Math.min(shape / 2, tile * 0.42);
  const motifFill = shapeGradient ? "url(#motifGradient)" : color1;
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
    const starSize = Math.min(r, half * 0.4);
    shapes = `<polygon points="${starPoints(0, 0, starSize, starSize * 0.42)}" fill="${motifFill}"/><polygon points="${starPoints(tile, 0, starSize, starSize * 0.42)}" fill="${motifFill}"/><polygon points="${starPoints(half, half, starSize, starSize * 0.42)}" fill="${color2}"/><polygon points="${starPoints(0, tile, starSize, starSize * 0.42)}" fill="${motifFill}"/><polygon points="${starPoints(tile, tile, starSize, starSize * 0.42)}" fill="${motifFill}"/>`;
  } else if (pattern === "diamondgrid") {
    const diamondSize = Math.min(r, half * 0.4);
    const diamond = (cx: number, cy: number) => `${cx},${cy - diamondSize} ${cx + diamondSize},${cy} ${cx},${cy + diamondSize} ${cx - diamondSize},${cy}`;
    shapes = `<polygon points="${diamond(0, 0)}" fill="${motifFill}"/><polygon points="${diamond(tile, 0)}" fill="${motifFill}"/><polygon points="${diamond(half, half)}" fill="${color2}"/><polygon points="${diamond(0, tile)}" fill="${motifFill}"/><polygon points="${diamond(tile, tile)}" fill="${motifFill}"/>`;
  } else if (pattern === "wave") {
    const amp = Math.min(shape * 0.62, tile * 0.2);
    const seamlessSine = (baseline: number, direction: number) => `M -${tile} ${baseline} Q -${tile * 0.75} ${baseline - direction * amp} -${half} ${baseline} Q -${quarter} ${baseline + direction * amp} 0 ${baseline} Q ${quarter} ${baseline - direction * amp} ${half} ${baseline} Q ${half + quarter} ${baseline + direction * amp} ${tile} ${baseline} Q ${tile + quarter} ${baseline - direction * amp} ${tile + half} ${baseline} Q ${tile + half + quarter} ${baseline + direction * amp} ${tile * 2} ${baseline}`;
    shapes = `<path d="${seamlessSine(quarter, 1)}" fill="none" stroke="${motifFill}" stroke-width="${Math.max(4, shape * 0.38)}" stroke-linejoin="round"/><path d="${seamlessSine(half + quarter, -1)}" fill="none" stroke="${color2}" stroke-width="${Math.max(3, shape * 0.24)}" stroke-linejoin="round"/>`;
  } else if (pattern === "grid") {
    const lineWidth = Math.max(2, Math.min(10, shape * 0.18));
    shapes = `<path d="M 0 0 H ${tile} M 0 0 V ${tile}" fill="none" stroke="${motifFill}" stroke-width="${lineWidth}" stroke-linecap="square"/>`;
  } else if (pattern === "heart") {
    const heartSize = Math.min(shape * 0.85, tile * 0.32);
    shapes = [
      `<path d="${heartPath(0, 0, heartSize)}" fill="${motifFill}"/>`,
      `<path d="${heartPath(tile, 0, heartSize)}" fill="${motifFill}"/>`,
      `<path d="${heartPath(0, tile, heartSize)}" fill="${motifFill}"/>`,
      `<path d="${heartPath(tile, tile, heartSize)}" fill="${motifFill}"/>`,
      `<path d="${heartPath(half, half, heartSize)}" fill="${color2}"/>`,
    ].join("");
  } else {
    const cell = half;
    const gridStroke = Math.max(2, tile * 0.035);
    const inset = gridStroke * 0.72;
    const circleRadius = cell / 2 - inset;
    const diamondRadius = cell * 0.44;
    const diamond = (cx: number, cy: number) => `${cx},${cy - diamondRadius} ${cx + diamondRadius},${cy} ${cx},${cy + diamondRadius} ${cx - diamondRadius},${cy}`;
    const cells = [
      { x: 0, y: 0 },
      { x: half, y: 0 },
      { x: 0, y: half },
      { x: half, y: half },
    ];
    const gridShapes = shuffledShapeGrid(shapeGridSeed).map((kind, index) => {
      const { x, y } = cells[index];
      const fill = index % 2 === 0 ? motifFill : color2;

      if (kind === "triangle") return `<polygon points="${x},${y} ${x + cell},${y} ${x},${y + cell}" fill="${fill}"/>`;
      if (kind === "circle") return `<circle cx="${x + quarter}" cy="${y + quarter}" r="${circleRadius}" fill="${fill}"/>`;
      if (kind === "diamond") return `<polygon points="${diamond(x + quarter, y + quarter)}" fill="${fill}"/>`;
      return `<path d="M ${x} ${y} L ${x + cell} ${y} A ${cell} ${cell} 0 0 1 ${x} ${y + cell} Z" fill="${fill}"/>`;
    }).join("");
    shapes = `${gridShapes}<rect x="${gridStroke / 2}" y="${gridStroke / 2}" width="${tile - gridStroke}" height="${tile - gridStroke}" fill="none" stroke="${color1}" stroke-width="${gridStroke}" opacity=".55"/><path d="M ${half} 0 V ${tile} M 0 ${half} H ${tile}" stroke="${color1}" stroke-width="${gridStroke}" opacity=".55"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}"><defs><linearGradient id="motifGradient" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${gradientAngle} .5 .5)"><stop stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient><filter id="soften" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${softness}"/></filter></defs><g${transform}${filter}>${shapes}</g></svg>`;
}

function buildFrameSvg({ tileSvg, tile, bg, bg2, backgroundGradient, gradientAngle }: { tileSvg: string; tile: number; bg: string; bg2: string; backgroundGradient: boolean; gradientAngle: number }) {
  const width = 1920;
  const height = 1080;
  const radians = (gradientAngle * Math.PI) / 180;
  const x1 = 50 - Math.cos(radians) * 50;
  const y1 = 50 - Math.sin(radians) * 50;
  const x2 = 50 + Math.cos(radians) * 50;
  const y2 = 50 + Math.sin(radians) * 50;
  const tileData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tileSvg)}`;
  const backgroundFill = backgroundGradient ? "url(#frameBackground)" : bg;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="frameBackground" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop stop-color="${bg}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><pattern id="motifPattern" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse"><image href="${tileData}" width="${tile}" height="${tile}"/></pattern></defs><rect width="1920" height="1080" fill="${backgroundFill}"/><rect width="1920" height="1080" fill="url(#motifPattern)"/></svg>`;
}

function buildShapeGridFrameSvg({
  bg,
  bg2,
  color1,
  color2,
  tile,
  shape,
  shapeGradient,
  backgroundGradient,
  gradientAngle,
  rotation,
  seed,
}: {
  bg: string;
  bg2: string;
  color1: string;
  color2: string;
  tile: number;
  shape: number;
  shapeGradient: boolean;
  backgroundGradient: boolean;
  gradientAngle: number;
  rotation: number;
  seed: number;
}) {
  const width = 1920;
  const height = 1080;
  const cell = Math.max(28, tile / 2);
  const radius = cell / 2;
  const random = createSeededRandom(seed);
  const radians = (gradientAngle * Math.PI) / 180;
  const x1 = 50 - Math.cos(radians) * 50;
  const y1 = 50 - Math.sin(radians) * 50;
  const x2 = 50 + Math.cos(radians) * 50;
  const y2 = 50 + Math.sin(radians) * 50;
  const backgroundFill = backgroundGradient ? "url(#frameBackground)" : bg;
  const motifFill = shapeGradient ? "url(#frameMotifGradient)" : color1;
  const kinds = ["quarterCircle", "halfTriangle", "butterfly", "hourglass"];
  const trianglePoints = (x: number, y: number, direction: number) => {
    if (direction === 1) return `${x + cell},${y} ${x + cell},${y + cell} ${x},${y}`;
    if (direction === 2) return `${x + cell},${y + cell} ${x},${y + cell} ${x + cell},${y}`;
    if (direction === 3) return `${x},${y + cell} ${x},${y} ${x + cell},${y + cell}`;
    return `${x},${y} ${x + cell},${y} ${x},${y + cell}`;
  };
  const quarterPath = (x: number, y: number, direction: number) => {
    if (direction === 1) return `M ${x + cell} ${y} L ${x + cell} ${y + cell} A ${cell} ${cell} 0 0 1 ${x} ${y} Z`;
    if (direction === 2) return `M ${x + cell} ${y + cell} L ${x} ${y + cell} A ${cell} ${cell} 0 0 1 ${x + cell} ${y} Z`;
    if (direction === 3) return `M ${x} ${y + cell} L ${x} ${y} A ${cell} ${cell} 0 0 1 ${x + cell} ${y + cell} Z`;
    return `M ${x} ${y} L ${x + cell} ${y} A ${cell} ${cell} 0 0 1 ${x} ${y + cell} Z`;
  };
  let cells = "";

  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const kind = kinds[Math.floor(random() * kinds.length)];
      const fill = motifFill;
      const direction = (Math.floor(random() * 4) + Math.round(rotation / 45)) % 4;
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      const pairVariant = (Math.floor(random() * 2) + Math.round(rotation / 90)) % 2;
      let shapeMarkup = "";
      if (kind === "quarterCircle") shapeMarkup = `<path d="${quarterPath(x, y, direction)}" fill="${fill}"/>`;
      else if (kind === "halfTriangle") shapeMarkup = `<polygon points="${trianglePoints(x, y, direction)}" fill="${fill}"/>`;
      else if (kind === "butterfly") {
        shapeMarkup = pairVariant === 0
          ? `<polygon points="${x},${y} ${x},${y + cell} ${cx},${cy}" fill="${fill}"/><polygon points="${x + cell},${y} ${x + cell},${y + cell} ${cx},${cy}" fill="${fill}"/>`
          : `<polygon points="${x},${y} ${x + cell},${y} ${cx},${cy}" fill="${fill}"/><polygon points="${x},${y + cell} ${x + cell},${y + cell} ${cx},${cy}" fill="${fill}"/>`;
      } else {
        shapeMarkup = pairVariant === 0
          ? `<path d="M ${x} ${y} H ${x + cell} A ${radius} ${radius} 0 0 1 ${x} ${y} Z" fill="${fill}"/><path d="M ${x} ${y + cell} H ${x + cell} A ${radius} ${radius} 0 0 0 ${x} ${y + cell} Z" fill="${fill}"/>`
          : `<path d="M ${x} ${y} V ${y + cell} A ${radius} ${radius} 0 0 0 ${x} ${y} Z" fill="${fill}"/><path d="M ${x + cell} ${y} V ${y + cell} A ${radius} ${radius} 0 0 1 ${x + cell} ${y} Z" fill="${fill}"/>`;
      }
      cells += shapeMarkup;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="frameBackground" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop stop-color="${bg}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="frameMotifGradient" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${gradientAngle} .5 .5)"><stop stop-color="${color1}"/><stop offset="1" stop-color="${bg}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="${backgroundFill}"/><g stroke="${motifFill}" stroke-width="2.4" stroke-linejoin="round" shape-rendering="geometricPrecision">${cells}</g></svg>`;
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
  const [backgroundGradient, setBackgroundGradient] = useState(true);
  const [shapeGradient, setShapeGradient] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [tileView, setTileView] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [shapeGridSeed, setShapeGridSeed] = useState(731);

  const current = patterns.find((item) => item.id === pattern) ?? patterns[0];
  const rotationOptions = [0, 45, 90, 135];
  const tileSvg = useMemo(
    () => buildPatternSvg({ pattern, color1, color2, tile, shape, rotation, softness, shapeGradient, gradientAngle, shapeGridSeed }),
    [pattern, color1, color2, tile, shape, rotation, softness, shapeGradient, gradientAngle, shapeGridSeed],
  );
  const dataUri = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tileSvg)}`, [tileSvg]);
  const frameSvg = useMemo(
    () => pattern === "geo"
      ? buildShapeGridFrameSvg({ bg, bg2, color1, color2, tile, shape, shapeGradient, backgroundGradient, gradientAngle, rotation, seed: shapeGridSeed })
      : buildFrameSvg({ tileSvg, tile, bg, bg2, backgroundGradient, gradientAngle }),
    [pattern, tileSvg, tile, bg, bg2, color1, color2, shape, shapeGradient, backgroundGradient, gradientAngle, rotation, shapeGridSeed],
  );
  const frameDataUri = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(frameSvg)}`, [frameSvg]);
  const previewBackgroundImage = pattern === "geo"
    ? `url("${frameDataUri}")`
    : backgroundGradient
      ? `url("${dataUri}"), linear-gradient(${gradientAngle}deg, ${bg}, ${bg2})`
      : `url("${dataUri}")`;

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
    if (preset.id === "geo") setShapeGridSeed(Math.floor(Math.random() * 2147483646) + 1);
  };

  const randomize = () => {
    const nextPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const nextPalette = palettes[Math.floor(Math.random() * palettes.length)];
    setPattern(nextPattern.id);
    setBg(nextPalette[0]);
    setBg2(nextPalette[1]);
    setColor1(nextPalette[2]);
    setColor2(nextPalette[3]);
    setTile(tileSizes[Math.floor(Math.random() * tileSizes.length)]);
    setShape(Math.round(12 + Math.random() * 46));
    const nextRotations = [0, 45, 90, 135];
    setRotation(nextRotations[Math.floor(Math.random() * nextRotations.length)]);
    setShapeGridSeed(Math.floor(Math.random() * 2147483646) + 1);
    showToast("새 조합을 만들었어요");
  };

  const exportSvg = () => {
    downloadBlob(new Blob([frameSvg], { type: "image/svg+xml" }), `loop-lab-${pattern}-1920x1080.svg`);
    setExportOpen(false);
    showToast("1920×1080 SVG를 저장했어요");
  };

  const exportPng = (width: number, height: number) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(new Blob([pattern === "geo" ? frameSvg : tileSvg], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;

      if (pattern === "geo") {
        context.drawImage(image, 0, 0, width, height);
      } else if (backgroundGradient) {
        const radians = ((gradientAngle - 90) * Math.PI) / 180;
        const directionX = Math.cos(radians);
        const directionY = Math.sin(radians);
        const span = Math.abs(width * directionX) + Math.abs(height * directionY);
        const centerX = width / 2;
        const centerY = height / 2;
        const gradient = context.createLinearGradient(
          centerX - (directionX * span) / 2,
          centerY - (directionY * span) / 2,
          centerX + (directionX * span) / 2,
          centerY + (directionY * span) / 2,
        );
        gradient.addColorStop(0, bg);
        gradient.addColorStop(1, bg2);
        context.fillStyle = gradient;
      } else {
        context.fillStyle = bg;
      }
      if (pattern !== "geo") {
        context.fillRect(0, 0, width, height);

        const outputScale = width / 1920;
        const outputTile = tile * outputScale;
        for (let y = 0; y < height; y += outputTile) {
          for (let x = 0; x < width; x += outputTile) context.drawImage(image, x, y, outputTile, outputTile);
        }
      }

      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `loop-lab-${pattern}-${width}x${height}.png`);
      }, "image/png");
      URL.revokeObjectURL(objectUrl);
      setExportOpen(false);
      showToast(`${width}×${height} PNG를 저장했어요`);
    };
    image.src = objectUrl;
  };

  const copyCss = async () => {
    const css = pattern === "geo"
      ? `background: url("${frameDataUri}") center / 100% 100% no-repeat;`
      : backgroundGradient
      ? `background-color: ${bg};\nbackground-image: url("${dataUri}"), linear-gradient(${gradientAngle}deg, ${bg}, ${bg2});\nbackground-size: ${tile}px ${tile}px, 100% 100%;\nbackground-repeat: repeat, no-repeat;`
      : `background-color: ${bg};\nbackground-image: url("${dataUri}");\nbackground-size: ${tile}px ${tile}px;\nbackground-repeat: repeat;`;
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
                <button onClick={() => exportPng(1280, 720)}><span>PNG</span><b>1280 × 720</b></button>
                <button className="recommended-export" onClick={() => exportPng(1920, 1080)}><span>PNG · 기준</span><b>1920 × 1080</b></button>
                <button onClick={() => exportPng(3840, 2160)}><span>PNG · 4K</span><b>3840 × 2160</b></button>
                <button onClick={exportSvg}><span>SVG</span><b>1920 × 1080</b></button>
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
            <p>1920×1080 프레임 전체에 배경을 한 번 깔고, 그 위에 도형 패턴을 반복합니다.</p>
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
            {pattern === "geo" && <button className="shape-shuffle-button" onClick={() => { setShapeGridSeed(Math.floor(Math.random() * 2147483646) + 1); showToast("Shape Grid 배열을 바꿨어요"); }}>↻ 도형 재배치</button>}
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
            <TileSizeControl value={tile} onChange={setTile} />
            <RangeControl label="도형 크기" value={shape} suffix=" px" min={4} max={96} onChange={setShape} />
            <RotationControl value={rotation} options={rotationOptions} onChange={setRotation} />
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

          <div className="frame-wrap">
            <div className={tileView && pattern !== "geo" ? "pattern-preview tile-view" : "pattern-preview"} style={{ backgroundColor: bg, backgroundImage: previewBackgroundImage, backgroundSize: pattern === "geo" ? "100% 100%" : `${tile * (previewZoom / 100)}px ${tile * (previewZoom / 100)}px${backgroundGradient ? ", 100% 100%" : ""}`, backgroundRepeat: pattern === "geo" ? "no-repeat" : backgroundGradient ? "repeat, no-repeat" : "repeat" }}>
              <div className="preview-badge"><span className="pulse" />1920 × 1080 FRAME</div>
              {tileView && pattern !== "geo" && <div className="tile-guide" style={{ width: tile * (previewZoom / 100), height: tile * (previewZoom / 100) }}><span>1 TILE</span></div>}
              <div className="scale-note">{pattern === "geo" ? "FULL-FRAME RANDOM GRID" : `${tile} × ${tile}px TILE`}</div>
            </div>
          </div>

          <div className="preset-strip">
            <span>QUICK START</span>
            {patterns.map((item) => (
              <button key={item.id} className={pattern === item.id ? "mini-pattern selected" : "mini-pattern"} onClick={() => applyPreset(item)} aria-label={`${item.name} 프리셋`} style={{ backgroundColor: item.bg, backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildPatternSvg({ pattern: item.id, color1: item.color1, color2: item.color2, tile: item.tile, shape: item.shape, rotation: 0, softness: 0, shapeGradient: false, gradientAngle: 45, shapeGridSeed: 731 }))}")` }} />
            ))}
            <span className="preset-name">{current.name}</span>
          </div>
        </section>
      </section>

      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}

function TileSizeControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const index = Math.max(0, tileSizes.indexOf(value));
  const maxIndex = tileSizes.length - 1;
  const alignment = bothAxisTileSizes.has(value) ? "양축 정렬" : "1축 정렬";
  const handlePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const thumbPosition = bounds.left + (index / maxIndex) * bounds.width;
    const thumbHitZone = 12;

    if (Math.abs(event.clientX - thumbPosition) <= thumbHitZone) return;

    event.preventDefault();
    event.currentTarget.focus();
    const nextIndex = event.clientX > thumbPosition ? Math.min(maxIndex, index + 1) : Math.max(0, index - 1);
    if (nextIndex !== index) onChange(tileSizes[nextIndex]);
  };

  return (
    <label className="range-control tile-size-control">
      <span>타일 크기</span><b>{value} px · {alignment}</b>
      <input aria-label="타일 크기" type="range" min="0" max={maxIndex} step="1" value={index} onPointerDown={handlePointerDown} onChange={(event) => onChange(tileSizes[Number(event.target.value)] ?? tileSizes[0])} />
    </label>
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

function RotationControl({ value, options, onChange }: { value: number; options: number[]; onChange: (value: number) => void }) {
  return (
    <div className="rotation-control" aria-label="도형 회전">
      <span>회전</span>
      <div>
        {options.map((option) => <button key={option} type="button" className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}°</button>)}
      </div>
    </div>
  );
}
