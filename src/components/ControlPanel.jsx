import { useState, useCallback } from 'react';
import { useFractal } from '../context/FractalContext';
import { motion, AnimatePresence } from 'framer-motion';
import JuliaSelector from './JuliaSelector';

const PALETTES = [
  { id: 'classic', label: 'Classic', colors: ['#001133', '#0066ff', '#000000'] },
  { id: 'fire', label: 'Fire', colors: ['#ff0000', '#ff8800', '#ffcc00'] },
  { id: 'ocean', label: 'Ocean', colors: ['#003366', '#0099cc', '#66ccff'] },
  { id: 'neon', label: 'Neon', colors: ['#ff00ff', '#00ffff', '#ffff00'] },
  { id: 'grayscale', label: 'Gray', colors: ['#333333', '#888888', '#cccccc'] },
  { id: 'custom', label: 'Indigo', colors: ['#6366f1', '#a78bfa', '#ec4899'] },
  { id: 'rainbow', label: 'Rainbow', colors: ['#ff0000', '#00ff00', '#0000ff'] },
  { id: 'psychedelic', label: 'Psyche', colors: ['#ff00ff', '#ff8800', '#00ffff'] },
];

const COLOR_MODES = [
  { id: 'smooth', label: 'Smooth' },
  { id: 'bands', label: 'Bands' },
  { id: 'orbit-circle', label: 'Orbit ◯' },
  { id: 'orbit-cross', label: 'Orbit ✚' },
  { id: 'orbit-point', label: 'Orbit •' },
];

