import React, { useState } from 'react';
import { ControlPanel } from './ControlPanel';
import { FaultPanel } from './FaultPanel';
import { LogPanel } from './LogPanel';
import { useGeneratorSimulation } from '../hooks/useGeneratorSimulation';

type Tab = 'controls' | 'scenarios' | 'logs';

export const ControlConsole: React.FC<ReturnType<typeof useGeneratorSimulation>> = (simulation) => {
  const [activeTab, setActiveTab] = useState<Tab>('controls');

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
        activeTab === tabName
          ? 'bg-gray-700 text-cyan-400'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="console-panel flex flex-col h-full">
      <div className="flex-shrink-0 flex space-x-1 border-b-2 border-gray-700">
        <TabButton tabName="controls" label="Main Controls" />
        <TabButton tabName="scenarios" label="Scenario Injection" />
        <TabButton tabName="logs" label="System Log" />
      </div>
      <div className="flex-grow overflow-y-auto pt-2">
        {activeTab === 'controls' && (
          <ControlPanel 
            status={simulation.status}
            settings={simulation.settings}
            onStart={simulation.start}
            onStop={simulation.stop}
            onEmergencyStop={simulation.emergencyStop}
            onSettingChange={simulation.updateSetting}
            isCommsLossActive={simulation.isCommsLossActive}
          />
        )}
        {activeTab === 'scenarios' && (
           <FaultPanel
            status={simulation.status}
            faults={simulation.faults}
            actions={simulation.actions}
          />
        )}
        {activeTab === 'logs' && <LogPanel logs={simulation.logs} />}
      </div>
    </div>
  );
};
