
import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
  logs: string[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getLogColor = (log: string) => {
    if (log.includes('!!!')) return 'text-red-400';
    if (log.includes('[ALERT]')) return 'text-red-400 font-bold';
    if (log.includes('RUNNING')) return 'text-green-400';
    if (log.includes('STOPPED')) return 'text-yellow-400';
    if (log.includes('[SYSTEM]')) return 'text-cyan-400';
    return 'text-gray-300';
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-4">
      <h2 className="text-lg font-bold text-gray-300 border-b-2 border-gray-700 pb-2 mb-2 flex-shrink-0">
        System Log
      </h2>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2">
        {logs.map((log, index) => (
          <p key={index} className={`text-xs sm:text-sm whitespace-pre-wrap ${getLogColor(log)}`}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};
