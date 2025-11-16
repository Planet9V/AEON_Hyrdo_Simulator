import React from 'react';
import { GeneratorStatus, GeneratorSettings } from '../types';
import { GENERATOR_PARAMS } from '../constants';
import { PlayIcon, StopIcon, AlertTriangleIcon } from './icons';

interface ControlPanelProps {
  status: GeneratorStatus;
  settings: GeneratorSettings;
  onStart: () => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  onSettingChange: (key: keyof GeneratorSettings, value: number) => void;
  isCommsLossActive: boolean;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ label, value, min, max, step, unit, onChange, disabled }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <label className="font-semibold text-gray-400">{label}</label>
      <span className="font-bold text-cyan-400">{value.toFixed(1)} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
    />
  </div>
);

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
  const isStopped = status === GeneratorStatus.STOPPED;
  const isBusy = !isRunning && !isStopped && status !== GeneratorStatus.COMMS_LOSS && status !== GeneratorStatus.GRID_UNSTABLE;
  const isDisabled = isCommsLossActive || !isRunning;

  return (
    <div className="flex flex-col h-full space-y-4">
       <h3 className="text-lg font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2">Main Controls</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Operations */}
        <div className="flex flex-col space-y-2">
           <h4 className="text-md font-semibold text-gray-400 text-center">Main Operations</h4>
           <button
            onClick={onStart}
            disabled={!isStopped || isCommsLossActive}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Start</span>
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning || isCommsLossActive}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <StopIcon className="w-5 h-5" />
            <span>Stop</span>
          </button>
           <button
            onClick={() => onEmergencyStop()}
            disabled={isStopped || isBusy }
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-700 text-white font-bold rounded-md hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors animate-pulse disabled:animate-none"
          >
            <AlertTriangleIcon className="w-5 h-5" />
            <span>E-STOP</span>
          </button>
        </div>
        
        {/* Hydraulic Controls */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-400 text-center">Hydraulic Controls</h4>
          <Slider
            label="Water Head"
            value={settings.waterHead}
            min={GENERATOR_PARAMS.waterHead.min}
            max={GENERATOR_PARAMS.waterHead.max}
            step={10}
            unit={GENERATOR_PARAMS.waterHead.unit}
            onChange={(e) => onSettingChange('waterHead', parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <Slider
            label="Intake Gate"
            value={settings.intakeGatePosition}
            min={GENERATOR_PARAMS.gatePosition.min}
            max={GENERATOR_PARAMS.gatePosition.max}
            step={1}
            unit={GENERATOR_PARAMS.gatePosition.unit}
            onChange={(e) => onSettingChange('intakeGatePosition', parseFloat(e.target.value))}
            disabled={isDisabled}
          />
          <Slider
            label="Guide Vanes"
            value={settings.guideVanePosition}
            min={GENERATOR_PARAMS.vanePosition.min}
            max={GENERATOR_PARAMS.vanePosition.max}
            step={1}
            unit={GENERATOR_PARAMS.vanePosition.unit}
            onChange={(e) => onSettingChange('guideVanePosition', parseFloat(e.target.value))}
            disabled={isDisabled}
          />
        </div>

        {/* Electrical Settings */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-400 text-center">Electrical Settings</h4>
          <Slider
            label="Target Voltage"
            value={settings.targetVoltage}
            min={GENERATOR_PARAMS.voltage.min}
            max={GENERATOR_PARAMS.voltage.max}
            step={0.1}
            unit={GENERATOR_PARAMS.voltage.unit}
            onChange={(e) => onSettingChange('targetVoltage', parseFloat(e.target.value))}
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};
