import Phaser from 'phaser';
import * as THREE from 'three';
import type { CarStats, RaceInput } from '../types';

export interface PhysicsBody {
  applyForce?: (x: number, y: number, z: number) => void;
  setLinearVelocity?: (x: number, y: number, z: number) => void;
  setAngularVelocity?: (x: number, y: number, z: number) => void;
  setLinearFactor?: (x: number, y: number, z: number) => void;
  setAngularFactor?: (x: number, y: number, z: number) => void;
}

export interface Enable3DThird {
  physics: {
    add: {
      existing: (object: THREE.Object3D, options: {
        shape: 'box';
        width: number;
        height: number;
        depth: number;
        mass: number;
      }) => void;
    };
  };
}

type BodyObject = THREE.Group & { body?: PhysicsBody };

export class CarPhysics {
  private readonly body?: PhysicsBody;
  private readonly velocity = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();

  constructor(third: Enable3DThird, private readonly carGroup: THREE.Group, private readonly stats: CarStats) {
    third.physics.add.existing(carGroup, { shape: 'box', width: 1.8, height: 0.5, depth: 4.2, mass: 800 });
    this.body = (carGroup as BodyObject).body;
    this.body?.setLinearFactor?.(1, 0, 1);
    this.body?.setAngularFactor?.(0, 1, 0);
    this.carGroup.position.set(0, 0.75, -16);
    this.carGroup.rotation.set(0, 0, 0);
  }

  update(delta: number, input: RaceInput): void {
    const seconds = Math.min(delta / 1000, 0.05);
    this.carGroup.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.right.set(this.forward.z, 0, -this.forward.x).normalize();

    const acceleration = input.throttle * this.stats.acceleration * 18;
    this.velocity.addScaledVector(this.forward, acceleration * seconds);

    if (input.brake) {
      this.velocity.multiplyScalar(Math.max(0, 1 - this.stats.braking * 3.5 * seconds));
    }

    const lateralSpeed = this.velocity.dot(this.right);
    const lateralDamping = input.handbrake ? 0.4 : 0.86;
    this.velocity.addScaledVector(this.right, -lateralSpeed * (1 - lateralDamping));

    this.velocity.multiplyScalar(Math.max(0, 1 - 0.45 * seconds));
    const maxSpeed = this.stats.topSpeed / 3.6;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.setLength(maxSpeed);
    }

    const speedFactor = Phaser.Math.Clamp(this.velocity.length() / 12, 0.25, 1.4);
    this.carGroup.rotation.y -= input.steer * this.stats.handling * delta * 0.003 * speedFactor;
    this.carGroup.position.addScaledVector(this.velocity, seconds);
    this.carGroup.position.y = 0.75;

    if (this.body) {
      this.body.setLinearVelocity?.(this.velocity.x, 0, this.velocity.z);
      this.body.setAngularVelocity?.(0, -input.steer * this.stats.handling * speedFactor, 0);
    }
  }

  getSpeedKph(): number {
    return this.velocity.length() * 3.6;
  }

  getPosition(): THREE.Vector3 {
    return this.carGroup.position;
  }
}
