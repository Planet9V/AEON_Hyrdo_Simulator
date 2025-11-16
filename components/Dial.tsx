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
const DIAL_START_DEGREE = 135; // Start at bottom-left

export const Dial: React.FC<DialProps> = ({ label, value, min, max, step, unit, onChange, disabled }) => {
  const dialRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const valueToAngle = useCallback((val: number) => {
    const percentage = (val - min) / (max - min);
    return DIAL_START_DEGREE + percentage * DIAL_RANGE_DEGREES;
  }, [min, max]);

  const angleToValue = useCallback((angle: number) => {
    // Normalize angle to 0-360 range
    const normalizedAngle = (angle + 360) % 360;

    let percentage = 0;
    if (normalizedAngle >= DIAL_START_DEGREE && normalizedAngle <= DIAL_START_DEGREE + DIAL_RANGE_DEGREES) {
        percentage = (normalizedAngle - DIAL_START_DEGREE) / DIAL_RANGE_DEGREES;
    } else if (normalizedAngle < DIAL_START_DEGREE) {
        // Handle wrap-around near the end of the range (e.g., 45 degrees)
        if (normalizedAngle <= (DIAL_START_DEGREE + DIAL_RANGE_DEGREES) % 360) {
            percentage = (normalizedAngle + (360 - DIAL_START_DEGREE)) / DIAL_RANGE_DEGREES;
        } else {
             percentage = 0;
        }
    } else {
        percentage = 1;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, parseFloat(steppedValue.toFixed(2))));
  }, [min, max, step]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dialRef.current || disabled) return;
      
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);

      const newValue = angleToValue(angle);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, disabled, angleToValue, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    
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

  const startAngleRad = (DIAL_START_DEGREE * Math.PI) / 180;
  const progressAngle = DIAL_START_DEGREE + ((value - min) / (max - min)) * DIAL_RANGE_DEGREES;
  const progressAngleRad = (progressAngle * Math.PI) / 180;
  
  const largeArcFlag = (progressAngle - DIAL_START_DEGREE) <= 180 ? "0" : "1";
  
  const startX = 50 + 38 * Math.cos(startAngleRad);
  const startY = 50 + 38 * Math.sin(startAngleRad);
  const endX = 50 + 38 * Math.cos(progressAngleRad);
  const endY = 50 + 38 * Math.sin(progressAngleRad);
  
  const pathData = `M ${startX} ${startY} A 38 38 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return (
    <div className="flex flex-col items-center space-y-1 text-center">
      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <svg
        ref={dialRef}
        width="120"
        height="120"
        viewBox="0 0 100 100"
        onMouseDown={handleMouseDown}
        className={disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      >
        {/* Background and track */}
        <circle cx="50" cy="50" r="45" fill="#111827" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={!disabled ? "#374151" : "#2a3340"} strokeWidth="8" />
        {ticks}

        {/* Progress Arc */}
        <path d={pathData} fill="none" stroke={!disabled ? "#06B6D4" : "#0891B2"} strokeWidth="8" />


        {/* Knob */}
        <g transform={`rotate(${angle} 50 50)`}>
          <circle cx="50" cy="12" r="6" fill={!disabled ? "#E5E7EB" : "#9CA3AF"} />
        </g>
        <circle cx="50" cy="50" r="28" fill="#1F2937" stroke={!disabled ? "#4B5563" : "#374151"} strokeWidth="1" />
      </svg>
      <div className={`font-bold text-lg -mt-20 ${disabled ? 'text-gray-500' : 'text-cyan-300'}`}>
        {value.toFixed(label.includes('Voltage') ? 1 : 0)}
      </div>
      <div className={`text-xs text-gray-400 -mt-1`}>{unit}</div>
    </div>
  );
};