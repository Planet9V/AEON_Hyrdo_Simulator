
export enum GeneratorStatus {
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  STOPPING = 'STOPPING',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
  ALERT = 'ALERT',
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
}

export interface GeneratorSettings {
  targetPower: number;
  targetVoltage: number;
  targetFrequency: number;
}
