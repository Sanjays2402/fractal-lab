// ── ITER 1: expanded palette set
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
    const r = Math.floor(99 + t * 156);
    const g = Math.floor(102 - t * 50 + Math.sin(t * Math.PI) * 50);
    const b = Math.floor(241 - t * 100);
    return [r, g, b];
  },
  rainbow: (t) => {
    const angle = t * Math.PI * 6;
    const r = Math.floor(Math.sin(angle) * 127 + 128);
    const g = Math.floor(Math.sin(angle + 2.094) * 127 + 128);
    const b = Math.floor(Math.sin(angle + 4.189) * 127 + 128);
    return [r, g, b];
  },
  psychedelic: (t) => {
    const r = Math.floor(Math.sin(t * 15) * 127 + 128);
    const g = Math.floor(Math.sin(t * 13 + 2) * 127 + 128);
    const b = Math.floor(Math.sin(t * 11 + 4) * 127 + 128);
    return [r, g, b];
  },
  // ── ITER 2: new palettes
  lava: (t) => [
    Math.floor(Math.min(255, 80 + t * 175 + Math.sin(t * 8) * 30)),
    Math.floor(Math.max(0, t * t * 100)),
    Math.floor(Math.max(0, t * 30)),
  ],
  aurora: (t) => {
    const g = Math.floor(100 + Math.sin(t * 3.14) * 155);
    const b = Math.floor(150 + Math.sin(t * 6.28) * 105);
    const r = Math.floor(30 + t * 60);
    return [r, g, b];
  },
  nebula: (t) => {
    const r = Math.floor(20 + Math.pow(t, 0.5) * 200);
    const g = Math.floor(10 + Math.pow(t, 2) * 80);
    const b = Math.floor(40 + Math.pow(t, 0.3) * 215);
    return [r, g, b];
  },
  matrix: (t) => [
    Math.floor(t * t * 40),
    Math.floor(50 + t * 205),
    Math.floor(t * 60),
  ],
  ice: (t) => [
    Math.floor(180 + t * 75),
    Math.floor(220 + t * 35),
    Math.floor(255 - t * 40 * (1 - t)),
  ],
  sunset: (t) => [
    Math.floor(255 * Math.pow(t, 0.7)),
    Math.floor(120 * Math.pow(t, 1.2) + 30),
    Math.floor(80 + Math.sin(t * 3.14) * 100),
  ],
};

