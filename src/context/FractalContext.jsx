import { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const FractalContext = createContext();

const DEFAULT_VIEW = {
  xMin: -2.5, xMax: 1.0, yMin: -1.25, yMax: 1.25,
};

const MAX_HISTORY = 20;

// ── ITER 8: curated tour presets (deep-zoom coordinates + settings)
export const TOUR_PRESETS = [
  { name: 'Classic Mandelbrot', mode: 'mandelbrot', palette: 'classic', xMin: -2.5, xMax: 1, yMin: -1.25, yMax: 1.25, iter: 200 },
  { name: 'Seahorse Valley', mode: 'mandelbrot', palette: 'ocean', xMin: -0.7505, xMax: -0.7395, yMin: 0.0895, yMax: 0.1005, iter: 500 },
  { name: 'Elephant Valley', mode: 'mandelbrot', palette: 'fire', xMin: 0.2395, xMax: 0.2605, yMin: -0.005, yMax: 0.015, iter: 400 },
  { name: 'Mini Mandelbrot', mode: 'mandelbrot', palette: 'nebula', xMin: -1.764, xMax: -1.742, yMin: -0.012, yMax: 0.012, iter: 600 },
  { name: 'Spiral Deep', mode: 'mandelbrot', palette: 'psychedelic', xMin: -0.748, xMax: -0.746, yMin: 0.094, yMax: 0.096, iter: 800 },
  { name: 'Julia Swirl',  mode: 'julia', palette: 'aurora', juliaC: [-0.7, 0.27015], xMin: -1.5, xMax: 1.5, yMin: -1.2, yMax: 1.2, iter: 300 },
  { name: 'Julia Dragon', mode: 'julia', palette: 'lava',   juliaC: [-0.8, 0.156], xMin: -1.5, xMax: 1.5, yMin: -1.2, yMax: 1.2, iter: 300 },
  { name: 'Julia Dendrite', mode: 'julia', palette: 'matrix', juliaC: [0, 1], xMin: -1.5, xMax: 1.5, yMin: -1.2, yMax: 1.2, iter: 400 },
  { name: 'Burning Ship',  mode: 'burning-ship', palette: 'fire', xMin: -2, xMax: 1.5, yMin: -2, yMax: 1, iter: 400 },
  { name: 'Tricorn',       mode: 'tricorn', palette: 'ice',  xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5, iter: 300 },
  { name: 'Phoenix Wings', mode: 'phoenix', palette: 'sunset', juliaC: [0.56667, -0.5], xMin: -1.5, xMax: 1.5, yMin: -1.2, yMax: 1.2, iter: 400 },
];

// ── ITER 9: URL hash encoding for shareable views
function encodeStateToHash(state) {
  const payload = {
    m: state.mode,
    p: state.palette,
    c: state.colorMode,
    i: state.maxIterations,
    v: [state.xMin, state.xMax, state.yMin, state.yMax],
    j: state.juliaC,
    iv: state.invertPalette ? 1 : 0,
    s: state.paletteShift || 0,
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}
function decodeStateFromHash(hash) {
  try {
    const p = JSON.parse(decodeURIComponent(atob(hash.replace(/^#?v=/, ''))));
    return {
      mode: p.m, palette: p.p, colorMode: p.c, maxIterations: p.i,
      xMin: p.v[0], xMax: p.v[1], yMin: p.v[2], yMax: p.v[3],
      juliaC: p.j, invertPalette: !!p.iv, paletteShift: p.s || 0,
    };
  } catch { return null; }
}

const urlState = (typeof window !== 'undefined' && window.location.hash.startsWith('#v='))
  ? decodeStateFromHash(window.location.hash) : null;

const initialState = {
  ...DEFAULT_VIEW,
  maxIterations: 200,
  palette: 'classic',
  colorMode: 'smooth',
  mode: 'mandelbrot',
  juliaC: [-0.7, 0.27015],
  bookmarks: JSON.parse(localStorage.getItem('fractal-bookmarks') || '[]'),
  cursorCoords: { re: 0, im: 0 },
  renderProgress: 0,
  isRendering: false,
  zoomHistory: [],
  zoomHistoryIndex: -1,
  // ── ITER 10: new state for palette manipulation
  invertPalette: false,
  paletteShift: 0,
  // ── ITER 11: anti-aliasing toggle
  antialiasing: false,
  ...(urlState || {}),
};

function pushToHistory(state, view) {
  // Trim future entries if we went back then navigated elsewhere
  const history = state.zoomHistory.slice(0, state.zoomHistoryIndex + 1);
  const entry = { xMin: view.xMin, xMax: view.xMax, yMin: view.yMin, yMax: view.yMax };
  history.push(entry);
  // Cap at MAX_HISTORY
  if (history.length > MAX_HISTORY) history.shift();
  return { zoomHistory: history, zoomHistoryIndex: history.length - 1 };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW': {
      const newView = { ...state, ...action.payload };
      const historyUpdate = pushToHistory(state, newView);
      return { ...newView, ...historyUpdate };
    }
    case 'SET_MAX_ITERATIONS':
      return { ...state, maxIterations: action.payload };
    case 'SET_PALETTE':
      return { ...state, palette: action.payload };
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_JULIA_C':
      return { ...state, juliaC: action.payload };
    case 'SET_CURSOR_COORDS':
      return { ...state, cursorCoords: action.payload };
    case 'SET_RENDER_PROGRESS':
      return { ...state, renderProgress: action.payload };
    case 'SET_IS_RENDERING':
      return { ...state, isRendering: action.payload };
    case 'ADD_BOOKMARK': {
      const bm = [...state.bookmarks, action.payload];
      localStorage.setItem('fractal-bookmarks', JSON.stringify(bm));
      return { ...state, bookmarks: bm };
    }
    case 'REMOVE_BOOKMARK': {
      const bm = state.bookmarks.filter((_, i) => i !== action.payload);
      localStorage.setItem('fractal-bookmarks', JSON.stringify(bm));
      return { ...state, bookmarks: bm };
    }
    case 'LOAD_BOOKMARK': {
      const b = state.bookmarks[action.payload];
      const newState = { ...state, xMin: b.xMin, xMax: b.xMax, yMin: b.yMin, yMax: b.yMax, mode: b.mode, juliaC: b.juliaC || state.juliaC };
      const historyUpdate = pushToHistory(state, newState);
      return { ...newState, ...historyUpdate };
    }
    case 'ZOOM_BACK': {
      if (state.zoomHistoryIndex <= 0) return state;
      const idx = state.zoomHistoryIndex - 1;
      const entry = state.zoomHistory[idx];
      return { ...state, ...entry, zoomHistoryIndex: idx };
    }
    case 'ZOOM_FORWARD': {
      if (state.zoomHistoryIndex >= state.zoomHistory.length - 1) return state;
      const idx = state.zoomHistoryIndex + 1;
      const entry = state.zoomHistory[idx];
      return { ...state, ...entry, zoomHistoryIndex: idx };
    }
    case 'RESET_VIEW': {
      const historyUpdate = pushToHistory(state, DEFAULT_VIEW);
      return { ...state, ...DEFAULT_VIEW, ...historyUpdate };
    }
    // ── New reducer cases (ITERs 10-12)
    case 'SET_INVERT_PALETTE':
      return { ...state, invertPalette: action.payload };
    case 'SET_PALETTE_SHIFT':
      return { ...state, paletteShift: action.payload };
    case 'SET_ANTIALIASING':
      return { ...state, antialiasing: action.payload };
    case 'LOAD_TOUR_PRESET': {
      const p = action.payload;
      const newState = {
        ...state,
        mode: p.mode, palette: p.palette,
        xMin: p.xMin, xMax: p.xMax, yMin: p.yMin, yMax: p.yMax,
        maxIterations: p.iter,
        juliaC: p.juliaC || state.juliaC,
      };
      const historyUpdate = pushToHistory(state, newState);
      return { ...newState, ...historyUpdate };
    }
    default:
      return state;
  }
}

// URL sync helpers (exposed to App for sharing)

export function FractalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const workersRef = useRef([]);

  // ── ITER 12: keep URL hash in sync with view (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const encoded = encodeStateToHash(state);
        history.replaceState(null, '', `#v=${encoded}`);
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [state.mode, state.palette, state.colorMode, state.maxIterations,
      state.xMin, state.xMax, state.yMin, state.yMax,
      state.juliaC, state.invertPalette, state.paletteShift]);

  const getShareURL = () => {
    return `${location.origin}${location.pathname}#v=${encodeStateToHash(state)}`;
  };

  return (
    <FractalContext.Provider value={{ state, dispatch, workersRef, getShareURL }}>
      {children}
    </FractalContext.Provider>
  );
}

export function useFractal() {
  return useContext(FractalContext);
}

export { DEFAULT_VIEW };
