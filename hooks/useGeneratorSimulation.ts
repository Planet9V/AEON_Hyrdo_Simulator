
import { useState, useEffect, useRef, useCallback } from 'react';
import { GeneratorStatus, GeneratorMetrics, GeneratorSettings } from '../types';
import {
  INITIAL_METRICS,
  INITIAL_SETTINGS,
  GENERATOR_PARAMS,
  SIMULATION_TICK_RATE,
  OPERATIONAL_LIMITS,
  START_SEQUENCE,
  STOP_SEQUENCE,
  EMERGENCY_STOP_SEQUENCE
} from '../constants';
import { VoltageRegulation } from '../utils/VoltageRegulator';

export const useGeneratorSimulation = () => {
  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.STOPPED);
  const [metrics, setMetrics] = useState<GeneratorMetrics>(INITIAL_METRICS);
  const [settings, setSettings] = useState<GeneratorSettings>(INITIAL_SETTINGS);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Simulator initialized. Awaiting commands.']);
  
  const intervalRef = useRef<number | null>(null);
  const sequenceTimeoutRef = useRef<number | null>(null);
  const voltageRegulatorRef = useRef(new VoltageRegulation());

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs.slice(0, 99)]);
  }, []);

  const clearTimeouts = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    intervalRef.current = null;
    sequenceTimeoutRef.current = null;
  }, []);

  const calculateSynchronousSpeed = useCallback((frequency: number) => {
    return (120 * frequency) / GENERATOR_PARAMS.poles;
  }, []);

  const runSequence = useCallback((sequence: string[], finalStatus: GeneratorStatus) => {
    let step = 0;
    const runNextStep = () => {
      if (step < sequence.length) {
        addLog(sequence[step]);
        step++;
        sequenceTimeoutRef.current = window.setTimeout(runNextStep, 1500);
      } else {
        setStatus(finalStatus);
      }
    };
    runNextStep();
  }, [addLog]);

  const start = useCallback(() => {
    if (status === GeneratorStatus.STOPPED) {
      clearTimeouts();
      voltageRegulatorRef.current.reset();
      setStatus(GeneratorStatus.STARTING);
      runSequence(START_SEQUENCE, GeneratorStatus.RUNNING);
    }
  }, [status, clearTimeouts, runSequence]);

  const stop = useCallback(() => {
    if (status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT) {
      clearTimeouts();
      setStatus(GeneratorStatus.STOPPING);
      runSequence(STOP_SEQUENCE, GeneratorStatus.STOPPED);
    }
  }, [status, clearTimeouts, runSequence]);

  const emergencyStop = useCallback(() => {
    if (status !== GeneratorStatus.STOPPED) {
      clearTimeouts();
      setStatus(GeneratorStatus.EMERGENCY_STOP);
      runSequence(EMERGENCY_STOP_SEQUENCE, GeneratorStatus.STOPPED);
    }
  }, [status, clearTimeouts, runSequence]);

  const updateSetting = useCallback((key: keyof GeneratorSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const acknowledgeAlert = useCallback(() => {
    if (status === GeneratorStatus.ALERT) {
      addLog('[SYSTEM] Alert acknowledged by operator.');
      setStatus(GeneratorStatus.RUNNING);
    }
  }, [status, addLog]);

  useEffect(() => {
    const tick = () => {
      setMetrics(prev => {
        const targetSpeed = calculateSynchronousSpeed(settings.targetFrequency);
        const speed = targetSpeed + (Math.random() - 0.5) * (targetSpeed * 0.005);
        
        const powerFluctuation = (Math.random() - 0.5) * (settings.targetPower * 0.01);
        const power = settings.targetPower + powerFluctuation;
        
        const voltageFluctuation = (Math.random() - 0.5) * (settings.targetVoltage * 0.02);
        const measuredVoltage = prev.voltage === 0 ? settings.targetVoltage : prev.voltage;
        const naturalVoltage = measuredVoltage + voltageFluctuation;

        const voltageCorrection = voltageRegulatorRef.current.regulateVoltage(naturalVoltage, settings.targetVoltage);
        const voltage = naturalVoltage + voltageCorrection;
        
        const excitationCurrent = Math.max(50, Math.min(500, 250 + voltageRegulatorRef.current.getControlOutput() * 500));

        const freqFluctuation = (Math.random() - 0.5) * (settings.targetFrequency * 0.002);
        const frequency = settings.targetFrequency + freqFluctuation;
        
        const angularVelocity = (2 * Math.PI * speed) / 60;
        const torque = (power * 1e6) / angularVelocity;
        
        const current = (power * 1e6) / (Math.sqrt(3) * voltage * 1000 * GENERATOR_PARAMS.powerFactor * GENERATOR_PARAMS.efficiency);

        const tempIncrease = (power / GENERATOR_PARAMS.power.max) * 0.1;
        const temperature = Math.min(prev.temperature + tempIncrease - 0.05, OPERATIONAL_LIMITS.temperature + 10);
        
        const vibration = (speed / targetSpeed) * 1.5 + (Math.random() - 0.5) * 0.2;

        const newMetrics: GeneratorMetrics = {
            power: parseFloat(power.toFixed(2)),
            voltage: parseFloat(voltage.toFixed(2)),
            frequency: parseFloat(frequency.toFixed(3)),
            temperature: parseFloat(temperature.toFixed(1)),
            vibration: parseFloat(vibration.toFixed(2)),
            speed: parseFloat(speed.toFixed(1)),
            torque: parseFloat(torque.toFixed(0)),
            current: parseFloat(current.toFixed(1)),
            efficiency: GENERATOR_PARAMS.efficiency * 100,
            excitationCurrent: parseFloat(excitationCurrent.toFixed(1)),
        };

        if (temperature > OPERATIONAL_LIMITS.temperature || vibration > OPERATIONAL_LIMITS.vibration) {
          if(status !== GeneratorStatus.ALERT) {
            setStatus(GeneratorStatus.ALERT);
            addLog(`[ALERT] Operational limits exceeded! Temp: ${temperature.toFixed(1)}°C, Vib: ${vibration.toFixed(2)}mm/s`);
          }
        }
        
        return newMetrics;
      });
    };

    if (status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT) {
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(tick, SIMULATION_TICK_RATE);
      }
    } else if (status === GeneratorStatus.STOPPED) {
        clearTimeouts();
        setMetrics(INITIAL_METRICS);
        voltageRegulatorRef.current.reset();
    } else {
        clearTimeouts();
    }
    
    return () => clearTimeouts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, settings, addLog, calculateSynchronousSpeed, clearTimeouts]);


  return { status, metrics, settings, logs, start, stop, emergencyStop, updateSetting, acknowledgeAlert };
};
