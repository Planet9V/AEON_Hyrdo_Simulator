
import { GeneratorMetrics, GeneratorSettings, GeneratorStatus } from './types';

export const SIMULATION_TICK_RATE = 1000; // ms

export const GENERATOR_PARAMS = {
  power: { min: 5, max: 800, unit: 'MW' },
  voltage: { min: 6.3, max: 18, unit: 'kV' },
  frequency: { min: 50, max: 60, unit: 'Hz' },
  waterHead: { min: 40, max: 700, unit: 'm'},
  gatePosition: { min: 0, max: 100, unit: '%'},
  vanePosition: { min: 0, max: 100, unit: '%'},
  poles: 24,
  efficiency: 0.988,
  powerFactor: 0.9,
  waterDensity: 1000, // kg/m³
  gravity: 9.81, // m/s²
};

export const OPERATIONAL_LIMITS = {
  temperature: 120, // °C
  vibration: 2.0, // mm/s
  voltageTolerance: 0.05, // ±5%
  frequencyTolerance: 0.01, // ±1%
  rocf: -1.0, // Hz/s, critical threshold for trip
};

export const INITIAL_METRICS: GeneratorMetrics = {
  power: 0,
  voltage: 0,
  frequency: 0,
  temperature: 25,
  vibration: 0,
  speed: 0,
  torque: 0,
  current: 0,
  efficiency: 0,
  excitationCurrent: 0,
  rocf: 0,
  powerFactor: 0.9,
};

export const INITIAL_SETTINGS: GeneratorSettings = {
  waterHead: 350,
  intakeGatePosition: 0,
  guideVanePosition: 0,
  targetVoltage: 13.8,
  targetFrequency: 60,
};

export const STATUS_STYLES: Record<GeneratorStatus, { text: string; bg: string; ring: string }> = {
  [GeneratorStatus.STOPPED]: { text: 'text-gray-300', bg: 'bg-gray-700', ring: 'ring-gray-500' },
  [GeneratorStatus.STARTING]: { text: 'text-blue-300', bg: 'bg-blue-700', ring: 'ring-blue-500' },
  [GeneratorStatus.RUNNING]: { text: 'text-green-300', bg: 'bg-green-700', ring: 'ring-green-500' },
  [GeneratorStatus.STOPPING]: { text: 'text-yellow-300', bg: 'bg-yellow-700', ring: 'ring-yellow-500' },
  [GeneratorStatus.EMERGENCY_STOP]: { text: 'text-red-300', bg: 'bg-red-800', ring: 'ring-red-600' },
  [GeneratorStatus.ALERT]: { text: 'text-red-300', bg: 'bg-red-700', ring: 'ring-red-500' },
  [GeneratorStatus.GRID_UNSTABLE]: { text: 'text-red-300', bg: 'bg-red-900', ring: 'ring-red-700' },
  [GeneratorStatus.COMMS_LOSS]: { text: 'text-orange-300', bg: 'bg-orange-800', ring: 'ring-orange-600' },
};

export const START_SEQUENCE = [
  "Verify all systems are ready for startup.",
  "Check lubrication system pressure: OK.",
  "Check cooling system flow: OK.",
  "Verify excitation system status: STANDBY.",
  "Opening intake gates to 10%...",
  "Starting turbine motor...",
  "Turbine accelerating to synchronous speed...",
  "Synchronizing generator to grid...",
  "[IEC 61850 MMS] Sending close command to circuit breaker.",
  "Circuit breaker closed. Generator is online.",
  "Increasing guide vane opening to 25%...",
  "Load increasing to minimum level.",
  "Stabilizing operation. All parameters nominal.",
  "Generator is now online and RUNNING."
];

export const STOP_SEQUENCE = [
  "Initiating controlled shutdown sequence.",
  "Reducing load to minimum (5%).",
  "Closing guide vanes...",
  "[IEC 61850 MMS] Sending open command to circuit breaker.",
  "Opening circuit breaker. Disconnecting from grid.",
  "Reducing excitation to minimum.",
  "Applying generator brakes.",
  "Stopping generator motor...",
  "Closing intake gates.",
  "Stopping auxiliary systems (lubrication, cooling).",
  "Post-stop checks complete.",
  "Generator is now STOPPED."
];

export const EMERGENCY_STOP_SEQUENCE = [
  "!!! EMERGENCY STOP ACTIVATED !!!",
  "[IEC 61850 GOOSE] High-priority trip signal sent.",
  "Opening circuit breaker immediately...",
  "Disconnecting from grid...",
  "Reducing excitation to zero...",
  "Applying generator brakes...",
  "Activating emergency cooling systems...",
  "Generator is now STOPPED."
];