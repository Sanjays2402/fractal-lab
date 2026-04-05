import { useFractal } from '../context/FractalContext';

export default function CoordinateDisplay() {
  const { state } = useFractal();
  const { re, im } = state.cursorCoords;

  return (
    <div className="absolute top-3 left-3 glass-panel px-3 py-2 z-10">
      <div className="coord-display">
        <span style={{ color: 'rgba(129,140,248,0.7)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Coordinates
        </span>
        <div className="mt-1">
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Re</span>{' '}
          <span>{re >= 0 ? '+' : ''}{re.toFixed(12)}</span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Im</span>{' '}
          <span>{im >= 0 ? '+' : ''}{im.toFixed(12)}</span>
        </div>
      </div>
    </div>
  );
}
