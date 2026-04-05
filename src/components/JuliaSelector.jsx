import { useRef, useEffect, useCallback, useState } from 'react';
import { useFractal } from '../context/FractalContext';

export default function JuliaSelector() {
  const { state, dispatch } = useFractal();
  const canvasRef = useRef(null);
  const SIZE = 180;
  const isDragging = useRef(false);

  // Render mini Mandelbrot with Julia point
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);

    const xMin = -2, xMax = 0.8, yMin = -1.2, yMax = 1.2;
    const dx = (xMax - xMin) / w;
    const dy = (yMax - yMin) / h;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const cx = xMin + px * dx;
        const cy = yMin + py * dy;
        let zx = 0, zy = 0, iter = 0;
        while (zx * zx + zy * zy <= 4 && iter < 60) {
          const tmp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = tmp;
          iter++;
        }
        const idx = (py * w + px) * 4;
        if (iter >= 60) {
          imageData.data[idx] = 15;
          imageData.data[idx + 1] = 15;
          imageData.data[idx + 2] = 30;
        } else {
          const t = iter / 60;
          imageData.data[idx] = Math.floor(99 * t);
          imageData.data[idx + 1] = Math.floor(102 * t);
          imageData.data[idx + 2] = Math.floor(100 + 141 * t);
        }
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw Julia c point
    const [cr, ci] = state.juliaC;
    const px = ((cr - xMin) / (xMax - xMin)) * w;
    const py = ((ci - yMin) / (yMax - yMin)) * h;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#818cf8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Crosshair
    ctx.strokeStyle = 'rgba(129,140,248,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(px, 0); ctx.lineTo(px, h);
    ctx.moveTo(0, py); ctx.lineTo(w, py);
    ctx.stroke();
  }, [state.juliaC]);

  const updateJulia = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const xMin = -2, xMax = 0.8, yMin = -1.2, yMax = 1.2;
    const cr = xMin + (px / SIZE) * (xMax - xMin);
    const ci = yMin + (py / SIZE) * (yMax - yMin);
    dispatch({ type: 'SET_JULIA_C', payload: [cr, ci] });
  }, [dispatch]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateJulia(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) updateJulia(e);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (state.mode !== 'julia') return null;

  return (
    <div className="mt-3">
      <label className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(129,140,248,0.7)' }}>
        Julia c-parameter
      </label>
      <div className="mt-1.5 glass-panel p-1.5" style={{ background: 'rgba(10,10,20,0.5)' }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={Math.floor(SIZE * 0.857)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: 'crosshair', borderRadius: '6px', display: 'block', width: '100%' }}
        />
      </div>
      <div className="coord-display mt-1.5 text-center" style={{ fontSize: '10px' }}>
        c = {state.juliaC[0].toFixed(6)} {state.juliaC[1] >= 0 ? '+' : ''} {state.juliaC[1].toFixed(6)}i
      </div>
    </div>
  );
}
