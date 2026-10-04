import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGradedDotsFrameSvg } from '../app/gradedDots.mjs';

const options = {
  bg: '#A3EEF2', bg2: '#F0FAF7', color1: '#45C1CB', color2: '#23C9AD',
  tile: 80, shape: 64, shape2: 2, rotation: 0, softness: 0,
  backgroundGradient: true, shapeGradient: true, gradientAngle: 180,
};
const circles = (svg) => [...svg.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)]
  .map((match) => match.slice(1).map(Number));

test('dots shrink across the whole frame with staggered rows', () => {
  const svg = buildGradedDotsFrameSvg(options);
  const dots = circles(svg);
  const column = dots.filter(([x]) => x === 0);
  assert.equal(column[0][2], 32);
  for (let i = 1; i < column.length; i++) assert.ok(column[i][2] <= column[i - 1][2]);
  assert.ok(column.at(-1)[2] < 1.03);
  assert.ok(dots.some((dot) => dot[2] === 1));
  assert.ok(dots.some(([x, y]) => x === 40 && y === 64));
  assert.ok(svg.includes('width="1920" height="1080"'));
  assert.equal((svg.match(/gradientUnits="userSpaceOnUse"/g) ?? []).length, 2);
});

test('zero sizes hide circles and equal sizes produce uniform dots', () => {
  assert.equal(circles(buildGradedDotsFrameSvg({ ...options, shape: 0, shape2: 0 })).length, 0);
  assert.ok(circles(buildGradedDotsFrameSvg({ ...options, shape: 20, shape2: 20 })).every((dot) => dot[2] === 10));
});

test('size direction stays in bounds at all four angles', () => {
  for (const rotation of [0, 45, 90, 135]) {
    const dots = circles(buildGradedDotsFrameSvg({ ...options, rotation }));
    assert.ok(dots.every((dot) => Number.isFinite(dot[2]) && dot[2] >= 1 && dot[2] <= 32));
  }
});

test('pulse is optional and alternates row phase', () => {
  assert.ok(!buildGradedDotsFrameSvg(options).includes('@keyframes'));
  const svg = buildGradedDotsFrameSvg({ ...options, pulse: true });
  assert.ok(svg.includes('animation-delay:-.25s'));
  assert.ok(svg.includes('transform-origin:40px 64px'));
});
