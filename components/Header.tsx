
import React from 'react';
import { GeneratorStatus } from '../types';
import { STATUS_STYLES } from '../constants';
import { PowerIcon } from './icons';

interface HeaderProps {
  status: GeneratorStatus;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const style = STATUS_STYLES[status];

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <PowerIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-400">
          Hydroelectric Generator Simulator
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">STATUS:</span>
        <span
          className={`px-3 py-1 text-sm font-bold rounded-full ${style.bg} ${style.text} ring-2 ${style.ring} transition-all duration-300`}
        >
          {status}
        </span>
      </div>
    </header>
  );
};
