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

function computeFractal(data) {
  const {
    width, height, xMin, xMax, yMin, yMax,
    maxIterations, palette, colorMode, mode, juliaC,
    startRow, endRow, id
  } = data;

  const rowCount = endRow - startRow;
  const pixels = new Uint8ClampedArray(width * rowCount * 4);
  const dx = (xMax - xMin) / width;
  const dy = (yMax - yMin) / height;
  const isOrbitTrap = colorMode && colorMode.startsWith('orbit');
  const trapRadius = 0.5;
  const colorFn = palettes[palette] || palettes.classic;

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

      // Orbit trap tracking
      let minDistCircle = Infinity;
      let minDistCross = Infinity;
      let minDistPoint = Infinity;

      while (zx2 + zy2 <= 4 && iterations < maxIterations) {
        zy = 2 * zx * zy + cy;
        zx = zx2 - zy2 + cx;
        zx2 = zx * zx;
        zy2 = zy * zy;
        iterations++;

        if (isOrbitTrap) {
          const dist = Math.sqrt(zx2 + zy2);
          minDistPoint = Math.min(minDistPoint, dist);
          minDistCircle = Math.min(minDistCircle, Math.abs(dist - trapRadius));
          minDistCross = Math.min(minDistCross, Math.min(Math.abs(zx), Math.abs(zy)));
        }
      }

      let r, g, b, t;
      const idx = ((py - startRow) * width + px) * 4;

      if (isOrbitTrap) {
        // Orbit traps color everything including in-set points
        if (colorMode === 'orbit-circle') {
          t = 1 - Math.min(1, minDistCircle * 4);
        } else if (colorMode === 'orbit-cross') {
          t = 1 - Math.min(1, minDistCross * 4);
        } else {
          t = 1 - Math.min(1, minDistPoint / 2);
        }
        [r, g, b] = colorFn(t);
      } else if (iterations >= maxIterations) {
        r = 0; g = 0; b = 0;
      } else if (colorMode === 'bands') {
        t = (iterations % 32) / 32;
        [r, g, b] = colorFn(t);
      } else {
        // Smooth coloring (default) — continuous iteration count
        const log2 = Math.log(2);
        const logZn = Math.log(zx2 + zy2) / 2;
        const smoothIter = iterations + 1 - Math.log(logZn / log2) / log2;
        t = (smoothIter % 48) / 48;
        [r, g, b] = colorFn(t);
      }

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
