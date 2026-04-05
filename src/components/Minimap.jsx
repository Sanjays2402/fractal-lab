import { useRef, useEffect, useCallback } from 'react';
import { useFractal, DEFAULT_VIEW } from '../context/FractalContext';

export default function Minimap() {
  const { state, dispatch } = useFractal();
  const canvasRef = useRef(null);
  const SIZE = 140;

  // Draw a tiny Mandelbrot overview + viewport rectangle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Simple low-res Mandelbrot render for minimap
    const imageData = ctx.createImageData(w, h);
    const dv = DEFAULT_VIEW;
    const dx = (dv.xMax - dv.xMin) / w;
    const dy = (dv.yMax - dv.yMin) / h;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const cx = dv.xMin + px * dx;
        const cy = dv.yMin + py * dy;
        let zx = 0, zy = 0;
        let iter = 0;
        while (zx * zx + zy * zy <= 4 && iter < 50) {
          const tmp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = tmp;
          iter++;
        }
        const idx = (py * w + px) * 4;
        if (iter >= 50) {
          imageData.data[idx] = 10;
          imageData.data[idx + 1] = 10;
          imageData.data[idx + 2] = 20;
        } else {
          const t = iter / 50;
          imageData.data[idx] = Math.floor(t * 60);
          imageData.data[idx + 1] = Math.floor(t * 50);
          imageData.data[idx + 2] = Math.floor(80 + t * 100);
        }
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw viewport rectangle
    const vxMin = (state.xMin - dv.xMin) / (dv.xMax - dv.xMin) * w;
    const vxMax = (state.xMax - dv.xMin) / (dv.xMax - dv.xMin) * w;
    const vyMin = (state.yMin - dv.yMin) / (dv.yMax - dv.yMin) * h;
    const vyMax = (state.yMax - dv.yMin) / (dv.yMax - dv.yMin) * h;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vxMin, vyMin, vxMax - vxMin, vyMax - vyMin);
  }, [state.xMin, state.xMax, state.yMin, state.yMax]);

  // Click minimap to navigate
  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dv = DEFAULT_VIEW;
    const re = dv.xMin + (px / SIZE) * (dv.xMax - dv.xMin);
    const im = dv.yMin + (py / SIZE) * (dv.yMax - dv.yMin);
    const w = state.xMax - state.xMin;
    const h = state.yMax - state.yMin;
    dispatch({
      type: 'SET_VIEW',
      payload: {
        xMin: re - w / 2,
        xMax: re + w / 2,
        yMin: im - h / 2,
        yMax: im + h / 2,
      },
    });
  }, [state.xMax, state.xMin, state.yMax, state.yMin, dispatch]);

  return (
    <div className="absolute bottom-3 left-3 glass-panel p-1.5 z-10" style={{ lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={Math.floor(SIZE * 0.714)}
        onClick={handleClick}
        style={{ cursor: 'pointer', borderRadius: '6px', display: 'block' }}
      />
    </div>
  );
}
