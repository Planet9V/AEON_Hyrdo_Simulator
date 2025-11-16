
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
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
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
}) => {
  const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
  const isStopped = status === GeneratorStatus.STOPPED;
  const isBusy = !isRunning && !isStopped;

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2">Control Panel</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onStart}
          disabled={!isStopped}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <PlayIcon className="w-5 h-5" />
          <span>Start</span>
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <StopIcon className="w-5 h-5" />
          <span>Stop</span>
        </button>
      </div>

      <div className="flex-grow space-y-4">
        <h3 className="text-lg font-semibold text-gray-400 text-center">Operational Settings</h3>
        <Slider
          label="Target Power"
          value={settings.targetPower}
          min={GENERATOR_PARAMS.power.min}
          max={GENERATOR_PARAMS.power.max}
          step={5}
          unit={GENERATOR_PARAMS.power.unit}
          onChange={(e) => onSettingChange('targetPower', parseFloat(e.target.value))}
          disabled={!isRunning}
        />
        <Slider
          label="Target Voltage"
          value={settings.targetVoltage}
          min={GENERATOR_PARAMS.voltage.min}
          max={GENERATOR_PARAMS.voltage.max}
          step={0.1}
          unit={GENERATOR_PARAMS.voltage.unit}
          onChange={(e) => onSettingChange('targetVoltage', parseFloat(e.target.value))}
          disabled={!isRunning}
        />
        <Slider
          label="Target Frequency"
          value={settings.targetFrequency}
          min={GENERATOR_PARAMS.frequency.min}
          max={GENERATOR_PARAMS.frequency.max}
          step={1}
          unit={GENERATOR_PARAMS.frequency.unit}
          onChange={(e) => onSettingChange('targetFrequency', parseFloat(e.target.value))}
          disabled={!isRunning}
        />
      </div>

      <div className="pt-4 border-t-2 border-gray-700">
        <button
          onClick={onEmergencyStop}
          disabled={isStopped || isBusy && status !== GeneratorStatus.ALERT }
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-700 text-white font-bold rounded-md hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors animate-pulse disabled:animate-none"
        >
          <AlertTriangleIcon className="w-5 h-5" />
          <span>EMERGENCY STOP</span>
        </button>
      </div>
    </div>
  );
};
