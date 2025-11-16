
import React from 'react';
import { GeneratorStatus } from '../types';
import { STATUS_STYLES } from '../constants';

interface GeneratorVisualProps {
  status: GeneratorStatus;
  speed: number;
}

export const GeneratorVisual: React.FC<GeneratorVisualProps> = ({ status, speed }) => {
  const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
  const isStarting = status === GeneratorStatus.STARTING;
  const rotationSpeed = isRunning ? 60 / (speed / 10) : (isStarting ? 5 : 30);
  const statusColor = STATUS_STYLES[status].ring;

  const animationClass = isRunning ? 'animate-spin-fast' : (isStarting ? 'animate-spin-slow' : '');

  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
      {/* Stator */}
      <div className={`absolute w-full h-full rounded-full border-8 border-gray-600 transition-colors duration-500 ${statusColor}`}></div>
      <div className="absolute w-[85%] h-[85%] rounded-full border-4 border-gray-700"></div>
      <div className="absolute w-[70%] h-[70%] rounded-full bg-gray-800"></div>

      {/* Rotor */}
      <div
        className={`absolute w-[60%] h-[60%] ${animationClass}`}
        style={{ animationDuration: isRunning || isStarting ? `${rotationSpeed}s` : '0s' }}
      >
        <div className="absolute top-1/2 left-0 w-full h-1 bg-cyan-500/50 transform -translate-y-1/2"></div>
        <div className="absolute top-0 left-1/2 w-1 h-full bg-cyan-500/50 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-cyan-500/50 transform -translate-y-1/2 rotate-45"></div>
        <div className="absolute top-0 left-1/2 w-1 h-full bg-cyan-500/50 transform -translate-x-1/2 rotate-45"></div>
      </div>
      
      {/* Center Hub */}
      <div className="absolute w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-500"></div>
      <div className={`absolute w-4 h-4 rounded-full transition-colors duration-500 ${STATUS_STYLES[status].bg}`}></div>

      <div className="absolute text-center">
        <div className="text-2xl sm:text-3xl font-bold text-white">{speed.toFixed(0)}</div>
        <div className="text-xs sm:text-sm text-gray-400">RPM</div>
      </div>
      
      <style jsx="true">{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast linear infinite;
        }
      `}</style>
    </div>
  );
};
