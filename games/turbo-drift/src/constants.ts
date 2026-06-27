import type { BumperStyle, HoodStyle, SpoilerStyle, UpgradeTier } from './types';

export const WORLD = {
  width: 1280,
  height: 720,
  trackRadiusX: 34,
  trackRadiusZ: 24,
  segmentCount: 20,
  lapsToWin: 3,
};

export const CAR_COLORS = {
  hatchback: 0xff6b35,
  sedan: 0x00d4ff,
  neon: 0xff00ff,
};

export const UPGRADE_TIERS: Record<UpgradeTier['id'], UpgradeTier> = {
  hatchback: {
    id: 'hatchback',
    label: 'Hatchback',
    stats: { topSpeed: 145, acceleration: 8.5, handling: 1.2, braking: 0.9 },
    unlockCost: 0,
    unlockTimeMs: 0,
  },
  sedan: {
    id: 'sedan',
    label: 'Sedan',
    stats: { topSpeed: 178, acceleration: 10.2, handling: 1.05, braking: 1.05 },
    unlockCost: 5000,
    unlockTimeMs: 30 * 60 * 1000,
  },
};

export const BUMPER_OPTIONS: Array<{ style: BumperStyle; label: string; cost: number }> = [
  { style: 'stock', label: 'Stock', cost: 0 },
  { style: 'street', label: 'Street', cost: 350 },
  { style: 'race', label: 'Race', cost: 750 },
];

export const HOOD_OPTIONS: Array<{ style: HoodStyle; label: string; cost: number }> = [
  { style: 'stock', label: 'Stock', cost: 0 },
  { style: 'vented', label: 'Vented', cost: 450 },
  { style: 'carbon', label: 'Carbon', cost: 900 },
];

export const SPOILER_OPTIONS: Array<{ style: SpoilerStyle; label: string; cost: number }> = [
  { style: 'none', label: 'None', cost: 0 },
  { style: 'lip', label: 'Lip', cost: 400 },
  { style: 'wing', label: 'Wing', cost: 1000 },
];
