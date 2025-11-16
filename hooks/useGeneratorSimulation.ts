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
            setMetrics(prev => ({ ...INITIAL_METRICS, speed: 0, frequency: 0 }));
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

    if (isSimRunning && !intervalRef.current) {
      const tick = () => {
        setMetrics(prev => {
          // --- REALISTIC PHYSICS MODEL ---
          const lastFrequency = prev.frequency;
          const deltaTime = SIMULATION_TICK_RATE / 1000;

          // 1. Calculate Mechanical Power (P_m) from hydraulics
          const clogFactor = isTrashRackClogged ? 0.6 : 1.0;
          const gateArea = (settings.intakeGatePosition / 100) * (settings.guideVanePosition / 100);
          const flowRate = gateArea * Math.sqrt(settings.waterHead) * GENERATOR_PARAMS.flowRateConstant * clogFactor;
          const mechanicalPower = (GENERATOR_PARAMS.waterDensity * GENERATOR_PARAMS.gravity * flowRate * settings.waterHead * GENERATOR_PARAMS.efficiency) / 1e6; // in MW

          // 2. Simulate Electrical Load (P_e)
          let gridLoad = GENERATOR_PARAMS.gridLoadNominal + (Math.random() - 0.5) * 10;
          if (isGridFaultActive) {
            gridLoad *= 1.2; // Sudden increase in load on remaining generators
          }
          // The actual power output is what the generator is currently supplying
          const electricalPower = prev.power;

          // 3. Power Balance Equation & Speed/Frequency Calculation
          // Power imbalance accelerates/decelerates the rotor
          const powerImbalance = mechanicalPower - electricalPower; // MW
          // Swing Equation: d(speed)/dt = (P_m - P_e) / (2 * H * S_base)
          const acceleration = powerImbalance / (2 * GENERATOR_PARAMS.inertia * GENERATOR_PARAMS.power.max) * (settings.targetFrequency); // in Hz/s for frequency
          
          let frequency = prev.frequency + (acceleration * deltaTime);
          frequency = Math.max(45, Math.min(65, frequency)); // Clamp frequency
          
          const speed = (120 * frequency) / GENERATOR_PARAMS.poles;
          const rocf = (frequency - lastFrequency) / deltaTime;
          
          // 4. Update other metrics based on new state
          const power = Math.max(0, Math.min(mechanicalPower, GENERATOR_PARAMS.power.max));

          // Voltage Regulation
          const voltageFluctuation = (Math.random() - 0.5) * (settings.targetVoltage * 0.02);
          const measuredVoltage = prev.voltage === 0 ? settings.targetVoltage : prev.voltage;
          // Voltage sags with higher current/power
          const voltageSag = (power / GENERATOR_PARAMS.power.max) * 0.2;
          const naturalVoltage = measuredVoltage + voltageFluctuation - voltageSag;
          const voltageCorrection = voltageRegulatorRef.current.regulateVoltage(naturalVoltage, settings.targetVoltage);
          const voltage = naturalVoltage + voltageCorrection;
          const excitationCurrent = Math.max(50, Math.min(500, 250 + voltageRegulatorRef.current.getControlOutput() * 500));
          
          // Other derived metrics
          const angularVelocity = (2 * Math.PI * speed) / 60;
          const torque = angularVelocity > 0 ? (power * 1e6) / angularVelocity : 0;
          const powerFactor = Math.max(0.85, Math.min(0.99, GENERATOR_PARAMS.powerFactor + (Math.random() - 0.5) * 0.05));
          const current = (voltage > 0) ? (power * 1e6) / (Math.sqrt(3) * voltage * 1000 * powerFactor) : 0;
          const tempIncrease = (current / 25000) * 0.1 + (power / GENERATOR_PARAMS.power.max) * 0.05;
          const temperature = Math.min(prev.temperature + tempIncrease - 0.05, OPERATIONAL_LIMITS.temperature + 10);
          const vibration = Math.abs(speed - ((120 * settings.targetFrequency) / GENERATOR_PARAMS.poles)) * 0.1 + (power / GENERATOR_PARAMS.power.max) + (Math.random() * 0.1);

          const newMetrics: GeneratorMetrics = {
              power: parseFloat(power.toFixed(2)),
              voltage: parseFloat(voltage.toFixed(2)),
              frequency: parseFloat(frequency.toFixed(3)),
              temperature: parseFloat(temperature.toFixed(1)),
              vibration: parseFloat(vibration.toFixed(2)),
              speed: parseFloat(speed.toFixed(1)),
              torque: parseFloat(torque.toFixed(0)),
              current: parseFloat(current.toFixed(1)),
              efficiency: parseFloat((power / Math.max(0.1, mechanicalPower) * 100).toFixed(1)),
              excitationCurrent: parseFloat(excitationCurrent.toFixed(1)),
              rocf: parseFloat(rocf.toFixed(2)),
              powerFactor: parseFloat(powerFactor.toFixed(2)),
              flowRate: parseFloat(flowRate.toFixed(2)),
          };
          
          // --- END PHYSICS MODEL ---

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
    } else if (!isSimRunning && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    
    // Cleanup function
    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
    return cleanup;
  }, [status, settings, isGridFaultActive, isTrashRackClogged, addLog, emergencyStop]);


  useEffect(() => {
    // Initialize speed and frequency when stopped
    if(status === GeneratorStatus.STOPPED) {
        setMetrics(m => ({...m, speed: 0, frequency: 0}));
    }
  }, [status]);


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