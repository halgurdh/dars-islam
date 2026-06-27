import type { CarStats, RaceInput } from '../types';

export interface PhysicsState {
  x: number;
  z: number;
  heading: number; // radians — sin(heading)=fwdX, cos(heading)=fwdZ
  speed: number;   // m/s
  velX: number;
  velZ: number;
  driftFactor: number; // 0–1
}

export function createPhysicsState(startX = 0, startZ = 22, startHeading = Math.PI * 0.5): PhysicsState {
  return { x: startX, z: startZ, heading: startHeading, speed: 0, velX: 0, velZ: 0, driftFactor: 0 };
}

export function stepPhysics(
  state: PhysicsState,
  input: RaceInput,
  stats: CarStats,
  dt: number,
): PhysicsState {
  const maxSpeedMs = stats.topSpeed / 3.6;
  const isDrift = input.handbrake && state.speed > 3;

  const driftFactor = isDrift
    ? Math.min(state.driftFactor + dt * 3, 1)
    : Math.max(state.driftFactor - dt * 2, 0);

  const steerInput = isDrift ? input.steer * 1.6 : input.steer;
  const steerStrength = stats.handling * (0.9 + state.speed * 0.05);
  const speedFactor = Math.min(state.speed / 4, 1);
  const headingDelta = steerInput * steerStrength * dt * speedFactor;
  const heading = state.heading + headingDelta;

  let speed = state.speed;
  if (input.throttle > 0 && speed < maxSpeedMs) {
    speed += input.throttle * stats.acceleration * 8.8 * dt;
  }
  speed = Math.min(speed, maxSpeedMs);
  const drag = input.brake ? 0.94 : 0.985;
  speed *= Math.pow(drag, dt * 60);
  speed = Math.max(0, speed);

  const fwdX = Math.sin(heading);
  const fwdZ = Math.cos(heading);
  const friction = isDrift ? 0.28 : 0.62;
  const frictionLerp = Math.min(friction * dt * 60, 1);
  const velX = state.velX + (fwdX * speed - state.velX) * frictionLerp;
  const velZ = state.velZ + (fwdZ * speed - state.velZ) * frictionLerp;

  return {
    x: state.x + velX * dt,
    z: state.z + velZ * dt,
    heading,
    speed,
    velX,
    velZ,
    driftFactor,
  };
}

export function speedKmh(state: PhysicsState): number {
  return state.speed * 3.6;
}
