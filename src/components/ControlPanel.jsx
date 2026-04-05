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
];

export default function ControlPanel() {
  const { state, dispatch } = useFractal();

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `fractal-${state.mode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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
          max={2000}
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

      {/* Action buttons */}
      <div className="flex flex-col gap-1.5 mb-4">
        <div className="flex gap-1.5">
          <button onClick={handleBookmark} className="btn-glow flex-1 text-[11px]">
            ★ Bookmark
          </button>
          <button onClick={handleExport} className="btn-glow flex-1 text-[11px]">
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
      </div>
    </motion.div>
  );
}
