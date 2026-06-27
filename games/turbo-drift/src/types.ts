export type CarClass = 'hatchback' | 'sedan';
export type BumperStyle = 'stock' | 'street' | 'race';
export type HoodStyle = 'stock' | 'vented' | 'carbon';
export type SpoilerStyle = 'none' | 'lip' | 'wing';

export interface CarCustomization {
  bodyColor: number;
  neonColor: number;
  bumper: BumperStyle;
  hood: HoodStyle;
  spoiler: SpoilerStyle;
}

export interface CarStats {
  topSpeed: number;
  acceleration: number;
  handling: number;
  braking: number;
}

export interface CarConfig {
  carClass: CarClass;
  stats: CarStats;
  customization: CarCustomization;
}

export interface GameStateData {
  currency: number;
  playTimeMs: number;
  currentTier: CarClass;
  customization: CarCustomization;
  bestLapMs: number | null;
}

export interface UpgradeTier {
  id: CarClass;
  label: string;
  stats: CarStats;
  unlockCost: number;
  unlockTimeMs: number;
}

export type CustomizablePart = 'bumper' | 'hood' | 'spoiler';

export interface RaceInput {
  throttle: number;
  brake: boolean;
  steer: number;
  handbrake: boolean;
}
