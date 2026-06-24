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
    effectValue: 40,
    effectLabel: '40 DMG',
    color: 0xffc857,
    accent: 0xfff2a7,
    code: 'A',
    allowedCodes: ['A', 'B', 'C', '*'],
    iconShape: 'circle',
    description: 'Heavy plasma round with screen shake.',
  },
  {
    id: 'wide-sword',
    name: 'WideSword',
    damage: 80,
    effectValue: 80,
    effectLabel: '80 DMG',
    color: 0x52ff9f,
    accent: 0xb8ffd3,
    code: 'B',
    allowedCodes: ['B', 'C', '*'],
    iconShape: 'triangle',
    description: 'Vertical slash covering 3 rows ahead.',
  },
  {
    id: 'area-grab',
    name: 'AreaGrab',
    damage: 0,
    effectValue: 1,
    effectLabel: 'STEAL',
    color: 0xf4c95d,
    accent: 0xffefb4,
    code: '*',
    allowedCodes: ['A', '*'],
    iconShape: 'square',
    description: 'Steal the nearest enemy column for 10 sec.',
  },
  {
    id: 'recovery',
    name: 'Recovery',
    damage: 0,
    effectValue: 80,
    effectLabel: '80 HP',
    color: 0x7dd3fc,
    accent: 0xd8f3ff,
    code: 'C',
    allowedCodes: ['B', 'C', '*'],
    iconShape: 'diamond',
    description: 'Restore operator health and steady the line.',
  },
];
