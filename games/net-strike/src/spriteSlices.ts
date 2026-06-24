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
  [{ x: 356, y: 45, width: 123, height: 160 }, { x: 567, y: 45, width: 123, height: 160 }, { x: 768, y: 45, width: 122, height: 160 }, { x: 963, y: 44, width: 126, height: 161 }],
  [{ x: 329, y: 205, width: 162, height: 205 }, { x: 517, y: 205, width: 200, height: 205 }, { x: 717, y: 205, width: 184, height: 205 }, { x: 920, y: 205, width: 178, height: 205 }],
  [{ x: 343, y: 410, width: 159, height: 202 }, { x: 539, y: 410, width: 187, height: 201 }, { x: 726, y: 410, width: 195, height: 201 }, { x: 921, y: 410, width: 171, height: 201 }],
  [{ x: 335, y: 642, width: 144, height: 157 }, { x: 516, y: 643, width: 210, height: 157 }, { x: 726, y: 651, width: 216, height: 149 }, { x: 942, y: 643, width: 179, height: 155 }],
  [{ x: 329, y: 823, width: 152, height: 147 }, { x: 511, y: 825, width: 198, height: 145 }, { x: 709, y: 824, width: 204, height: 146 }, { x: 913, y: 861, width: 197, height: 94 }],
] as const;

const ENEMY_SCANNED_FRAMES = [
  [{ x: 356, y: 45, width: 125, height: 160 }, { x: 565, y: 45, width: 124, height: 160 }, { x: 765, y: 46, width: 126, height: 159 }, { x: 963, y: 46, width: 126, height: 159 }],
  [{ x: 329, y: 205, width: 183, height: 205 }, { x: 516, y: 205, width: 201, height: 205 }, { x: 717, y: 205, width: 203, height: 205 }, { x: 920, y: 205, width: 174, height: 205 }],
  [{ x: 344, y: 451, width: 159, height: 159 }, { x: 539, y: 410, width: 187, height: 199 }, { x: 726, y: 410, width: 195, height: 199 }, { x: 921, y: 410, width: 170, height: 200 }],
  [{ x: 334, y: 640, width: 146, height: 158 }, { x: 515, y: 641, width: 211, height: 157 }, { x: 726, y: 644, width: 216, height: 154 }, { x: 942, y: 640, width: 180, height: 157 }],
  [{ x: 339, y: 823, width: 139, height: 145 }, { x: 516, y: 826, width: 193, height: 143 }, { x: 709, y: 825, width: 204, height: 144 }, { x: 913, y: 862, width: 191, height: 94 }],
] as const;

function createFrameDefinitions(
  tex: TextureKey,
  prefix: 'player' | 'enemy',
  scannedFrames: typeof PLAYER_SCANNED_FRAMES | typeof ENEMY_SCANNED_FRAMES,
): ManualFrameDefinition[] {
  return scannedFrames.flatMap((row, rowIndex) =>
  row.map((frame, colIndex) => {
    const logicalCenter = PLAYER_ROW_STARTS[rowIndex] + PLAYER_ROW_HEIGHTS[rowIndex] / 2;

    return {
      name: `${prefix}_cell_${rowIndex * MANUAL_SHEET_COLUMNS + colIndex}`,
      tex,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      anchorX: 0.5,
      anchorY: (logicalCenter - frame.y) / frame.height,
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
