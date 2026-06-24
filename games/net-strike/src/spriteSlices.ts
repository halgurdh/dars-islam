export const PLAYER_COLUMN_WIDTH = 384;
export const PLAYER_ROW_STARTS = [0, 205, 410, 614, 819];
export const PLAYER_ROW_HEIGHTS = [205, 205, 204, 205, 205];
export const MANUAL_SHEET_COLUMNS = 4;
export const COMBAT_CELL_HEIGHT = 256;
export const OVERFLOW_FRAME_HEIGHT = 256;

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

const PLAYER_ROW_TOPS = [19, 226, 403, 599, 768];
const PLAYER_ROW_CENTERS = [
  [418, 628, 830, 1028],
  [410, 616, 818, 1022],
  [432, 628, 824, 1018],
  [376, 618, 833, 1052],
  [400, 606, 812, 1014],
] as const;
const PLAYER_FRAME_WIDTHS = [
  [256, 256, 256, 256],
  [288, 288, 288, 288],
  [288, 320, 336, 288],
  [288, 352, 352, 288],
  [256, 256, 256, 352],
] as const;

export const PLAYER_FRAME_DEFINITIONS: ManualFrameDefinition[] = PLAYER_ROW_CENTERS.flatMap((row, rowIndex) =>
  row.map((centerX, colIndex) => {
    const width = PLAYER_FRAME_WIDTHS[rowIndex][colIndex];
    const x = Math.round(centerX - width / 2);
    const y = PLAYER_ROW_TOPS[rowIndex];
    const logicalCenter = PLAYER_ROW_STARTS[rowIndex] + PLAYER_ROW_HEIGHTS[rowIndex] / 2;

    return {
      name: `player_cell_${rowIndex * MANUAL_SHEET_COLUMNS + colIndex}`,
      tex: 'sprite1' as const,
      x,
      y,
      width,
      height: OVERFLOW_FRAME_HEIGHT,
      anchorX: 0.5,
      anchorY: (logicalCenter - y) / OVERFLOW_FRAME_HEIGHT,
    };
  }),
);

export function getManualRowBounds(row: number): { top: number; height: number } | null {
  if (row < 0 || row >= PLAYER_ROW_STARTS.length) {
    return null;
  }

  const logicalTop = PLAYER_ROW_STARTS[row];
  const logicalHeight = PLAYER_ROW_HEIGHTS[row];
  const logicalCenter = logicalTop + logicalHeight / 2;
  const maxTop = PLAYER_ROW_STARTS[PLAYER_ROW_STARTS.length - 1] + PLAYER_ROW_HEIGHTS[PLAYER_ROW_HEIGHTS.length - 1] - OVERFLOW_FRAME_HEIGHT;
  const top = Math.max(0, Math.min(Math.round(logicalCenter - OVERFLOW_FRAME_HEIGHT / 2), maxTop));

  return { top, height: OVERFLOW_FRAME_HEIGHT };
}

export function getSlicedFrameOrigin(frameName: string | number): { x: number; y: number } | null {
  if (typeof frameName !== 'string') {
    return null;
  }

  const playerFrame = PLAYER_FRAME_DEFINITIONS.find((frame) => frame.name === frameName);
  if (playerFrame) {
    return {
      x: playerFrame.anchorX ?? 0.5,
      y: playerFrame.anchorY,
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
