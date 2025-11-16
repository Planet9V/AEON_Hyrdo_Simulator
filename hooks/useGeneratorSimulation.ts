
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
  const [displayedMetrics, setDisplayedMetrics] = useState<GeneratorMetrics>(INITIAL_METRICS);
  const [settings, setSettings] = useState<GeneratorSettings>(INITIAL_SETTINGS);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Simulator initialized. Awaiting commands.']);

  // Fault states
  const [isGridFaultActive, setGridFaultActive] = useState(false);
  const [isTrashRackClogged, setTrashRackClogged] = useState(false);
  const [isCommsLossActive, setCommsLossActive] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const sequenceTimeoutRef = useRef<number | null>(null);
  const voltageRegulatorRef = useRef(new VoltageRegulation());
  const gridFaultDecayRef = useRef<number | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs.slice(0, 199)]);
  }, []);

  const clearTimeouts = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (gridFaultDecayRef.current) clearTimeout(gridFaultDecayRef.current);
    intervalRef.current = null;
    sequenceTimeoutRef.current = null;
    gridFaultDecayRef.current = null;
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

  const emergencyStop = useCallback((reason?: string) => {
    if (status !== GeneratorStatus.STOPPED) {
      clearTimeouts();
      if(reason) addLog(`[SYSTEM] ${reason}`);
      setStatus(GeneratorStatus.EMERGENCY_STOP);
      runSequence(EMERGENCY_STOP_SEQUENCE, GeneratorStatus.STOPPED);
    }
  }, [status, clearTimeouts, runSequence, addLog]);

  const start = useCallback(() => {
    if (status === GeneratorStatus.STOPPED) {
      clearTimeouts();
      voltageRegulatorRef.current.reset();
      setSettings(prev => ({...prev, intakeGatePosition: 100, guideVanePosition: 25}));
      setStatus(GeneratorStatus.STARTING);
      runSequence(START_SEQUENCE, GeneratorStatus.RUNNING);
    }
  }, [status, clearTimeouts, runSequence]);

  const stop = useCallback(() => {
    if (status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT) {
      clearTimeouts();
      setSettings(prev => ({...prev, guideVanePosition: 0}));
      setStatus(GeneratorStatus.STOPPING);
      runSequence(STOP_SEQUENCE, GeneratorStatus.STOPPED);
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

  const resetFaults = useCallback(() => {
    setGridFaultActive(false);
    setTrashRackClogged(false);
    setCommsLossActive(false);
    if (gridFaultDecayRef.current) clearTimeout(gridFaultDecayRef.current);
    setSettings(prev => ({...prev, targetFrequency: INITIAL_SETTINGS.targetFrequency}));
    addLog('[SYSTEM] All fault conditions cleared.');
  }, [addLog]);

  const triggerGridFault = useCallback(() => {
    if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT) return;
    addLog('[SCENARIO] Simulating major grid fault (generation loss).');
    setGridFaultActive(true);
    
    // Simulate frequency decay
    gridFaultDecayRef.current = window.setTimeout(() => {
        setGridFaultActive(false);
        addLog('[SYSTEM] Grid stabilizing after fault.');
    }, 10000); // Fault lasts for 10 seconds
  }, [status, addLog]);

  const toggleTrashRackClogging = useCallback(() => {
    if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT) return;
    const newClogState = !isTrashRackClogged;
    setTrashRackClogged(newClogState);
    if(newClogState) {
        addLog('[SCENARIO] Simulating trash rack clogging. Reduced water flow.');
    } else {
        addLog('[SYSTEM] Trash rack cleaned. Water flow restored.');
    }
  }, [status, addLog, isTrashRackClogged]);

  const toggleCommsLoss = useCallback(() => {
    if (status !== GeneratorStatus.RUNNING && status !== GeneratorStatus.ALERT) return;
    const newCommsLossState = !isCommsLossActive;
    setCommsLossActive(newCommsLossState);
     if (newCommsLossState) {
      setStatus(GeneratorStatus.COMMS_LOSS);
      addLog('[SCENARIO] Simulating SCADA communication loss. HMI data is frozen!');
    } else {
      setStatus(GeneratorStatus.RUNNING);
      addLog('[SYSTEM] SCADA communication restored.');
    }
  }, [status, addLog, isCommsLossActive]);

  useEffect(() => {
    const tick = () => {
      setMetrics(prev => {
        const lastFrequency = prev.frequency === 0 ? settings.targetFrequency : prev.frequency;
        
        let currentTargetFrequency = settings.targetFrequency;
        if(isGridFaultActive) {
            currentTargetFrequency -= 0.2; // Frequency drops during grid fault
            setSettings(s => ({...s, targetFrequency: currentTargetFrequency}));
        }

        const targetSpeed = calculateSynchronousSpeed(currentTargetFrequency);
        const speed = targetSpeed + (Math.random() - 0.5) * (targetSpeed * 0.005);
        
        const clogFactor = isTrashRackClogged ? 0.6 : 1.0;
        const flowRate = (settings.intakeGatePosition / 100) * (settings.guideVanePosition / 100) * (settings.waterHead / 10) * clogFactor;
        
        const potentialPower = (GENERATOR_PARAMS.waterDensity * GENERATOR_PARAMS.gravity * flowRate * settings.waterHead * GENERATOR_PARAMS.efficiency) / 1e6;
        const power = Math.max(0, Math.min(potentialPower, GENERATOR_PARAMS.power.max));

        const voltageFluctuation = (Math.random() - 0.5) * (settings.targetVoltage * 0.02);
        const measuredVoltage = prev.voltage === 0 ? settings.targetVoltage : prev.voltage;
        const naturalVoltage = measuredVoltage + voltageFluctuation;

        const voltageCorrection = voltageRegulatorRef.current.regulateVoltage(naturalVoltage, settings.targetVoltage);
        const voltage = naturalVoltage + voltageCorrection;
        
        const excitationCurrent = Math.max(50, Math.min(500, 250 + voltageRegulatorRef.current.getControlOutput() * 500));

        const freqFluctuation = (Math.random() - 0.5) * (currentTargetFrequency * 0.002);
        const frequency = currentTargetFrequency + freqFluctuation;
        
        const rocf = frequency - lastFrequency;

        const angularVelocity = (2 * Math.PI * speed) / 60;
        const torque = angularVelocity > 0 ? (power * 1e6) / angularVelocity : 0;
        
        const current = (voltage > 0) ? (power * 1e6) / (Math.sqrt(3) * voltage * 1000 * GENERATOR_PARAMS.powerFactor * GENERATOR_PARAMS.efficiency) : 0;

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
            efficiency: parseFloat((power / GENERATOR_PARAMS.power.max * 98.8).toFixed(1)),
            excitationCurrent: parseFloat(excitationCurrent.toFixed(1)),
            rocf: parseFloat(rocf.toFixed(2)),
        };

        if (temperature > OPERATIONAL_LIMITS.temperature || vibration > OPERATIONAL_LIMITS.vibration) {
          if(status !== GeneratorStatus.ALERT) {
            setStatus(GeneratorStatus.ALERT);
            addLog(`[ALERT] Operational limits exceeded! Temp: ${temperature.toFixed(1)}°C, Vib: ${vibration.toFixed(2)}mm/s`);
          }
        }
        
        if (rocf < OPERATIONAL_LIMITS.rocf) {
            setStatus(GeneratorStatus.GRID_UNSTABLE);
            emergencyStop(`GRID INSTABILITY - RoCoF at ${rocf.toFixed(2)} Hz/s exceeded critical limit of ${OPERATIONAL_LIMITS.rocf} Hz/s.`);
        }
        
        return newMetrics;
      });
    };

    if (status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT || status === GeneratorStatus.COMMS_LOSS) {
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(tick, SIMULATION_TICK_RATE);
      }
    } else if (status === GeneratorStatus.STOPPED) {
        clearTimeouts();
        setMetrics(INITIAL_METRICS);
        resetFaults();
        voltageRegulatorRef.current.reset();
    } else {
        clearTimeouts();
    }
    
    return () => clearTimeouts();
  }, [status, settings, addLog, calculateSynchronousSpeed, clearTimeouts, isGridFaultActive, isTrashRackClogged, emergencyStop, resetFaults]);

  useEffect(() => {
    if (!isCommsLossActive) {
      setDisplayedMetrics(metrics);
    }
  }, [metrics, isCommsLossActive]);


  return { 
    status, 
    metrics: displayedMetrics, 
    settings, 
    logs, 
    start, 
    stop, 
    emergencyStop, 
    updateSetting, 
    acknowledgeAlert,
    isCommsLossActive,
    faults: {
      isGridFaultActive,
      isTrashRackClogged,
    },
    actions: {
      triggerGridFault,
      toggleTrashRackClogging,
      toggleCommsLoss,
      resetFaults
    }
  };
};
