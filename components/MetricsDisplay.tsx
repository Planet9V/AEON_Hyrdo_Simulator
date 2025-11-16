import React from 'react';
import { GeneratorMetrics, GeneratorStatus } from '../types';
import { STATUS_STYLES, GENERATOR_PARAMS, OPERATIONAL_LIMITS } from '../constants';
import { ZapIcon, ThermometerIcon, ZapOffIcon, WavesIcon, GaugeIcon, ActivityIcon, ExcitationIcon, RpmIcon } from './icons';

interface MetricDisplayProps {
  metrics: GeneratorMetrics;
  status: GeneratorStatus;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  className?: string;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit, className, valueClassName }) => {
  const statusColor = STATUS_STYLES[GeneratorStatus.RUNNING].text;

  return (
    <div className={`absolute bg-gray-900/60 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 shadow-lg ${className}`}>
      <div className="flex items-center space-x-2 text-gray-400">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className={`text-lg font-bold mt-1 ${valueClassName || statusColor} flex items-baseline`}>
        {value}
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
};

export const MetricsDisplay: React.FC<MetricDisplayProps> = ({ metrics, status }) => {
  const getTempColor = (temp: number) => {
    if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT) return 'text-gray-400';
    if (temp > OPERATIONAL_LIMITS.temperature) return 'text-red-500 animate-pulse';
    if (temp > OPERATIONAL_LIMITS.temperature * 0.9) return 'text-yellow-400';
    return STATUS_STYLES[GeneratorStatus.RUNNING].text;
  };

  const getVibrationColor = (vibration: number) => {
     if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT) return 'text-gray-400';
    if (vibration > OPERATIONAL_LIMITS.vibration) return 'text-red-500 animate-pulse';
    if (vibration > OPERATIONAL_LIMITS.vibration * 0.9) return 'text-yellow-400';
    return STATUS_STYLES[GeneratorStatus.RUNNING].text;
  };
  
  const getRocfColor = (rocf: number) => {
    if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT && status !== GeneratorStatus.GRID_UNSTABLE) return 'text-gray-400';
    if (rocf < OPERATIONAL_LIMITS.rocf) return 'text-red-500 animate-pulse';
    if (rocf < OPERATIONAL_LIMITS.rocf * 0.75) return 'text-yellow-400';
    return STATUS_STYLES[GeneratorStatus.RUNNING].text;
  };

  const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;

  return (
    <>
      {/* Turbine Metrics */}
      <MetricCard 
        icon={<RpmIcon className="w-4 h-4" />}
        label="Turbine Speed"
        value={metrics.speed.toFixed(0)}
        unit="RPM"
        className="top-[55%] left-[32%]"
        valueClassName={isRunning ? STATUS_STYLES.RUNNING.text : 'text-gray-400'}
      />
       <MetricCard 
        icon={<ActivityIcon className="w-4 h-4" />}
        label="Vibration"
        value={metrics.vibration.toFixed(2)}
        unit="mm/s"
        className="top-[70%] left-[32%]"
        valueClassName={getVibrationColor(metrics.vibration)}
      />

      {/* Generator Metrics */}
      <MetricCard 
        icon={<ThermometerIcon className="w-4 h-4" />}
        label="Stator Temp"
        value={metrics.temperature.toFixed(1)}
        unit="°C"
        className="top-[55%] left-[52%]"
        valueClassName={getTempColor(metrics.temperature)}
      />
      <MetricCard 
        icon={<ExcitationIcon className="w-4 h-4" />}
        label="Excitation"
        value={metrics.excitationCurrent.toFixed(1)}
        unit="A"
        className="top-[70%] left-[52%]"
        valueClassName={isRunning ? STATUS_STYLES.RUNNING.text : 'text-gray-400'}
      />

      {/* Grid Metrics */}
      <MetricCard 
        icon={<ZapIcon className="w-4 h-4" />}
        label="Power Output"
        value={metrics.power.toFixed(1)}
        unit={GENERATOR_PARAMS.power.unit}
        className="top-[30%] right-[5%]"
        valueClassName={isRunning ? 'text-green-400' : 'text-gray-400'}
      />
      <MetricCard 
        icon={<ZapOffIcon className="w-4 h-4" />}
        label="Voltage"
        value={metrics.voltage.toFixed(2)}
        unit={GENERATOR_PARAMS.voltage.unit}
        className="top-[45%] right-[5%]"
        valueClassName={isRunning ? STATUS_STYLES.RUNNING.text : 'text-gray-400'}

      />
      <MetricCard 
        icon={<WavesIcon className="w-4 h-4" />}
        label="Frequency"
        value={metrics.frequency.toFixed(2)}
        unit={GENERATOR_PARAMS.frequency.unit}
        className="top-[60%] right-[5%]"
        valueClassName={isRunning ? STATUS_STYLES.RUNNING.text : 'text-gray-400'}
      />
      <MetricCard 
        icon={<ActivityIcon className="w-4 h-4" />}
        label="RoCoF"
        value={metrics.rocf.toFixed(2)}
        unit="Hz/s"
        className="top-[75%] right-[5%]"
        valueClassName={getRocfColor(metrics.rocf)}
      />
    </>
  );
};
