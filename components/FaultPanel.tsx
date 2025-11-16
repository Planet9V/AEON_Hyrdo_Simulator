import React from 'react';
import { GeneratorStatus } from '../types';
import { AlertTriangleIcon, RefreshCwIcon, WifiOffIcon, WindIcon } from './icons';

interface FaultPanelProps {
  status: GeneratorStatus;
  faults: {
    isGridFaultActive: boolean;
    isTrashRackClogged: boolean;
  };
  actions: {
    triggerGridFault: () => void;
    toggleTrashRackClogging: () => void;
    toggleCommsLoss: () => void;
    resetFaults: () => void;
  };
}

export const FaultPanel: React.FC<FaultPanelProps> = ({ status, faults, actions }) => {
  const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
  const isCommsLoss = status === GeneratorStatus.COMMS_LOSS;

  return (
    <div className="flex flex-col h-full space-y-4">
      <h3 className="text-lg font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2">Scenario Injection</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow items-center">
        <button
          onClick={actions.triggerGridFault}
          disabled={!isRunning}
          className="flex flex-col items-center justify-center space-y-1 h-24 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <AlertTriangleIcon className="w-8 h-8" />
          <span className="text-center text-sm">Major Grid Fault</span>
        </button>
        <button
          onClick={actions.toggleTrashRackClogging}
          disabled={!isRunning}
          className={`flex flex-col items-center justify-center space-y-1 h-24 px-4 py-2 text-white font-semibold rounded-md transition-colors ${
            faults.isTrashRackClogged
              ? 'bg-orange-700 hover:bg-orange-600'
              : 'bg-orange-600 hover:bg-orange-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
        >
          <WindIcon className="w-8 h-8" />
          <span className="text-center text-sm">
            {faults.isTrashRackClogged ? 'Clear Trash Rack' : 'Clog Trash Rack'}
          </span>
        </button>
        <button
          onClick={actions.toggleCommsLoss}
          disabled={!isRunning && !isCommsLoss}
          className={`flex flex-col items-center justify-center space-y-1 h-24 px-4 py-2 text-white font-semibold rounded-md transition-colors ${
            isCommsLoss
              ? 'bg-indigo-700 hover:bg-indigo-600'
              : 'bg-indigo-600 hover:bg-indigo-500'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
        >
          <WifiOffIcon className="w-8 h-8" />
          <span className="text-center text-sm">
            {isCommsLoss ? 'Restore SCADA' : 'Cut SCADA Comms'}
          </span>
        </button>
         <button
          onClick={actions.resetFaults}
          disabled={faults.isGridFaultActive || faults.isTrashRackClogged || isCommsLoss}
          className="flex flex-col items-center justify-center space-y-1 h-24 px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCwIcon className="w-8 h-8" />
          <span className="text-center text-sm">Reset Scenarios</span>
        </button>
      </div>
    </div>
  );
};
