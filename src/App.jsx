import { FractalProvider } from './context/FractalContext';
import FractalCanvas from './components/FractalCanvas';
import ControlPanel from './components/ControlPanel';
import CoordinateDisplay from './components/CoordinateDisplay';
import Minimap from './components/Minimap';

export default function App() {
  return (
    <FractalProvider>
      <div className="flex h-screen w-screen" style={{ background: '#0a0a0a' }}>
        {/* Main canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <FractalCanvas />
          <CoordinateDisplay />
          <Minimap />
        </div>

        {/* Right control panel */}
        <ControlPanel />
      </div>
    </FractalProvider>
  );
}
