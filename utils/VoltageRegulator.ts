
import { SIMULATION_TICK_RATE } from '../constants';

export class VoltageRegulation {
  private regulation_gain: number;
  private integral_gain: number;
  private derivative_gain: number;
  
  private integral: number = 0;
  private previousError: number = 0;
  private controlOutput: number = 0;
  
  constructor() {
    this.regulation_gain = 0.1;  // Proportional gain
    this.integral_gain = 0.05;   // Integral gain
    this.derivative_gain = 0.01; // Derivative gain
  }

  public regulateVoltage(measuredVoltage: number, setpointVoltage: number): number {
    const error = setpointVoltage - measuredVoltage;
    const deltaTime = SIMULATION_TICK_RATE / 1000;

    // Integral term with anti-windup
    this.integral += error * deltaTime;
    if (this.integral > 1) this.integral = 1;
    if (this.integral < -1) this.integral = -1;

    const derivative = (error - this.previousError) / deltaTime;
    
    const proportionalTerm = this.regulation_gain * error;
    const integralTerm = this.integral_gain * this.integral;
    const derivativeTerm = this.derivative_gain * derivative;

    this.controlOutput = proportionalTerm + integralTerm + derivativeTerm;
    
    this.previousError = error;

    // Clamp the output to prevent excessive correction
    const maxCorrection = 0.1; // 0.1 kV
    return Math.max(-maxCorrection, Math.min(maxCorrection, this.controlOutput));
  }
  
  public getControlOutput(): number {
    return this.controlOutput;
  }

  public reset() {
    this.integral = 0;
    this.previousError = 0;
    this.controlOutput = 0;
  }
}
