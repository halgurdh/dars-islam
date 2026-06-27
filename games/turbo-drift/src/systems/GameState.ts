import { ArcadeStore } from '@shared/arcade-store';
import { CAR_COLORS, UPGRADE_TIERS } from '../constants';
import type {
  BumperStyle,
  CarConfig,
  CarCustomization,
  CustomizablePart,
  GameStateData,
  HoodStyle,
  SpoilerStyle,
} from '../types';

const STORAGE_KEY = 'turbo-drift:state';

const DEFAULT_CUSTOMIZATION: CarCustomization = {
  bodyColor: CAR_COLORS.hatchback,
  neonColor: CAR_COLORS.neon,
  bumper: 'stock',
  hood: 'stock',
  spoiler: 'none',
};

type StoredState = Partial<GameStateData>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBumperStyle(value: unknown): value is BumperStyle {
  return value === 'stock' || value === 'street' || value === 'race';
}

function isHoodStyle(value: unknown): value is HoodStyle {
  return value === 'stock' || value === 'vented' || value === 'carbon';
}

function isSpoilerStyle(value: unknown): value is SpoilerStyle {
  return value === 'none' || value === 'lip' || value === 'wing';
}

function readCustomization(value: unknown): CarCustomization {
  if (!isRecord(value)) {
    return { ...DEFAULT_CUSTOMIZATION };
  }

  return {
    bodyColor: typeof value.bodyColor === 'number' ? value.bodyColor : DEFAULT_CUSTOMIZATION.bodyColor,
    neonColor: typeof value.neonColor === 'number' ? value.neonColor : DEFAULT_CUSTOMIZATION.neonColor,
    bumper: isBumperStyle(value.bumper) ? value.bumper : DEFAULT_CUSTOMIZATION.bumper,
    hood: isHoodStyle(value.hood) ? value.hood : DEFAULT_CUSTOMIZATION.hood,
    spoiler: isSpoilerStyle(value.spoiler) ? value.spoiler : DEFAULT_CUSTOMIZATION.spoiler,
  };
}

class TurboGameState {
  private data: GameStateData = this.createDefaultState();

  load(): GameStateData {
    let stored: StoredState = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        stored = isRecord(parsed) ? parsed : {};
      }
    } catch {
      stored = {};
    }

    this.data = {
      currency: ArcadeStore.getCoins(),
      playTimeMs: typeof stored.playTimeMs === 'number' ? stored.playTimeMs : 0,
      currentTier: stored.currentTier === 'sedan' ? 'sedan' : 'hatchback',
      customization: readCustomization(stored.customization),
      bestLapMs: typeof stored.bestLapMs === 'number' ? stored.bestLapMs : null,
    };

    if (this.data.currentTier === 'sedan' && this.data.customization.bodyColor === CAR_COLORS.hatchback) {
      this.data.customization.bodyColor = CAR_COLORS.sedan;
    }

    this.save();
    return this.getData();
  }

  save(): void {
    this.data.currency = ArcadeStore.getCoins();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getData(): GameStateData {
    this.data.currency = ArcadeStore.getCoins();
    return {
      ...this.data,
      customization: { ...this.data.customization },
    };
  }

  getCarConfig(): CarConfig {
    const state = this.getData();
    return {
      carClass: state.currentTier,
      stats: UPGRADE_TIERS[state.currentTier].stats,
      customization: { ...state.customization },
    };
  }

  addPlayTime(deltaMs: number): void {
    this.data.playTimeMs += Math.max(0, deltaMs);
    this.save();
  }

  canUnlockSedanByTime(): boolean {
    return this.data.playTimeMs >= UPGRADE_TIERS.sedan.unlockTimeMs;
  }

  canUnlockSedanByCurrency(): boolean {
    return ArcadeStore.getCoins() >= UPGRADE_TIERS.sedan.unlockCost;
  }

  unlockSedan(): boolean {
    if (this.data.currentTier === 'sedan') {
      return true;
    }

    if (!this.canUnlockSedanByTime() && !this.canUnlockSedanByCurrency()) {
      return false;
    }

    if (!ArcadeStore.spendCoins(UPGRADE_TIERS.sedan.unlockCost)) {
      return false;
    }

    this.data.currentTier = 'sedan';
    this.data.customization.bodyColor = CAR_COLORS.sedan;
    this.save();
    return true;
  }

  setCustomization<TPart extends CustomizablePart>(
    part: TPart,
    value: TPart extends 'bumper' ? BumperStyle : TPart extends 'hood' ? HoodStyle : SpoilerStyle,
  ): void {
    if (part === 'bumper') {
      this.data.customization.bumper = value as BumperStyle;
    } else if (part === 'hood') {
      this.data.customization.hood = value as HoodStyle;
    } else {
      this.data.customization.spoiler = value as SpoilerStyle;
    }
    this.save();
  }

  getBestLap(): number | null {
    return this.data.bestLapMs;
  }

  setBestLap(ms: number): void {
    if (this.data.bestLapMs === null || ms < this.data.bestLapMs) {
      this.data.bestLapMs = ms;
      this.save();
    }
  }

  private createDefaultState(): GameStateData {
    return {
      currency: ArcadeStore.getCoins(),
      playTimeMs: 0,
      currentTier: 'hatchback',
      customization: { ...DEFAULT_CUSTOMIZATION },
      bestLapMs: null,
    };
  }
}

export const GameState = new TurboGameState();
