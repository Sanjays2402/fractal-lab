import { useRef, useEffect, useCallback, useState } from 'react';
import { useFractal } from '../context/FractalContext';
import FractalWorker from '../workers/fractalWorker.js?worker';

const WORKER_COUNT = navigator.hardwareConcurrency || 4;

export default function FractalCanvas() {
  const { state, dispatch } = useFractal();
  const canvasRef = useRef(null);
  const workersRef = useRef([]);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragViewStart = useRef({ xMin: 0, xMax: 0, yMin: 0, yMax: 0 });
  const animFrameRef = useRef(null);
  const completedChunks = useRef(0);
  const totalChunks = useRef(0);
  const renderIdRef = useRef(0);

  // Initialize workers
  useEffect(() => {
    workersRef.current = Array.from({ length: WORKER_COUNT }, () => new FractalWorker());
    return () => workersRef.current.forEach(w => w.terminate());
  }, []);

  // Render fractal
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const { xMin, xMax, yMin, yMax, maxIterations, palette, colorMode, mode, juliaC, invertPalette, paletteShift } = state;

    renderIdRef.current++;
    const currentRenderId = renderIdRef.current;

    dispatch({ type: 'SET_IS_RENDERING', payload: true });
    dispatch({ type: 'SET_RENDER_PROGRESS', payload: 0 });

    const rowsPerChunk = Math.ceil(height / WORKER_COUNT);
    completedChunks.current = 0;
    totalChunks.current = WORKER_COUNT;

    workersRef.current.forEach((worker, i) => {
      const startRow = i * rowsPerChunk;
      const endRow = Math.min(startRow + rowsPerChunk, height);
      if (startRow >= height) return;

      worker.onmessage = (e) => {
        if (e.data.id !== currentRenderId) return;
        const { pixels, startRow: sr, endRow: er } = e.data;
        const imageData = new ImageData(pixels, width, er - sr);
        ctx.putImageData(imageData, 0, sr);

        completedChunks.current++;
        const progress = (completedChunks.current / totalChunks.current) * 100;
        dispatch({ type: 'SET_RENDER_PROGRESS', payload: progress });

        if (completedChunks.current >= totalChunks.current) {
          dispatch({ type: 'SET_IS_RENDERING', payload: false });
        }
      };

      worker.postMessage({
        width, height, xMin, xMax, yMin, yMax,
        maxIterations, palette, colorMode, mode, juliaC,
        invertPalette, paletteShift,
        startRow, endRow, id: currentRenderId,
      });
    });
  }, [state.xMin, state.xMax, state.yMin, state.yMax, state.maxIterations, state.palette, state.colorMode, state.mode, state.juliaC, state.invertPalette, state.paletteShift, dispatch]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      render();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [render]);

  // Re-render on state changes
  useEffect(() => {
    render();
  }, [render]);

  // Mouse coordinates to fractal coordinates
  const screenToFractal = useCallback((px, py) => {
    const canvas = canvasRef.current;
    if (!canvas) return { re: 0, im: 0 };
    const { xMin, xMax, yMin, yMax } = state;
    const re = xMin + (px / canvas.width) * (xMax - xMin);
    const im = yMin + (py / canvas.height) * (yMax - yMin);
    return { re, im };
  }, [state.xMin, state.xMax, state.yMin, state.yMax]);

  // Mouse move - update coordinates
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const coords = screenToFractal(px, py);
    dispatch({ type: 'SET_CURSOR_COORDS', payload: coords });

    if (isDragging.current) {
      const dx = (e.clientX - dragStart.current.x) / canvas.width * (dragViewStart.current.xMax - dragViewStart.current.xMin);
      const dy = (e.clientY - dragStart.current.y) / canvas.height * (dragViewStart.current.yMax - dragViewStart.current.yMin);
      dispatch({
        type: 'SET_VIEW',
        payload: {
          xMin: dragViewStart.current.xMin - dx,
          xMax: dragViewStart.current.xMax - dx,
          yMin: dragViewStart.current.yMin - dy,
          yMax: dragViewStart.current.yMax - dy,
        },
      });
    }
  }, [screenToFractal, dispatch]);

  // Mouse down - start drag
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragViewStart.current = {
        xMin: state.xMin, xMax: state.xMax,
        yMin: state.yMin, yMax: state.yMax,
      };
      e.preventDefault();
    }
  }, [state.xMin, state.xMax, state.yMin, state.yMax]);

  // Mouse up - end drag or zoom
  const handleMouseUp = useCallback((e) => {
    if (isDragging.current) {
      const movedX = Math.abs(e.clientX - dragStart.current.x);
      const movedY = Math.abs(e.clientY - dragStart.current.y);
      isDragging.current = false;

      // If barely moved, treat as click-to-zoom
      if (movedX < 4 && movedY < 4) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const { re, im } = screenToFractal(px, py);
        const factor = 0.5; // zoom in
        const w = (state.xMax - state.xMin) * factor;
        const h = (state.yMax - state.yMin) * factor;
        dispatch({
          type: 'SET_VIEW',
          payload: {
            xMin: re - w / 2,
            xMax: re + w / 2,
            yMin: im - h / 2,
            yMax: im + h / 2,
          },
        });
      }
    }
  }, [state.xMin, state.xMax, state.yMin, state.yMax, screenToFractal, dispatch]);

  // Right click - zoom out
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { re, im } = screenToFractal(px, py);
    const factor = 2;
    const w = (state.xMax - state.xMin) * factor;
    const h = (state.yMax - state.yMin) * factor;
    dispatch({
      type: 'SET_VIEW',
      payload: {
        xMin: re - w / 2,
        xMax: re + w / 2,
        yMin: im - h / 2,
        yMax: im + h / 2,
      },
    });
  }, [state.xMin, state.xMax, state.yMin, state.yMax, screenToFractal, dispatch]);

  // Scroll wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { re, im } = screenToFractal(px, py);
    const factor = e.deltaY > 0 ? 1.3 : 0.7;
    const w = (state.xMax - state.xMin) * factor;
    const h = (state.yMax - state.yMin) * factor;
    dispatch({
      type: 'SET_VIEW',
      payload: {
        xMin: re - w / 2,
        xMax: re + w / 2,
        yMin: im - h / 2,
        yMax: im + h / 2,
      },
    });
  }, [state.xMin, state.xMax, state.yMin, state.yMax, screenToFractal, dispatch]);

  return (
    <div className="relative w-full h-full" style={{ cursor: isDragging.current ? 'grabbing' : 'crosshair' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { isDragging.current = false; }}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {/* Progress bar */}
      {state.isRendering && (
        <div className="absolute top-0 left-0 right-0 h-[2px]">
          <div
            className="progress-bar"
            style={{ width: `${state.renderProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
