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
    if (log.includes('!!!') || log.includes('[ALERT]') || log.includes('GRID INSTABILITY')) return 'text-red-400 font-bold';
    if (log.includes('SCADA')) return 'text-orange-400 font-bold';
    if (log.includes('RUNNING')) return 'text-green-400';
    if (log.includes('STOPPED')) return 'text-yellow-400';
    if (log.includes('[SYSTEM]') || log.includes('[SCENARIO]')) return 'text-cyan-400';
    return 'text-gray-300';
  };

  return (
    <div className="h-full flex flex-col p-2">
      <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 h-full">
        {logs.map((log, index) => (
          <p key={index} className={`text-xs whitespace-pre-wrap leading-relaxed ${getLogColor(log)}`}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};