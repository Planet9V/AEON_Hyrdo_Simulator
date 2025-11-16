
import React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { GeneratorVisual } from './components/GeneratorVisual';
import { MetricsDisplay } from './components/MetricsDisplay';
import { LogPanel } from './components/LogPanel';
import { useGeneratorSimulation } from './hooks/useGeneratorSimulation';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';

const App: React.FC = () => {
  const {
    status,
    metrics,
    logs,
    settings,
    start,
    stop,
    emergencyStop,
    updateSetting,
    acknowledgeAlert
  } = useGeneratorSimulation();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono flex flex-col p-4 sm:p-6 lg:p-8 space-y-4">
      <Header status={status} />
      <AlertBanner status={status} onAcknowledge={acknowledgeAlert} />
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-3 xl:col-span-2 bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700">
          <ControlPanel 
            status={status}
            settings={settings}
            onStart={start}
            onStop={stop}
            onEmergencyStop={emergencyStop}
            onSettingChange={updateSetting}
          />
        </div>
        
        <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1 bg-gray-800/50 p-4 rounded-lg shadow-lg flex items-center justify-center border border-gray-700">
            <GeneratorVisual status={status} speed={metrics.speed} />
          </div>
          <div className="xl:col-span-2 bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700">
            <MetricsDisplay metrics={metrics} />
          </div>
        </div>
      </main>

      <footer className="h-48">
        <LogPanel logs={logs} />
      </footer>
    </div>
  );
};

export default App;
