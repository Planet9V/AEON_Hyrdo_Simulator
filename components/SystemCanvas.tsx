import React from 'react';
import { GeneratorMetrics, GeneratorSettings, GeneratorStatus } from '../types';
// FIX: Import GENERATOR_PARAMS to use in component.
import { STATUS_STYLES, GENERATOR_PARAMS } from '../constants';
import { MetricsDisplay } from './MetricsDisplay';
import { ChevronUpIcon, DropletIcon } from './icons';

interface SystemCanvasProps {
  status: GeneratorStatus;
  metrics: GeneratorMetrics;
  settings: GeneratorSettings;
}

export const SystemCanvas: React.FC<SystemCanvasProps> = ({ status, metrics, settings }) => {
    const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
    const isStarting = status === GeneratorStatus.STARTING;
    const isStopped = status === GeneratorStatus.STOPPED;

    const rotationSpeed = isRunning ? 60 / (metrics.speed / 10) : (isStarting ? 5 : 30);
    const animationClass = isRunning ? 'animate-spin-fast' : (isStarting ? 'animate-spin-slow' : '');

    const intakeGateOpen = settings.intakeGatePosition > 0;
    const guideVanesOpen = settings.guideVanePosition > 0;
    const waterFlowing = (isRunning || isStarting) && intakeGateOpen && guideVanesOpen;
    
    const statusColor = STATUS_STYLES[status].ring;
    const statusBgColor = STATUS_STYLES[status].bg;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* Background elements */}
        <rect x="0" y="0" width="800" height="400" fill="#111827" />

        {/* Reservoir & Dam */}
        <path d="M 0 100 L 150 100 L 170 350 L 0 350 Z" fill="url(#waterGradient)" />
        <path d="M 150 50 L 150 100 L 170 350 L 170 300 Z" fill="#4B5563" />
        <path d="M 150 50 L 170 300 L 170 350 L 150 100" stroke="#374151" strokeWidth="2" fill="none" />
        <text x="75" y="70" textAnchor="middle" fill="#9CA3AF" fontSize="14" fontWeight="bold">Reservoir</text>
        <text x="160" y="40" textAnchor="middle" fill="#9CA3AF" fontSize="14" fontWeight="bold">Dam</text>

        <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
        </defs>

        {/* Intake and Penstock */}
        <rect x="140" y="140" width="30" height="40" fill="#374151" />
        <rect x="150" y={145 + (15 * (100 - settings.intakeGatePosition) / 100)} width="20" height={15 * settings.intakeGatePosition / 100} fill="#60A5FA" />
        <text x="120" y="130" textAnchor="end" fill="#9CA3AF" fontSize="10">Intake Gate</text>
        <path d="M 170 160 C 200 160, 220 280, 250 280 L 320 280" stroke="#6B7280" strokeWidth="12" fill="none" />

        {/* Water Flow Animation */}
        <path d="M 170 160 C 200 160, 220 280, 250 280 L 320 280" 
            stroke="#3B82F6" 
            strokeWidth="6" 
            fill="none" 
            className={waterFlowing ? "water-flow" : "water-flow-stopped"}
        />
        
        {/* Turbine */}
        <circle cx="350" cy="280" r="30" fill="#374151" />
        <path 
            className={animationClass}
            style={{ animationDuration: isRunning || isStarting ? `${rotationSpeed}s` : '0s', transformOrigin: '350px 280px' }}
            d="M 350 260 L 350 300 M 330 280 L 370 280 M 335 265 L 365 295 M 335 295 L 365 265"
            stroke="#9CA3AF"
            strokeWidth="3"
        />
        <text x="350" y="325" textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="bold">Turbine</text>
        
        {/* Draft Tube (Water Exit) */}
        <path d="M 350 310 C 350 350, 400 350, 420 350 L 450 350" stroke="#6B7280" strokeWidth="12" fill="none" />
         <path d="M 350 310 C 350 350, 400 350, 420 350 L 450 350" 
            stroke="#3B82F6" 
            strokeWidth="6" 
            fill="none" 
            className={waterFlowing ? "water-flow" : "water-flow-stopped"}
        />

        {/* Shaft */}
        <rect x="345" y="180" width="10" height="100" fill="#6B7280" />
        
        {/* Generator */}
        <circle cx="350" cy="150" r="35" fill="#374151" stroke={statusColor} strokeWidth="3" />
        <path 
            className={animationClass}
            style={{ animationDuration: isRunning || isStarting ? `${rotationSpeed}s` : '0s', transformOrigin: '350px 150px' }}
            d="M 350 125 L 350 175 M 325 150 L 375 150 M 332 132 L 368 168 M 332 168 L 368 132"
            stroke="#06B6D4"
            strokeWidth="2"
        />
        <circle cx="350" cy="150" r="8" fill={statusBgColor} />
        <text x="350" y="200" textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="bold">Generator</text>
        
        {/* Transmission */}
        <path d="M 385 150 L 450 150 L 450 100 L 500 100" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <rect x="495" y="80" width="10" height="40" fill="#4B5563" />
        <text x="500" y="70" textAnchor="middle" fill="#9CA3AF" fontSize="12">Transformer</text>
        <path d="M 505 100 L 600 100" stroke="#FBBF24" strokeWidth="2" fill="none" />

        {/* Transmission Tower */}
        <path d="M 600 100 L 620 150 L 580 150 L 600 100 M 600 100 L 600 50 M 580 75 L 620 75" stroke="#9CA3AF" strokeWidth="2" />
        <path d="M 620 75 L 680 75" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <text x="680" y="65" textAnchor="start" fill="#9CA3AF" fontSize="12">To Grid</text>

        {/* Labels and Indicators */}
        <g>
            <rect x="5" y="360" width="160" height="35" rx="5" fill="#1F2937" stroke="#374151" />
            <DropletIcon x="10" y="365" width="25" height="25" className="text-blue-400" />
            <text x="40" y="375" fill="#9CA3AF" fontSize="10">Water Head</text>
            <text x="40" y="388" fill="#E5E7EB" fontSize="12" fontWeight="bold">{settings.waterHead.toFixed(0)}m</text>
            <ChevronUpIcon x="140" y="368" width="20" height="20" className="text-gray-400" style={{ transform: `rotate(${(settings.waterHead / GENERATOR_PARAMS.waterHead.max) * 180}deg)`, transformOrigin: 'center'}}/>
        </g>
         <g>
            <rect x="175" y="360" width="160" height="35" rx="5" fill="#1F2937" stroke="#374151" />
            <rect x="180" y="365" width="25" height="25" className="text-gray-400" fill="currentColor" />
            <text x="210" y="375" fill="#9CA3AF" fontSize="10">Guide Vanes</text>
            <text x="210" y="388" fill="#E5E7EB" fontSize="12" fontWeight="bold">{settings.guideVanePosition.toFixed(0)}%</text>
            <ChevronUpIcon x="310" y="368" width="20" height="20" className="text-gray-400" style={{ transform: `rotate(${(settings.guideVanePosition / 100) * 180}deg)`, transformOrigin: 'center'}}/>
        </g>
      </svg>
      <MetricsDisplay metrics={metrics} status={status} />
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