export default function ControlPanel() {
  const { state, dispatch } = useFractal();
  const [coordRe, setCoordRe] = useState('');
  const [coordIm, setCoordIm] = useState('');
  const [showCoordSearch, setShowCoordSearch] = useState(false);

  const handleExportWithMetadata = useCallback(() => {
    const sourceCanvas = document.querySelector('canvas');
    if (!sourceCanvas) return;

    // Create a temporary canvas to draw watermark
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = sourceCanvas.width;
    exportCanvas.height = sourceCanvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Draw fractal
    ctx.drawImage(sourceCanvas, 0, 0);

    // Watermark metadata
    const zoom = (3.5 / (state.xMax - state.xMin)).toFixed(1);
    const centerRe = ((state.xMin + state.xMax) / 2).toFixed(8);
    const centerIm = ((state.yMin + state.yMax) / 2).toFixed(8);
    const lines = [
      `Fractal Lab · ${state.mode === 'julia' ? 'Julia' : 'Mandelbrot'}`,
      `Re: ${centerRe}  Im: ${centerIm}`,
      `Zoom: ${zoom}x · Iter: ${state.maxIterations}`,
    ];
    if (state.mode === 'julia') {
      lines.push(`c = ${state.juliaC[0].toFixed(6)} + ${state.juliaC[1].toFixed(6)}i`);
    }

    const fontSize = Math.max(11, Math.floor(exportCanvas.width / 120));
    const lineHeight = fontSize * 1.5;
    const padding = fontSize;
    const boxHeight = lineHeight * lines.length + padding * 2;
    const boxWidth = Math.min(exportCanvas.width * 0.45, 420);

    // Background box (bottom-left)
    const boxX = padding;
    const boxY = exportCanvas.height - boxHeight - padding;

    ctx.fillStyle = 'rgba(10, 10, 20, 0.75)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200, 210, 254, 0.9)';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? '#818cf8' : 'rgba(200, 210, 254, 0.85)';
      ctx.fillText(line, boxX + padding, boxY + padding + i * lineHeight);
    });

    const link = document.createElement('a');
    link.download = `fractal-${state.mode}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }, [state]);

  const handleBookmark = () => {
    dispatch({
      type: 'ADD_BOOKMARK',
      payload: {
        xMin: state.xMin, xMax: state.xMax,
        yMin: state.yMin, yMax: state.yMax,
        mode: state.mode,
        juliaC: state.juliaC,
        label: `Bookmark ${state.bookmarks.length + 1}`,
        zoom: ((2.5 + 1.0) / (state.xMax - state.xMin)).toFixed(1) + 'x',
      },
    });
  };

  const handleCoordJump = (e) => {
    e.preventDefault();
    const re = parseFloat(coordRe);
    const im = parseFloat(coordIm);
    if (isNaN(re) || isNaN(im)) return;

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
    setShowCoordSearch(false);
  };

  const canGoBack = state.zoomHistoryIndex > 0;
  const canGoForward = state.zoomHistoryIndex < state.zoomHistory.length - 1;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel h-full overflow-y-auto relative"
      style={{ width: '280px', minWidth: '280px', padding: '20px 16px' }}
    >
      <div className="grain-overlay" style={{ borderRadius: '12px' }} />

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-sm font-semibold tracking-wide" style={{ color: '#c7d2fe' }}>
          FRACTAL LAB
        </h1>
        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Mandelbrot & Julia Explorer
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(129,140,248,0.7)' }}>
          Mode
        </label>
        <div className="flex gap-1.5">
          {['mandelbrot', 'julia'].map(m => (
            <button
              key={m}
              onClick={() => dispatch({ type: 'SET_MODE', payload: m })}
              className="btn-glow flex-1 text-[11px] capitalize"
              style={state.mode === m ? {
                background: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
              } : {}}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Julia c-parameter selector */}
      <JuliaSelector />

      {/* Max Iterations */}
      <div className="mb-4 mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(129,140,248,0.7)' }}>
            Max Iterations
          </label>
          <span className="font-mono text-[11px]" style={{ color: '#818cf8' }}>
            {state.maxIterations}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={5000}
          step={10}
          value={state.maxIterations}
          onChange={(e) => dispatch({ type: 'SET_MAX_ITERATIONS', payload: parseInt(e.target.value) })}
        />
      </div>

      {/* Color palette */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'rgba(129,140,248,0.7)' }}>
          Color Mapping
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {PALETTES.map(p => (
            <button
              key={p.id}
              onClick={() => dispatch({ type: 'SET_PALETTE', payload: p.id })}
              className="relative rounded-lg overflow-hidden border transition-all"
              style={{
                height: '32px',
                borderColor: state.palette === p.id ? '#6366f1' : 'rgba(255,255,255,0.06)',
                boxShadow: state.palette === p.id ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${p.colors.join(', ')})`,
                }}
              />
              <span className="relative z-10 text-[9px] font-medium text-white drop-shadow-md">
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Mode */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'rgba(129,140,248,0.7)' }}>
          Color Mode
        </label>
        <div className="flex flex-wrap gap-1">
          {COLOR_MODES.map(cm => (
            <button
              key={cm.id}
              onClick={() => dispatch({ type: 'SET_COLOR_MODE', payload: cm.id })}
              className="btn-glow text-[10px]"
              style={state.colorMode === cm.id ? {
                background: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
              } : { padding: '4px 10px' }}
            >
              {cm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom info */}
      <div className="mb-4 glass-panel p-2.5" style={{ background: 'rgba(10,10,20,0.4)' }}>
        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(129,140,248,0.5)' }}>
          Zoom Level
        </div>
        <div className="font-mono text-[13px]" style={{ color: '#e2e8f0' }}>
          {((3.5) / (state.xMax - state.xMin)).toFixed(1)}x
        </div>
        <div className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {(state.xMax - state.xMin).toExponential(4)} wide
        </div>
      </div>

      {/* Zoom History */}
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(129,140,248,0.7)' }}>
          Zoom History
        </label>
        <div className="flex gap-1.5">
          <button
            onClick={() => dispatch({ type: 'ZOOM_BACK' })}
            disabled={!canGoBack}
            className="btn-glow flex-1 text-[11px]"
            style={!canGoBack ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
          >
            ← Back
          </button>
          <button
            onClick={() => dispatch({ type: 'ZOOM_FORWARD' })}
            disabled={!canGoForward}
            className="btn-glow flex-1 text-[11px]"
            style={!canGoForward ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
          >
            Forward →
          </button>
        </div>
        <div className="text-[9px] mt-1 font-mono text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {state.zoomHistoryIndex + 1} / {state.zoomHistory.length}
        </div>
      </div>

      {/* Coordinate Search */}
      <div className="mb-4">
        <button
          onClick={() => setShowCoordSearch(!showCoordSearch)}
          className="btn-glow w-full text-[11px]"
        >
          🔍 Go to Coordinates
        </button>
        <AnimatePresence>
          {showCoordSearch && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCoordJump}
              className="mt-2 overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(129,140,248,0.7)', minWidth: '20px' }}>Re</span>
                  <input
                    type="text"
                    value={coordRe}
                    onChange={(e) => setCoordRe(e.target.value)}
                    placeholder="-0.75"
                    className="coord-input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(129,140,248,0.7)', minWidth: '20px' }}>Im</span>
                  <input
                    type="text"
                    value={coordIm}
                    onChange={(e) => setCoordIm(e.target.value)}
                    placeholder="0.0"
                    className="coord-input"
                  />
                </div>
                <button type="submit" className="btn-glow accent text-[11px] w-full mt-1">
                  Jump →
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-1.5 mb-4">
        <div className="flex gap-1.5">
          <button onClick={handleBookmark} className="btn-glow flex-1 text-[11px]">
            ★ Bookmark
          </button>
          <button onClick={handleExportWithMetadata} className="btn-glow flex-1 text-[11px]">
            ↓ Export PNG
          </button>
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET_VIEW' })}
          className="btn-glow w-full text-[11px]"
        >
          ↻ Reset View
        </button>
      </div>

      {/* Bookmarks */}
      <AnimatePresence>
        {state.bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(129,140,248,0.7)' }}>
              Bookmarks
            </label>
            <div className="flex flex-col gap-1">
              {state.bookmarks.map((b, i) => (
                <div key={i} className="flex items-center gap-1">
                  <button
                    onClick={() => dispatch({ type: 'LOAD_BOOKMARK', payload: i })}
                    className="btn-glow flex-1 text-[10px] text-left"
                    style={{ padding: '4px 8px' }}
                  >
                    <span>{b.label}</span>
                    <span className="font-mono ml-1" style={{ color: 'rgba(129,140,248,0.5)' }}>
                      {b.zoom}
                    </span>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_BOOKMARK', payload: i })}
                    className="btn-glow text-[10px] px-2"
                    style={{ color: '#f87171' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help */}
      <div className="mt-5 text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <div>Click to zoom in · Right-click to zoom out</div>
        <div>Scroll wheel to zoom · Drag to pan</div>
        <div>← → buttons to navigate zoom history</div>
      </div>
    </motion.div>
  );
}
