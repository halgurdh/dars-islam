export const PLAYER_COLUMN_WIDTH = 384;
export const PLAYER_ROW_STARTS = [0, 205, 410, 614, 819];
export const PLAYER_ROW_HEIGHTS = [205, 205, 204, 205, 205];
export const MANUAL_SHEET_COLUMNS = 4;
export const COMBAT_CELL_HEIGHT = 256;
export type TextureKey = 'sprite1' | 'sprite2';

export type ManualFrameDefinition = {
  name: string;
  tex: TextureKey;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX?: number;
  anchorY: number;
};

const PLAYER_SCANNED_FRAMES = [
  [{ x: 356, y: 45, width: 135, height: 189 }, { x: 563, y: 45, width: 131, height: 189 }, { x: 764, y: 45, width: 137, height: 188 }, { x: 963, y: 45, width: 135, height: 189 }],
  [{ x: 329, y: 280, width: 160, height: 132 }, { x: 517, y: 280, width: 200, height: 132 }, { x: 717, y: 280, width: 177, height: 132 }, { x: 920, y: 280, width: 174, height: 132 }],
  [{ x: 343, y: 452, width: 159, height: 159 }, { x: 541, y: 452, width: 185, height: 159 }, { x: 726, y: 452, width: 195, height: 159 }, { x: 921, y: 452, width: 171, height: 159 }],
  [{ x: 335, y: 644, width: 144, height: 155 }, { x: 516, y: 644, width: 210, height: 155 }, { x: 726, y: 651, width: 216, height: 148 }, { x: 942, y: 644, width: 179, height: 154 }],
  [{ x: 329, y: 826, width: 152, height: 144 }, { x: 511, y: 826, width: 198, height: 144 }, { x: 709, y: 826, width: 204, height: 144 }, { x: 913, y: 861, width: 197, height: 94 }],
] as const;

const ENEMY_SCANNED_FRAMES = [
  [{ x: 356, y: 46, width: 132, height: 184 }, { x: 565, y: 46, width: 129, height: 184 }, { x: 765, y: 46, width: 131, height: 184 }, { x: 963, y: 46, width: 128, height: 184 }],
  [{ x: 329, y: 281, width: 183, height: 129 }, { x: 516, y: 281, width: 201, height: 130 }, { x: 717, y: 281, width: 203, height: 130 }, { x: 920, y: 281, width: 174, height: 130 }],
  [{ x: 344, y: 452, width: 159, height: 158 }, { x: 539, y: 452, width: 187, height: 157 }, { x: 726, y: 452, width: 195, height: 157 }, { x: 921, y: 452, width: 170, height: 158 }],
  [{ x: 334, y: 642, width: 146, height: 155 }, { x: 515, y: 642, width: 211, height: 155 }, { x: 726, y: 644, width: 216, height: 153 }, { x: 942, y: 642, width: 180, height: 155 }],
  [{ x: 339, y: 826, width: 139, height: 142 }, { x: 516, y: 826, width: 193, height: 142 }, { x: 709, y: 826, width: 204, height: 142 }, { x: 913, y: 862, width: 191, height: 94 }],
] as const;

function createFrameDefinitions(
  tex: TextureKey,
  prefix: 'player' | 'enemy',
  scannedFrames: typeof PLAYER_SCANNED_FRAMES | typeof ENEMY_SCANNED_FRAMES,
): ManualFrameDefinition[] {
  return scannedFrames.flatMap((row, rowIndex) =>
  row.map((frame, colIndex) => {
    return {
      name: `${prefix}_cell_${rowIndex * MANUAL_SHEET_COLUMNS + colIndex}`,
      tex,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      anchorX: 0.5,
      anchorY: 1,
    };
  }),
  );
}

export const PLAYER_FRAME_DEFINITIONS = createFrameDefinitions('sprite1', 'player', PLAYER_SCANNED_FRAMES);
export const ENEMY_FRAME_DEFINITIONS = createFrameDefinitions('sprite2', 'enemy', ENEMY_SCANNED_FRAMES);
export const MANUAL_FRAME_DEFINITIONS = [...PLAYER_FRAME_DEFINITIONS, ...ENEMY_FRAME_DEFINITIONS];

export function getManualRowBounds(row: number): { top: number; height: number } | null {
  if (row < 0 || row >= PLAYER_ROW_STARTS.length) {
    return null;
  }

  const { y: top, height } = PLAYER_SCANNED_FRAMES[row][0];

  return { top, height };
}

export function getSlicedFrameOrigin(frameName: string | number): { x: number; y: number } | null {
  if (typeof frameName !== 'string') {
    return null;
  }

  const manualFrame = MANUAL_FRAME_DEFINITIONS.find((frame) => frame.name === frameName);
  if (manualFrame) {
    return {
      x: manualFrame.anchorX ?? 0.5,
      y: manualFrame.anchorY,
    };
  }

  const cellMatch = frameName.match(/^(player|enemy)_cell_(\d+)$/);
  if (cellMatch) {
    const cellIndex = Number(cellMatch[2]);
    if (!Number.isInteger(cellIndex) || cellIndex < 0) {
      return null;
    }
    const row = Math.floor(cellIndex / MANUAL_SHEET_COLUMNS);
    const bounds = getManualRowBounds(row);
    if (!bounds) {
      return null;
    }
    const logicalCenter = PLAYER_ROW_STARTS[row] + PLAYER_ROW_HEIGHTS[row] / 2;
    return {
      x: 0.5,
      // Align the crop back to the original logical row center after expanding
      // the frame vertically to preserve sword arcs and motion trails.
      y: (logicalCenter - bounds.top) / bounds.height,
    };
  }
  
  return null;
}
