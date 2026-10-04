/**
 * Render a single 1920×1080 field, not a repeating tile. Both gradients
 * use frame coordinates so their colors never restart at a tile boundary.
 * @param {{bg:string,bg2:string,color1:string,color2:string,tile:number,
 * shape:number,shape2:number,backgroundGradient:boolean,shapeGradient:boolean,
 * gradientAngle:number,rotation:number,softness:number,pulse?:boolean}} options
 */
export function buildGradedDotsFrameSvg(options) {
  const { bg, bg2, color1, color2, tile, shape, shape2,
    backgroundGradient, shapeGradient, gradientAngle, rotation, softness, pulse = false } = options;
  const width = 1920;
  const height = 1080;
  const spacing = Math.max(8, tile);
  const rowHeight = spacing * 0.8;
  const radians = (gradientAngle - 90) * Math.PI / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const span = Math.abs(width * dx) + Math.abs(height * dy);
  const endpoints = `x1="${width / 2 - dx * span / 2}" y1="${height / 2 - dy * span / 2}" x2="${width / 2 + dx * span / 2}" y2="${height / 2 + dy * span / 2}" gradientUnits="userSpaceOnUse"`;
  const direction = rotation * Math.PI / 180;
  const sizeDx = Math.sin(direction);
  const sizeDy = Math.cos(direction);
  const minProjection = Math.min(0, width * sizeDx) + Math.min(0, height * sizeDy);
  const projectionSpan = Math.abs(width * sizeDx) + Math.abs(height * sizeDy);
  const dots = [];
  for (let row = 0; row * rowHeight <= height + rowHeight; row++) {
    const y = row * rowHeight;
    const offset = row % 2 ? spacing / 2 : 0;
    for (let x = -spacing + offset; x <= width + spacing; x += spacing) {
      const progress = Math.min(1, Math.max(0, (x * sizeDx + y * sizeDy - minProjection) / projectionSpan));
      const diameter = shape2 + (shape - shape2) * Math.pow(1 - progress, 2.4);
      if (diameter <= 0) continue;
      const circle = `<circle cx="${x}" cy="${y}" r="${diameter / 2}"/>`;
      dots.push(pulse ? `<g class="graded-dot${row % 2 ? ' delayed' : ''}" style="transform-origin:${x}px ${y}px">${circle}</g>` : circle);
    }
  }
  const animation = pulse ? '<style>@keyframes gradedPulse{0%,100%{transform:scale(.94)}50%{transform:scale(1.06)}}.graded-dot{animation:gradedPulse .5s ease-in-out infinite}.graded-dot.delayed{animation-delay:-.25s}</style>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="gradedBg" ${endpoints}><stop stop-color="${bg}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><linearGradient id="gradedInk" ${endpoints}><stop stop-color="${color1}"/><stop offset="1" stop-color="${color2}"/></linearGradient><filter id="gradedBlur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${softness}"/></filter></defs>${animation}<rect width="1920" height="1080" fill="${backgroundGradient ? 'url(#gradedBg)' : bg}"/><g fill="${shapeGradient ? 'url(#gradedInk)' : color1}"${softness > 0 ? ' filter="url(#gradedBlur)"' : ''}>${dots.join('')}</g></svg>`;
}
