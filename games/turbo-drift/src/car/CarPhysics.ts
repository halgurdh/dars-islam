import * as THREE from 'three';
import type { CarStats, RaceInput } from '../types';

const DEFAULT_START = new THREE.Vector3(0, 0.72, -(24 - 2));

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class CarPhysics {
  private readonly velocity = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private heading = Math.PI;

  constructor(private readonly carGroup: THREE.Group, private readonly stats: CarStats) {
    this.reset();
  }

  reset(position: THREE.Vector3 = DEFAULT_START, heading = Math.PI): void {
    this.velocity.set(0, 0, 0);
    this.heading = heading;
    this.carGroup.position.copy(position);
    this.carGroup.rotation.set(0, heading, 0);
  }

  update(deltaMs: number, input: RaceInput): void {
    const dt = Math.min(deltaMs / 1000, 0.05);
    const speed = this.velocity.length();
    const steerStrength = clamp(input.steer * this.stats.handling * (0.9 + speed * 0.05), -2.4, 2.4);

    this.heading += steerStrength * dt;
    this.forward.set(-Math.sin(this.heading), 0, -Math.cos(this.heading));
    this.right.set(Math.cos(this.heading), 0, -Math.sin(this.heading));

    const forwardSpeed = this.velocity.dot(this.forward) + input.throttle * this.stats.acceleration * 8.8 * dt;
    const sidewaysSpeed = this.velocity.dot(this.right) * (input.handbrake ? 0.28 : 0.62);
    const drag = input.brake ? 0.94 : 0.985;

    const maxSpeed = this.stats.topSpeed / 3.6;
    const boundedForward = clamp(forwardSpeed * drag, -maxSpeed * 0.35, maxSpeed);

    this.velocity.copy(this.forward).multiplyScalar(boundedForward);
    this.velocity.addScaledVector(this.right, sidewaysSpeed);
    this.velocity.multiplyScalar(1 - dt * 0.15);

    if (this.velocity.length() > maxSpeed) {
      this.velocity.setLength(maxSpeed);
    }

    this.carGroup.rotation.y = this.heading;
    this.carGroup.position.addScaledVector(this.velocity, dt);
    this.carGroup.position.y = 0.72;
  }

  getSpeedKph(): number {
    return this.velocity.length() * 3.6;
  }

  getPosition(): THREE.Vector3 {
    return this.carGroup.position;
  }

  getHeading(): number {
    return this.heading;
  }
}
