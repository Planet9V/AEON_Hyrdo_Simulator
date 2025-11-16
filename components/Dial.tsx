import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  disabled: boolean;
}

const DIAL_RANGE_DEGREES = 270;
const DIAL_START_DEGREE = -225;

export const Dial: React.FC<DialProps> = ({ label, value, min, max, step, unit, onChange, disabled }) => {
  const dialRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const valueToAngle = useCallback((val: number) => {
    const percentage = (val - min) / (max - min);
    return DIAL_START_DEGREE + percentage * DIAL_RANGE_DEGREES;
  }, [min, max]);

  const angleToValue = useCallback((angle: number) => {
    let currentAngle = angle;
    if (currentAngle < DIAL_START_DEGREE) {
        currentAngle += 360;
    }

    let percentage = (currentAngle - DIAL_START_DEGREE) / DIAL_RANGE_DEGREES;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dialRef.current || disabled) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);

    const newValue = angleToValue(angle);
    onChange(newValue);
  }, [isDragging, disabled, angleToValue, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    
    // Allow direct click to set value
    if (dialRef.current) {
        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const newValue = angleToValue(angle);
        onChange(newValue);
    }
  };
  
  const angle = valueToAngle(value);

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = DIAL_START_DEGREE + (i / 10) * DIAL_RANGE_DEGREES;
    ticks.push(
      <line
        key={i}
        x1="50"
        y1="10"
        x2="50"
        y2="14"
        stroke={!disabled ? "#6B7280" : "#4B5563"}
        strokeWidth="2"
        transform={`rotate(${tickAngle} 50 50)`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-1 text-center">
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <svg
        ref={dialRef}
        width="100"
        height="100"
        viewBox="0 0 100 100"
        onMouseDown={handleMouseDown}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      >
        {/* Background and track */}
        <circle cx="50" cy="50" r="45" fill="#1F2937" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={!disabled ? "#4B5563" : "#374151"} strokeWidth="6" />
        {ticks}

        {/* Knob */}
        <g transform={`rotate(${angle} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="20" stroke={!disabled ? "#06B6D4" : "#0891B2"} strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="10" fill={!disabled ? "#374151" : "#2a3340"} stroke={!disabled ? "#6B7280" : "#4B5563"} strokeWidth="2" />
      </svg>
      <div className={`font-bold text-sm ${disabled ? 'text-gray-500' : 'text-cyan-400'}`}>
        {value.toFixed(label === 'Target Voltage' ? 1 : 0)} <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  );
};
