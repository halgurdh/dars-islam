import type { ChipDefinition } from './types';

export const SCENE_WIDTH = 1280;
export const SCENE_HEIGHT = 720;
export const PLAYER_MAX_HP = 320;
export const ENEMY_MAX_HP = 420;
export const CUSTOM_GAUGE_MAX = 10000;
export const PLAYER_MOVE_MS = 85;
export const ENEMY_MOVE_MS = 95;

export const CHIP_LIBRARY: ChipDefinition[] = [
  {
    id: 'cannon',
    name: 'Cannon',
    damage: 40,
    color: 0xffc857,
    accent: 0xfff2a7,
    description: 'Heavy plasma round with screen shake.',
  },
  {
    id: 'wide-sword',
    name: 'WideSword',
    damage: 80,
    color: 0x52ff9f,
    accent: 0xb8ffd3,
    description: 'Vertical slash covering 3 rows ahead.',
  },
  {
    id: 'area-grab',
    name: 'AreaGrab',
    damage: 0,
    color: 0xf4c95d,
    accent: 0xffefb4,
    description: 'Steal the nearest enemy column for 10 sec.',
  },
];
