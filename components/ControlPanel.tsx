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
  const isDisabled = isCommsLossActive || !isRunning;

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
       <h3 className="text-lg font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2">Main Controls</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Main Operations */}
        <div className="flex flex-col space-y-4 justify-center items-center p-4 bg-gray-900/50 rounded-lg">
           <h4 className="text-md font-semibold text-gray-400 text-center mb-2">Main Operations</h4>
           <button
            onClick={onStart}
            disabled={!isStopped || isCommsLossActive}
            className="flex items-center justify-center space-x-2 w-full h-16 text-lg bg-green-700 text-white font-bold rounded-md hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <PlayIcon className="w-6 h-6" />
            <span>START</span>
          </button>
          <button
            onClick={onStop}
            disabled={!isStoppable}
            className="flex items-center justify-center space-x-2 w-full h-16 text-lg bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <StopIcon className="w-6 h-6" />
            <span>STOP</span>
          </button>
           <button
            onClick={() => onEmergencyStop()}
            disabled={!isEmergencyStoppable}
            className="flex items-center justify-center space-x-2 w-full h-16 text-lg bg-red-800 text-white font-bold rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 animate-pulse disabled:animate-none"
          >
            <AlertTriangleIcon className="w-6 h-6" />
            <span>E-STOP</span>
          </button>
        </div>
        
        {/* Hydraulic Controls */}
        <div className="flex flex-col justify-around items-center p-4 bg-gray-900/50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-400 text-center">Hydraulic Controls</h4>
          <div className="flex justify-around w-full mt-4">
            <Dial
              label="Water Head"
              value={settings.waterHead}
              min={GENERATOR_PARAMS.waterHead.min}
              max={GENERATOR_PARAMS.waterHead.max}
              step={10}
              unit={GENERATOR_PARAMS.waterHead.unit}
              onChange={(value) => onSettingChange('waterHead', value)}
              disabled={isDisabled}
            />
            <Dial
              label="Intake Gate"
              value={settings.intakeGatePosition}
              min={GENERATOR_PARAMS.gatePosition.min}
              max={GENERATOR_PARAMS.gatePosition.max}
              step={1}
              unit={GENERATOR_PARAMS.gatePosition.unit}
              onChange={(value) => onSettingChange('intakeGatePosition', value)}
              disabled={isDisabled}
            />
             <Dial
              label="Guide Vanes"
              value={settings.guideVanePosition}
              min={GENERATOR_PARAMS.vanePosition.min}
              max={GENERATOR_PARAMS.vanePosition.max}
              step={1}
              unit={GENERATOR_PARAMS.vanePosition.unit}
              onChange={(value) => onSettingChange('guideVanePosition', value)}
              disabled={isDisabled}
            />
          </div>
        </div>

        {/* Electrical Settings */}
        <div className="flex flex-col justify-around items-center p-4 bg-gray-900/50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-400 text-center">Electrical Settings</h4>
          <div className="flex justify-around w-full mt-4">
             <Dial
              label="Target Voltage"
              value={settings.targetVoltage}
              min={GENERATOR_PARAMS.voltage.min}
              max={GENERATOR_PARAMS.voltage.max}
              step={0.1}
              unit={GENERATOR_PARAMS.voltage.unit}
              onChange={(value) => onSettingChange('targetVoltage', value)}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
