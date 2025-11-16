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

  const calculateSynchronousSpeed = useCallback((frequency: number): number => {
    return (120 * frequency) / GENERATOR_PARAMS.poles;
  }, []);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs.slice(0, 199)]);
  }, []);

  const runSequence = useCallback((sequence: string[], finalStatus: GeneratorStatus, onComplete?: () => void) => {
    if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
    }
    let step = 0;
    const runNextStep = () => {
      if (step < sequence.length) {
        addLog(sequence[step]);
        step++;
        sequenceTimeoutRef.current = window.setTimeout(runNextStep, 1500);
      } else {
        sequenceTimeoutRef.current = null;
        setStatus(finalStatus);
        if (onComplete) {
            onComplete();
        }
      }
    };
    runNextStep();
  }, [addLog]);

  const emergencyStop = useCallback((reason?: string) => {
    setStatus(currentStatus => {
        if (currentStatus !== GeneratorStatus.STOPPED && currentStatus !== GeneratorStatus.EMERGENCY_STOP) {
            if (reason) addLog(`[SYSTEM] ${reason}`);
            
            if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (gridFaultDecayRef.current) clearTimeout(gridFaultDecayRef.current);
            intervalRef.current = null;
            sequenceTimeoutRef.current = null;
            gridFaultDecayRef.current = null;

            runSequence(EMERGENCY_STOP_SEQUENCE, GeneratorStatus.STOPPED, () => {
                setMetrics(INITIAL_METRICS);
                voltageRegulatorRef.current.reset();
            });
            return GeneratorStatus.EMERGENCY_STOP;
        }
        return currentStatus;
    });
  }, [addLog, runSequence]);

  const resetFaults = useCallback(() => {
    let wasCommsLoss = false;
    setCommsLossActive(prev => {
      wasCommsLoss = prev;
      return false;
    });
    
    setGridFaultActive(false);
    setTrashRackClogged(false);

    if (gridFaultDecayRef.current) clearTimeout(gridFaultDecayRef.current);
    gridFaultDecayRef.current = null;

    setSettings(prev => ({...prev, targetFrequency: INITIAL_SETTINGS.targetFrequency}));

    setStatus(currentStatus => {
        if(wasCommsLoss && currentStatus === GeneratorStatus.COMMS_LOSS) {
            return GeneratorStatus.RUNNING;
        }
        return currentStatus;
    });

    addLog('[SYSTEM] All fault conditions cleared.');
  }, [addLog]);

  const start = useCallback(() => {
    setStatus(currentStatus => {
        if (currentStatus === GeneratorStatus.STOPPED) {
            resetFaults();
            setMetrics(INITIAL_METRICS);
            voltageRegulatorRef.current.reset();
            setSettings(prev => ({...prev, intakeGatePosition: 100, guideVanePosition: 25}));
            runSequence(START_SEQUENCE, GeneratorStatus.RUNNING);
            return GeneratorStatus.STARTING;
        }
        return currentStatus;
    });
  }, [runSequence, resetFaults]);

  const stop = useCallback(() => {
    setStatus(currentStatus => {
        if (currentStatus === GeneratorStatus.RUNNING || currentStatus === GeneratorStatus.ALERT || currentStatus === GeneratorStatus.COMMS_LOSS) {
            setSettings(prev => ({...prev, guideVanePosition: 0}));
            runSequence(STOP_SEQUENCE, GeneratorStatus.STOPPED, () => {
                setMetrics(INITIAL_METRICS);
                voltageRegulatorRef.current.reset();
            });
            return GeneratorStatus.STOPPING;
        }
        return currentStatus;
    });
  }, [runSequence]);

  const updateSetting = useCallback((key: keyof GeneratorSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const acknowledgeAlert = useCallback(() => {
    setStatus(currentStatus => {
        if (currentStatus === GeneratorStatus.ALERT) {
            addLog('[SYSTEM] Alert acknowledged by operator.');
            return GeneratorStatus.RUNNING;
        }
        return currentStatus;
    });
  }, [addLog]);

  const triggerGridFault = useCallback(() => {
    setStatus(s => {
      if (s !== GeneratorStatus.RUNNING && s !== GeneratorStatus.ALERT) return s;
      addLog('[SCENARIO] Simulating major grid fault (generation loss).');
      setGridFaultActive(true);
      
      if (gridFaultDecayRef.current) clearTimeout(gridFaultDecayRef.current);
      gridFaultDecayRef.current = window.setTimeout(() => {
          setGridFaultActive(false);
          addLog('[SYSTEM] Grid stabilizing after fault.');
      }, 10000);
      return s;
    });
  }, [addLog]);

  const toggleTrashRackClogging = useCallback(() => {
    setStatus(s => {
      if (s !== GeneratorStatus.RUNNING && s !== GeneratorStatus.ALERT) return s;
      setTrashRackClogged(currentClogState => {
        const newClogState = !currentClogState;
        if(newClogState) {
            addLog('[SCENARIO] Simulating trash rack clogging. Reduced water flow.');
        } else {
            addLog('[SYSTEM] Trash rack cleaned. Water flow restored.');
        }
        return newClogState;
      });
      return s;
    });
  }, [addLog]);

  const toggleCommsLoss = useCallback(() => {
    setStatus(currentStatus => {
        if (currentStatus === GeneratorStatus.RUNNING || currentStatus === GeneratorStatus.ALERT) {
            setCommsLossActive(true);
            addLog('[SCENARIO] Simulating SCADA communication loss. HMI data is frozen!');
            return GeneratorStatus.COMMS_LOSS;
        } else if (currentStatus === GeneratorStatus.COMMS_LOSS) {
             setCommsLossActive(false);
             addLog('[SYSTEM] SCADA communications restored.');
             return GeneratorStatus.RUNNING;
        }
        return currentStatus;
    });
  }, [addLog]);

  useEffect(() => {
    const isSimRunning = status === GeneratorStatus.RUNNING || status === GeneratorStatus.ALERT || status === GeneratorStatus.COMMS_LOSS;

    if (!isSimRunning && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    if (isSimRunning && !intervalRef.current) {
      const tick = () => {
        setMetrics(prev => {
          const lastFrequency = prev.frequency === 0 ? settings.targetFrequency : prev.frequency;
          
          let currentTargetFrequency = settings.targetFrequency;
          if(isGridFaultActive) {
              currentTargetFrequency -= 0.2; // Frequency drops during grid fault
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
          
          const powerFactor = Math.max(0.85, Math.min(0.99, GENERATOR_PARAMS.powerFactor + (Math.random() - 0.5) * 0.05));

          const current = (voltage > 0) ? (power * 1e6) / (Math.sqrt(3) * voltage * 1000 * powerFactor * GENERATOR_PARAMS.efficiency) : 0;

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
              powerFactor: parseFloat(powerFactor.toFixed(2)),
          };

          if (temperature > OPERATIONAL_LIMITS.temperature || vibration > OPERATIONAL_LIMITS.vibration) {
             setStatus(currentStatus => {
                if (currentStatus !== GeneratorStatus.ALERT) {
                    addLog(`[ALERT] Operational limits exceeded! Temp: ${temperature.toFixed(1)}°C, Vib: ${vibration.toFixed(2)}mm/s`);
                    return GeneratorStatus.ALERT;
                }
                return currentStatus;
            });
          }
          
          if (rocf < OPERATIONAL_LIMITS.rocf) {
              emergencyStop(`GRID INSTABILITY - RoCoF at ${rocf.toFixed(2)} Hz/s exceeded critical limit of ${OPERATIONAL_LIMITS.rocf} Hz/s.`);
              setStatus(GeneratorStatus.GRID_UNSTABLE);
          }
          
          return newMetrics;
        });
      };
      
      intervalRef.current = window.setInterval(tick, SIMULATION_TICK_RATE);
    } 
    
    return () => {
      // ONLY clear the main simulation interval.
      // Do NOT clear the sequenceTimeoutRef here, as this effect can re-run
      // during a sequence and prematurely cancel it.
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, start, stop, emergencyStop, addLog, runSequence, calculateSynchronousSpeed, isGridFaultActive, isTrashRackClogged, settings]);


  useEffect(() => {
    if (!isCommsLossActive) {
      setDisplayedMetrics(metrics);
    }
  }, [metrics, isCommsLossActive]);

  const stableActions = {
      triggerGridFault,
      toggleTrashRackClogging,
      toggleCommsLoss,
      resetFaults
  };

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
    actions: stableActions
  };
};