function computeFractal(data) {
  const {
    width, height, xMin, xMax, yMin, yMax,
    maxIterations, palette, colorMode, mode, juliaC,
    startRow, endRow, id,
    invertPalette = false,
    paletteShift = 0,
  } = data;

  const rowCount = endRow - startRow;
  const pixels = new Uint8ClampedArray(width * rowCount * 4);
  const dx = (xMax - xMin) / width;
  const dy = (yMax - yMin) / height;
  const isOrbitTrap = colorMode && colorMode.startsWith('orbit');
  const trapRadius = 0.5;
  const rawColorFn = palettes[palette] || palettes.classic;
  // ── ITER 3: palette shift + invert
  const colorFn = (t) => {
    let tt = (t + paletteShift) % 1;
    if (tt < 0) tt += 1;
    if (invertPalette) tt = 1 - tt;
    return rawColorFn(tt);
  };

  for (let py = startRow; py < endRow; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = xMin + px * dx;
      const y0 = yMin + py * dy;

      let zx, zy, cx, cy;
      let prevZx = 0, prevZy = 0; // for Phoenix

      if (mode === 'julia') {
        zx = x0; zy = y0;
        cx = juliaC[0]; cy = juliaC[1];
      } else if (mode === 'burning-ship' || mode === 'tricorn' || mode === 'phoenix') {
        zx = 0; zy = 0;
        cx = x0; cy = y0;
      } else {
        zx = 0; zy = 0;
        cx = x0; cy = y0;
      }

      let iterations = 0;
      let zx2 = zx * zx;
      let zy2 = zy * zy;

      let minDistCircle = Infinity;
      let minDistCross = Infinity;
      let minDistPoint = Infinity;

      // ── ITER 4: Burning Ship fractal (|Re|+i|Im|)² + c
      // ── ITER 5: Tricorn (Mandelbar) — z̄² + c (conjugate)
      // ── ITER 6: Phoenix fractal — zₙ₊₁ = zₙ² + c + p·zₙ₋₁
      if (mode === 'burning-ship') {
        while (zx2 + zy2 <= 4 && iterations < maxIterations) {
          const nzx = zx2 - zy2 + cx;
          const nzy = 2 * Math.abs(zx * zy) + cy;
          zx = nzx; zy = nzy;
          zx2 = zx * zx; zy2 = zy * zy;
          iterations++;
          if (isOrbitTrap) {
            const d = Math.sqrt(zx2 + zy2);
            minDistPoint = Math.min(minDistPoint, d);
            minDistCircle = Math.min(minDistCircle, Math.abs(d - trapRadius));
            minDistCross = Math.min(minDistCross, Math.min(Math.abs(zx), Math.abs(zy)));
          }
        }
      } else if (mode === 'tricorn') {
        while (zx2 + zy2 <= 4 && iterations < maxIterations) {
          const nzx = zx2 - zy2 + cx;
          const nzy = -2 * zx * zy + cy; // conjugate
          zx = nzx; zy = nzy;
          zx2 = zx * zx; zy2 = zy * zy;
          iterations++;
          if (isOrbitTrap) {
            const d = Math.sqrt(zx2 + zy2);
            minDistPoint = Math.min(minDistPoint, d);
            minDistCircle = Math.min(minDistCircle, Math.abs(d - trapRadius));
            minDistCross = Math.min(minDistCross, Math.min(Math.abs(zx), Math.abs(zy)));
          }
        }
      } else if (mode === 'phoenix') {
        // Phoenix uses Julia-like c with a fixed secondary param
        cx = juliaC[0]; cy = juliaC[1];
        zx = x0; zy = y0;
        const pRe = 0.5, pIm = 0;
        while (zx2 + zy2 <= 4 && iterations < maxIterations) {
          const nzx = zx2 - zy2 + cx + pRe * prevZx - pIm * prevZy;
          const nzy = 2 * zx * zy + cy + pRe * prevZy + pIm * prevZx;
          prevZx = zx; prevZy = zy;
          zx = nzx; zy = nzy;
          zx2 = zx * zx; zy2 = zy * zy;
          iterations++;
          if (isOrbitTrap) {
            const d = Math.sqrt(zx2 + zy2);
            minDistPoint = Math.min(minDistPoint, d);
            minDistCircle = Math.min(minDistCircle, Math.abs(d - trapRadius));
            minDistCross = Math.min(minDistCross, Math.min(Math.abs(zx), Math.abs(zy)));
          }
        }
      } else {
        // Mandelbrot or Julia
        while (zx2 + zy2 <= 4 && iterations < maxIterations) {
          zy = 2 * zx * zy + cy;
          zx = zx2 - zy2 + cx;
          zx2 = zx * zx; zy2 = zy * zy;
          iterations++;
          if (isOrbitTrap) {
            const d = Math.sqrt(zx2 + zy2);
            minDistPoint = Math.min(minDistPoint, d);
            minDistCircle = Math.min(minDistCircle, Math.abs(d - trapRadius));
            minDistCross = Math.min(minDistCross, Math.min(Math.abs(zx), Math.abs(zy)));
          }
        }
      }

      let r, g, b, t;
      const idx = ((py - startRow) * width + px) * 4;

      if (isOrbitTrap) {
        if (colorMode === 'orbit-circle') t = 1 - Math.min(1, minDistCircle * 4);
        else if (colorMode === 'orbit-cross') t = 1 - Math.min(1, minDistCross * 4);
        else t = 1 - Math.min(1, minDistPoint / 2);
        [r, g, b] = colorFn(t);
      } else if (iterations >= maxIterations) {
        r = 0; g = 0; b = 0;
      } else if (colorMode === 'bands') {
        t = (iterations % 32) / 32;
        [r, g, b] = colorFn(t);
      } else if (colorMode === 'histogram') {
        // ── ITER 7: normalized iteration for histogram-style coloring
        t = iterations / maxIterations;
        [r, g, b] = colorFn(t);
      } else {
        // Smooth coloring
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
