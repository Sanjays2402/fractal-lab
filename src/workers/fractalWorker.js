// Color palettes
const palettes = {
  classic: (t) => {
    const r = Math.floor(9 * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
  },
  fire: (t) => {
    const r = Math.min(255, Math.floor(t < 0.5 ? t * 2 * 255 : 255));
    const g = Math.min(255, Math.floor(t < 0.5 ? 0 : (t - 0.5) * 2 * 200));
    const b = Math.floor(t < 0.8 ? 0 : (t - 0.8) * 5 * 80);
    return [r, g, b];
  },
  ocean: (t) => {
    const r = Math.floor(t * t * 80);
    const g = Math.floor(t * 180 + 20);
    const b = Math.floor(120 + t * 135);
    return [r, g, b];
  },
  neon: (t) => {
    const angle = t * Math.PI * 2;
    const r = Math.floor(Math.sin(angle) * 127 + 128);
    const g = Math.floor(Math.sin(angle + 2.094) * 127 + 128);
    const b = Math.floor(Math.sin(angle + 4.189) * 127 + 128);
    return [r, g, b];
  },
  grayscale: (t) => {
    const v = Math.floor(t * 255);
    return [v, v, v];
  },
  custom: (t) => {
    // Indigo to pink gradient
    const r = Math.floor(99 + t * 156);
    const g = Math.floor(102 - t * 50 + Math.sin(t * Math.PI) * 50);
    const b = Math.floor(241 - t * 100);
    return [r, g, b];
  },
};

function getColor(iterations, maxIterations, palette) {
  if (iterations >= maxIterations) return [0, 0, 0];
  // Smooth coloring
  const t = (iterations % 256) / 256;
  const fn = palettes[palette] || palettes.classic;
  return fn(t);
}

function computeFractal(data) {
  const {
    width, height, xMin, xMax, yMin, yMax,
    maxIterations, palette, mode, juliaC,
    startRow, endRow, id
  } = data;

  const rowCount = endRow - startRow;
  const pixels = new Uint8ClampedArray(width * rowCount * 4);
  const dx = (xMax - xMin) / width;
  const dy = (yMax - yMin) / height;

  for (let py = startRow; py < endRow; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = xMin + px * dx;
      const y0 = yMin + py * dy;

      let zx, zy, cx, cy;

      if (mode === 'julia') {
        zx = x0;
        zy = y0;
        cx = juliaC[0];
        cy = juliaC[1];
      } else {
        zx = 0;
        zy = 0;
        cx = x0;
        cy = y0;
      }

      let iterations = 0;
      let zx2 = zx * zx;
      let zy2 = zy * zy;

      while (zx2 + zy2 <= 4 && iterations < maxIterations) {
        zy = 2 * zx * zy + cy;
        zx = zx2 - zy2 + cx;
        zx2 = zx * zx;
        zy2 = zy * zy;
        iterations++;
      }

      // Smooth iteration count
      let smoothIter = iterations;
      if (iterations < maxIterations) {
        const log2 = Math.log(2);
        const logZn = Math.log(zx2 + zy2) / 2;
        smoothIter = iterations + 1 - Math.log(logZn / log2) / log2;
      }

      const [r, g, b] = getColor(smoothIter, maxIterations, palette);
      const idx = ((py - startRow) * width + px) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    }
  }

  return { pixels, startRow, endRow, id };
}

self.onmessage = function (e) {
  const result = computeFractal(e.data);
  self.postMessage(result, [result.pixels.buffer]);
};
