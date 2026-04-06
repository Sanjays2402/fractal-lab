import { createContext, useContext, useReducer, useRef, useCallback } from 'react';

const FractalContext = createContext();

const DEFAULT_VIEW = {
  xMin: -2.5,
  xMax: 1.0,
  yMin: -1.25,
  yMax: 1.25,
};

const MAX_HISTORY = 20;

const initialState = {
  ...DEFAULT_VIEW,
  maxIterations: 200,
  palette: 'classic',
  colorMode: 'smooth', // 'smooth' | 'bands' | 'orbit-circle' | 'orbit-cross' | 'orbit-point'
  mode: 'mandelbrot', // 'mandelbrot' | 'julia'
  juliaC: [-0.7, 0.27015],
  bookmarks: JSON.parse(localStorage.getItem('fractal-bookmarks') || '[]'),
  cursorCoords: { re: 0, im: 0 },
  renderProgress: 0,
  isRendering: false,
  // Zoom history
  zoomHistory: [],
  zoomHistoryIndex: -1,
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
    default:
      return state;
  }
}

export function FractalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const workersRef = useRef([]);

  return (
    <FractalContext.Provider value={{ state, dispatch, workersRef }}>
      {children}
    </FractalContext.Provider>
  );
}

export function useFractal() {
  return useContext(FractalContext);
}

export { DEFAULT_VIEW };
