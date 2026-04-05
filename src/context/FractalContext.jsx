import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';

const FractalContext = createContext();

const DEFAULT_VIEW = {
  xMin: -2.5,
  xMax: 1.0,
  yMin: -1.25,
  yMax: 1.25,
};

const initialState = {
  ...DEFAULT_VIEW,
  maxIterations: 200,
  palette: 'classic',
  mode: 'mandelbrot', // 'mandelbrot' | 'julia'
  juliaC: [-0.7, 0.27015],
  bookmarks: JSON.parse(localStorage.getItem('fractal-bookmarks') || '[]'),
  cursorCoords: { re: 0, im: 0 },
  renderProgress: 0,
  isRendering: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, ...action.payload };
    case 'SET_MAX_ITERATIONS':
      return { ...state, maxIterations: action.payload };
    case 'SET_PALETTE':
      return { ...state, palette: action.payload };
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
      return { ...state, xMin: b.xMin, xMax: b.xMax, yMin: b.yMin, yMax: b.yMax, mode: b.mode, juliaC: b.juliaC || state.juliaC };
    }
    case 'RESET_VIEW':
      return { ...state, ...DEFAULT_VIEW };
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
