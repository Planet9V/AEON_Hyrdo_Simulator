
import React from 'react';
import { GeneratorStatus } from '../types';
import { AlertTriangleIcon } from './icons';

interface AlertBannerProps {
  status: GeneratorStatus;
  onAcknowledge: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ status, onAcknowledge }) => {
  if (status !== GeneratorStatus.ALERT) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-red-900/80 border-2 border-red-500 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center space-x-3">
        <AlertTriangleIcon className="w-6 h-6 text-red-300" />
        <span className="font-bold text-red-200">ALERT: OPERATIONAL LIMITS EXCEEDED!</span>
        <span className="hidden md:inline text-red-300">Check metrics and take corrective action.</span>
      </div>
      <button
        onClick={onAcknowledge}
        className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-900 focus:ring-red-400 transition-colors"
      >
        Acknowledge
      </button>
    </div>
  );
};
