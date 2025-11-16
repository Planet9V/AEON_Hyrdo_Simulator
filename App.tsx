import React from 'react';
import { useGeneratorSimulation } from './hooks/useGeneratorSimulation';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { SystemCanvas } from './components/SystemCanvas';
import { ControlConsole } from './components/ControlConsole';

const App: React.FC = () => {
  const simulation = useGeneratorSimulation();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono flex flex-col p-4 space-y-4 h-screen">
      <Header status={simulation.status} />
      <AlertBanner status={simulation.status} onAcknowledge={simulation.acknowledgeAlert} />
      
      <main className="flex-grow flex flex-col gap-4 overflow-hidden">
        {/* Top Part: System Visualization */}
        <div className="flex-grow bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 relative">
          <SystemCanvas
            status={simulation.status}
            metrics={simulation.metrics}
            settings={simulation.settings}
          />
        </div>
        
        {/* Bottom Part: Control Console */}
        <div className="flex-shrink-0 h-[45%]">
           <ControlConsole {...simulation} />
        </div>
      </main>
    </div>
  );
};

export default App;