
import React from 'react';
import { GeneratorMetrics } from '../types';
import { GENERATOR_PARAMS, OPERATIONAL_LIMITS } from '../constants';
import { ZapIcon, ThermometerIcon, ZapOffIcon, WavesIcon, GaugeIcon, ActivityIcon, ExcitationIcon } from './icons';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass?: string;
  barValue?: number;
  barMax?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, colorClass = 'text-cyan-400', barValue, barMax }) => (
  <div className="bg-gray-900/70 p-3 rounded-lg flex flex-col justify-between h-full">
    <div>
      <div className="flex items-center space-x-2 text-gray-400">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className={`text-2xl lg:text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
    </div>
    {barValue !== undefined && barMax !== undefined && (
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div
          className="bg-cyan-500 h-1.5 rounded-full"
          style={{ width: `${(barValue / barMax) * 100}%` }}
        ></div>
      </div>
    )}
  </div>
);


export const MetricsDisplay: React.FC<{ metrics: GeneratorMetrics }> = ({ metrics }) => {
  const getTempColor = (temp: number) => {
    if (temp > OPERATIONAL_LIMITS.temperature) return 'text-red-500';
    if (temp > OPERATIONAL_LIMITS.temperature * 0.9) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  const getVibrationColor = (vibration: number) => {
    if (vibration > OPERATIONAL_LIMITS.vibration) return 'text-red-500';
    if (vibration > OPERATIONAL_LIMITS.vibration * 0.9) return 'text-yellow-400';
    return 'text-cyan-400';
  };

  return (
    <div className="h-full flex flex-col">
        <h2 className="text-xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Live Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
            <MetricCard 
                icon={<ZapIcon className="w-5 h-5"/>} 
                label="Power Output" 
                value={`${metrics.power.toFixed(1)} ${GENERATOR_PARAMS.power.unit}`} 
                barValue={metrics.power}
                barMax={GENERATOR_PARAMS.power.max}
            />
            <MetricCard 
                icon={<ZapOffIcon className="w-5 h-5"/>} 
                label="Voltage" 
                value={`${metrics.voltage.toFixed(2)} ${GENERATOR_PARAMS.voltage.unit}`} 
                barValue={metrics.voltage}
                barMax={GENERATOR_PARAMS.voltage.max}
            />
             <MetricCard 
                icon={<ExcitationIcon className="w-5 h-5"/>} 
                label="Excitation" 
                value={`${metrics.excitationCurrent.toFixed(1)} A`}
            />
            <MetricCard 
                icon={<WavesIcon className="w-5 h-5"/>} 
                label="Frequency" 
                value={`${metrics.frequency.toFixed(2)} ${GENERATOR_PARAMS.frequency.unit}`} 
            />
            <MetricCard 
                icon={<ThermometerIcon className="w-5 h-5"/>} 
                label="Stator Temp." 
                value={`${metrics.temperature.toFixed(1)} °C`}
                colorClass={getTempColor(metrics.temperature)}
            />
            <MetricCard 
                icon={<ActivityIcon className="w-5 h-5"/>} 
                label="Vibration" 
                value={`${metrics.vibration.toFixed(2)} mm/s`}
                colorClass={getVibrationColor(metrics.vibration)}
            />
             <MetricCard 
                icon={<GaugeIcon className="w-5 h-5"/>} 
                label="Current" 
                value={`${metrics.current.toFixed(1)} A`}
            />
            <MetricCard 
                icon={<GaugeIcon className="w-5 h-5"/>} 
                label="Efficiency" 
                value={`${metrics.efficiency.toFixed(1)} %`}
            />
        </div>
    </div>
  );
};
