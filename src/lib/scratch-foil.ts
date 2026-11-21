/** Scratch card ki sunehri foil canvas par banata hai (gradient + lattice + medallion + sparkle). */
export function drawFoil(context: CanvasRenderingContext2D, width: number, height: number, ratio: number) {
  context.save();
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;

  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#9c7a35");
  base.addColorStop(0.18, "#e9cf8f");
  base.addColorStop(0.36, "#b88f46");
  base.addColorStop(0.55, "#f3e1a8");
  base.addColorStop(0.74, "#b58a3f");
  base.addColorStop(1, "#d8b66a");
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  // Diamond lattice
  context.strokeStyle = "rgba(255, 246, 214, 0.34)";
  context.lineWidth = 1 * ratio;
  const step = 26 * ratio;
  context.beginPath();
  for (let x = -height; x < width + height; x += step) {
    context.moveTo(x, 0);
    context.lineTo(x + height, height);
    context.moveTo(x, height);
    context.lineTo(x + height, 0);
  }
  context.stroke();

  // Dots at lattice crossings
  context.fillStyle = "rgba(120, 84, 24, 0.22)";
  for (let y = 0; y < height; y += step) {
    for (let x = ((y / step) % 2) * (step / 2); x < width; x += step) {
      context.beginPath();
      context.arc(x, y, 1.1 * ratio, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Foil grain
  for (let index = 0; index < 900; index += 1) {
    context.fillStyle = index % 3 === 0 ? "rgba(255,255,255,0.35)" : "rgba(90,60,10,0.16)";
    context.fillRect(Math.random() * width, Math.random() * height, ratio * (index % 7 === 0 ? 1.6 : 0.8), ratio * 0.8);
  }

  // Medallion
  const cx = width / 2;
  const cy = height * 0.27;
  const radius = Math.min(width, height) * 0.115;
  for (let ring = 0; ring < 3; ring += 1) {
    context.beginPath();
    context.arc(cx, cy, radius - ring * 7 * ratio, 0, Math.PI * 2);
    context.strokeStyle = ring === 1 ? "rgba(255,248,222,0.7)" : "rgba(111,76,20,0.45)";
    context.lineWidth = (ring === 1 ? 1.4 : 1) * ratio;
    context.stroke();
  }
  for (let petal = 0; petal < 12; petal += 1) {
    const angle = (petal / 12) * Math.PI * 2;
    context.beginPath();
    context.ellipse(
      cx + Math.cos(angle) * radius * 0.55,
      cy + Math.sin(angle) * radius * 0.55,
      radius * 0.2,
      radius * 0.07,
      angle,
      0,
      Math.PI * 2,
    );
    context.fillStyle = "rgba(255,246,214,0.5)";
    context.fill();
  }
  context.beginPath();
  context.arc(cx, cy, radius * 0.14, 0, Math.PI * 2);
  context.fillStyle = "rgba(111,76,20,0.55)";
  context.fill();

  // Double border
  context.strokeStyle = "rgba(255,246,214,0.8)";
  context.lineWidth = 2 * ratio;
  context.strokeRect(10 * ratio, 10 * ratio, width - 20 * ratio, height - 20 * ratio);
  context.strokeStyle = "rgba(111,76,20,0.5)";
  context.lineWidth = 1 * ratio;
  context.strokeRect(16 * ratio, 16 * ratio, width - 32 * ratio, height - 32 * ratio);

  // Sparkles
  const sparkles: Array<[number, number, number]> = [
    [0.18, 0.12, 9], [0.82, 0.18, 7], [0.12, 0.62, 6], [0.88, 0.7, 10], [0.3, 0.88, 7], [0.72, 0.9, 8],
  ];
  for (const [fx, fy, size] of sparkles) {
    const sx = fx * width;
    const sy = fy * height;
    const s = size * ratio;
    context.beginPath();
    context.moveTo(sx, sy - s);
    context.quadraticCurveTo(sx, sy, sx + s, sy);
    context.quadraticCurveTo(sx, sy, sx, sy + s);
    context.quadraticCurveTo(sx, sy, sx - s, sy);
    context.quadraticCurveTo(sx, sy, sx, sy - s);
    context.fillStyle = "rgba(255,253,240,0.9)";
    context.fill();
  }
  context.restore();
}
