import React from 'react';
import { GeneratorStatus, GeneratorSettings } from '../types';
import { GENERATOR_PARAMS } from '../constants';
import { PlayIcon, StopIcon, AlertTriangleIcon } from './icons';
import { Dial } from './Dial';

interface ControlPanelProps {
  status: GeneratorStatus;
  settings: GeneratorSettings;
  onStart: () => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  onSettingChange: (key: keyof GeneratorSettings, value: number) => void;
  isCommsLossActive: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  settings,
  onStart,
  onStop,
  onEmergencyStop,
  onSettingChange,
  isCommsLossActive
}) => {
  const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
  const isStoppable = isRunning || status === GeneratorStatus.COMMS_LOSS;
  const isStopped = status === GeneratorStatus.STOPPED;
  const isEmergencyStoppable = status !== GeneratorStatus.STOPPED && status !== GeneratorStatus.EMERGENCY_STOP;
  const areDialsDisabled = isCommsLossActive || !isRunning;

  return (
    <div className="flex h-full p-4 space-x-6">
      {/* Left Panel: Operations */}
      <div className="flex flex-col w-1/3 items-center justify-around py-4 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold uppercase text-gray-400 tracking-wider absolute top-8">System Operations</h3>
        
        <div className="flex flex-col space-y-6">
          <button
            onClick={onStart}
            disabled={!isStopped || isCommsLossActive}
            className="w-48 h-20 font-bold uppercase rounded-md shadow-lg border-b-4 border-green-800 bg-green-600 text-white flex items-center justify-center space-x-3 transition-all duration-150 hover:bg-green-500 disabled:bg-gray-700 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
          >
            <PlayIcon className="w-8 h-8" />
            <span className="text-xl">Start</span>
          </button>
          
          <button
            onClick={onStop}
            disabled={!isStoppable}
            className="w-48 h-20 font-bold uppercase rounded-md shadow-lg border-b-4 border-yellow-700 bg-yellow-500 text-gray-900 flex items-center justify-center space-x-3 transition-all duration-150 hover:bg-yellow-400 disabled:bg-gray-700 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed active:translate-y-0.5 active:border-b-2"
          >
            <StopIcon className="w-8 h-8" />
            <span className="text-xl">Stop</span>
          </button>
        </div>
        
        <button
            onClick={() => onEmergencyStop()}
            disabled={!isEmergencyStoppable}
            className="w-32 h-32 rounded-full bg-red-700 text-white flex flex-col items-center justify-center shadow-xl border-4 border-red-900 hover:bg-red-600 disabled:bg-gray-700 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 active:shadow-inner disabled:animate-none animate-pulse"
          >
            <AlertTriangleIcon className="w-8 h-8" />
            <span className="font-bold text-xl uppercase mt-1">E-Stop</span>
        </button>
      </div>
      
      {/* Right Panel: Controls */}
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-400 tracking-wider mb-4">System Parameters</h3>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6">
            <Dial
              label="Water Head"
              value={settings.waterHead}
              min={GENERATOR_PARAMS.waterHead.min}
              max={GENERATOR_PARAMS.waterHead.max}
              step={10}
              unit={GENERATOR_PARAMS.waterHead.unit}
              onChange={(value) => onSettingChange('waterHead', value)}
              disabled={areDialsDisabled}
            />
            <Dial
              label="Intake Gate"
              value={settings.intakeGatePosition}
              min={GENERATOR_PARAMS.gatePosition.min}
              max={GENERATOR_PARAMS.gatePosition.max}
              step={1}
              unit={GENERATOR_PARAMS.gatePosition.unit}
              onChange={(value) => onSettingChange('intakeGatePosition', value)}
              disabled={areDialsDisabled}
            />
             <Dial
              label="Guide Vanes"
              value={settings.guideVanePosition}
              min={GENERATOR_PARAMS.vanePosition.min}
              max={GENERATOR_PARAMS.vanePosition.max}
              step={1}
              unit={GENERATOR_PARAMS.vanePosition.unit}
              onChange={(value) => onSettingChange('guideVanePosition', value)}
              disabled={areDialsDisabled}
            />
             <Dial
              label="Target Voltage"
              value={settings.targetVoltage}
              min={GENERATOR_PARAMS.voltage.min}
              max={GENERATOR_PARAMS.voltage.max}
              step={0.1}
              unit={GENERATOR_PARAMS.voltage.unit}
              onChange={(value) => onSettingChange('targetVoltage', value)}
              disabled={areDialsDisabled}
            />
          </div>
      </div>
    </div>
  );
};