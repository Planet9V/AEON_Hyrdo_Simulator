import React from 'react';
import { GeneratorMetrics, GeneratorSettings, GeneratorStatus } from '../types';
import { STATUS_STYLES, GENERATOR_PARAMS } from '../constants';
import { MetricsDisplay } from './MetricsDisplay';
import { ChevronUpIcon, DropletIcon, WifiOffIcon } from './icons';

interface SystemCanvasProps {
  status: GeneratorStatus;
  metrics: GeneratorMetrics;
  settings: GeneratorSettings;
  isCommsLossActive: boolean;
}

export const SystemCanvas: React.FC<SystemCanvasProps> = ({ status, metrics, settings, isCommsLossActive }) => {
    const isRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT;
    const isStarting = status === GeneratorStatus.STARTING;

    const rotationSpeed = isRunning ? 60 / (metrics.speed / 10) : (isStarting ? 5 : 30);
    const animationClass = isRunning || isStarting ? 'animate-spin' : '';

    const intakeGateOpen = settings.intakeGatePosition > 0;
    const guideVanesOpen = settings.guideVanePosition > 0;
    const waterFlowing = (isRunning || isStarting) && intakeGateOpen && guideVanesOpen;
    
    const statusColor = STATUS_STYLES[status].ring;
    const statusBgColor = STATUS_STYLES[status].bg;

    // Dynamic water flow animation style
    const waterFlowStyle = {
      animationDuration: waterFlowing ? `${2 - (settings.waterHead / GENERATOR_PARAMS.waterHead.max) * 1.5}s` : '0s',
      strokeWidth: `${2 + (settings.intakeGatePosition / 100) * 6}px`,
      transition: 'stroke-width 0.5s ease-in-out',
    };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* Background elements */}
        <rect x="0" y="0" width="800" height="400" fill="#111827" />
        
        {/* Control System Elements */}
        <g id="ControlSystem">
            {/* Control Room */}
            <rect x="10" y="10" width="130" height="60" rx="5" fill="#1F2937" stroke="#374151" strokeWidth="1"/>
            <text x="75" y="25" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="bold">Control Room</text>
            
            {/* SCADA HMI */}
            <rect x="20" y="35" width="110" height="25" rx="2" fill="#111827" stroke="#374151" strokeWidth="1"/>
            <text x="75" y="50" textAnchor="middle" fill="#60A5FA" fontSize="9">SCADA HMI</text>
            {isCommsLossActive && <WifiOffIcon x="105" y="38" width="20" height="20" className="text-red-500 animate-pulse" />}

            {/* PLC */}
            <rect x="180" y="10" width="100" height="40" rx="3" fill="#1F2937" stroke="#374151" strokeWidth="1"/>
            <text x="230" y="25" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontWeight="bold">PLC</text>
            <circle cx="190" cy="30" r="5" fill={statusBgColor} stroke={statusColor} strokeWidth="1.5" />
            <text x="230" y="40" textAnchor="middle" fill="#6B7280" fontSize="8">Field Controller</text>

            {/* RTU */}
            <rect x="100" y="80" width="40" height="20" rx="2" fill="#1F2937" stroke="#374151" strokeWidth="1"/>
            <text x="120" y="93" textAnchor="middle" fill="#9CA3AF" fontSize="8">RTU</text>

            {/* Network Links */}
            <line x1="140" y1="45" x2="180" y2="30" stroke="#06B6D4" strokeWidth="1.5" />
            <text x="160" y="50" fill="#06B6D4" fontSize="7" transform="rotate(-20 160,50)">Control Network (IEC 61850)</text>
            
            <path d="M 200 50 L 200 60 L 120 60 L 120 80" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 2" fill="none"/>
            <text x="160" y="70" fill="#FBBF24" fontSize="7">Field Bus (Modbus)</text>
        </g>
        
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
        <path d="M 170 160 C 200 160, 220 280, 250 280 L 320 280" stroke="#6B7280" strokeWidth="16" fill="none" />

        {/* Water Flow Animation */}
         <path d="M 170 160 C 200 160, 220 280, 250 280 L 320 280" 
            stroke="#3B82F6" 
            fill="none" 
            className={waterFlowing ? "water-flow" : "water-flow-stopped"}
            style={waterFlowStyle}
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
        <path d="M 350 310 C 350 350, 400 350, 420 350 L 450 350" stroke="#6B7280" strokeWidth="16" fill="none" />
         <path d="M 350 310 C 350 350, 400 350, 420 350 L 450 350" 
            stroke="#3B82F6" 
            fill="none" 
            className={waterFlowing ? "water-flow" : "water-flow-stopped"}
            style={waterFlowStyle}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin linear infinite;
        }
       `}</style>
    </div>
  );
};