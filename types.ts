
export enum GeneratorStatus {
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  STOPPING = 'STOPPING',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
  ALERT = 'ALERT',
  GRID_UNSTABLE = 'GRID_UNSTABLE',
  COMMS_LOSS = 'COMMS_LOSS',
}

export interface GeneratorMetrics {
  power: number;
  voltage: number;
  frequency: number;
  temperature: number;
  vibration: number;
  speed: number;
  torque: number;
  current: number;
  efficiency: number;
  excitationCurrent: number;
  rocf: number; // Rate of Change of Frequency
  powerFactor: number;
}

export interface GeneratorSettings {
  waterHead: number; // in meters
  intakeGatePosition: number; // in %
  guideVanePosition: number; // in %
  targetVoltage: number;
  targetFrequency: number;
}