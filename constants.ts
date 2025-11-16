
import { GeneratorMetrics, GeneratorSettings, GeneratorStatus } from './types';

export const SIMULATION_TICK_RATE = 1000; // ms

export const GENERATOR_PARAMS = {
  power: { min: 5, max: 800, unit: 'MW' },
  voltage: { min: 6.3, max: 18, unit: 'kV' },
  frequency: { min: 50, max: 60, unit: 'Hz' },
  poles: 24,
  efficiency: 0.988,
  powerFactor: 0.9
};

export const OPERATIONAL_LIMITS = {
  temperature: 120, // °C
  vibration: 2.0, // mm/s
  voltageTolerance: 0.05, // ±5%
  frequencyTolerance: 0.01 // ±1%
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
};

export const INITIAL_SETTINGS: GeneratorSettings = {
  targetPower: 400,
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
};

export const START_SEQUENCE = [
  "Verify all systems are ready",
  "Check lubrication system pressure...",
  "Check cooling system flow...",
  "Verify excitation system status...",
  "Start generator motor...",
  "Synchronizing to grid...",
  "Load to 25% capacity...",
  "Stabilizing operation...",
  "Generator is now online and RUNNING."
];

export const STOP_SEQUENCE = [
  "Reducing load to minimum...",
  "Opening circuit breaker...",
  "Disconnecting from grid...",
  "Reducing excitation to minimum...",
  "Stopping generator motor...",
  "Closing excitation system...",
  "Stopping auxiliary systems...",
  "Post-stop checks complete.",
  "Generator is now STOPPED."
];

export const EMERGENCY_STOP_SEQUENCE = [
  "!!! EMERGENCY STOP ACTIVATED !!!",
  "Opening circuit breaker immediately...",
  "Disconnecting from grid...",
  "Reducing excitation to zero...",
  "Applying generator brakes...",
  "Activating emergency cooling...",
  "Generator is now STOPPED."
];
