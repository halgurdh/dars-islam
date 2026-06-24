#!/usr/bin/env python3
"""Scan PNG sprite sheets and print Phaser frame rectangles.

The scanner is intentionally dependency-free. It can scan explicit files or
discover PNGs from games/<gameName>/public/sprites.
"""

from __future__ import annotations

import argparse
import struct
import zlib
from pathlib import Path


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
DEFAULT_CENTERS = [
    [418, 628, 830, 1028],
    [410, 616, 818, 1022],
    [432, 628, 824, 1018],
    [376, 618, 833, 1052],
    [400, 606, 812, 1014],
]


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png(path: Path) -> tuple[int, int, list[tuple[int, int, int, int]]]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError(f"{path} is not a PNG file")

    offset = len(PNG_SIGNATURE)
    width = height = bit_depth = color_type = None
    compressed = bytearray()

    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_data = data[offset + 8 : offset + 8 + length]
        offset += 12 + length

        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type, _, _, _ = struct.unpack(">IIBBBBB", chunk_data)
        elif chunk_type == b"IDAT":
            compressed.extend(chunk_data)
        elif chunk_type == b"IEND":
            break

    if width is None or height is None or bit_depth != 8 or color_type not in (2, 6):
        raise ValueError(f"{path} uses an unsupported PNG format")

    channels = 4 if color_type == 6 else 3
    stride = width * channels
    raw = zlib.decompress(bytes(compressed))
    rows: list[bytearray] = []
    pos = 0

    for _ in range(height):
        filter_type = raw[pos]
        pos += 1
        row = bytearray(raw[pos : pos + stride])
        pos += stride
        previous = rows[-1] if rows else bytearray(stride)

        for i in range(stride):
            left = row[i - channels] if i >= channels else 0
            up = previous[i]
            upper_left = previous[i - channels] if i >= channels else 0

            if filter_type == 1:
                row[i] = (row[i] + left) & 0xFF
            elif filter_type == 2:
                row[i] = (row[i] + up) & 0xFF
            elif filter_type == 3:
                row[i] = (row[i] + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                row[i] = (row[i] + paeth(left, up, upper_left)) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type}")

        rows.append(row)

    pixels: list[tuple[int, int, int, int]] = []
    for row in rows:
        for x in range(width):
            base = x * channels
            r, g, b = row[base], row[base + 1], row[base + 2]
            a = row[base + 3] if channels == 4 else 255
            pixels.append((r, g, b, a))

    return width, height, pixels


def foreground(pixel: tuple[int, int, int, int], bg: tuple[int, int, int], bg_threshold: int) -> bool:
    r, g, b, a = pixel
    if a < 24:
        return False

    hi = max(r, g, b)
    lo = min(r, g, b)
    sat = hi - lo
    bg_delta = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
    return bg_delta > bg_threshold or sat > 58 or hi < 56 or hi > 202


def pixel_at(pixels: list[tuple[int, int, int, int]], width: int, x: int, y: int) -> tuple[int, int, int, int]:
    return pixels[y * width + x]


def detect_row_bounds(
    width: int,
    height: int,
    pixels: list[tuple[int, int, int, int]],
    bg: tuple[int, int, int],
    rows: int,
    bg_threshold: int,
) -> list[tuple[int, int]]:
    bounds: list[tuple[int, int]] = []
    ideal = [round(i * height / rows) for i in range(rows + 1)]

    for row in range(rows):
        y0, y1 = ideal[row], ideal[row + 1] - 1
        counts = []
        for y in range(y0, y1 + 1):
            count = 0
            for x in range(0, width, 2):
                if foreground(pixel_at(pixels, width, x, y), bg, bg_threshold):
                    count += 1
            counts.append((y, count))

        threshold = max(8, int(max((count for _, count in counts), default=0) * 0.08))
        active = [y for y, count in counts if count >= threshold]
        if not active:
            bounds.append((y0, y1 - y0 + 1))
            continue

        top = max(y0, min(active) - 2)
        bottom = min(y1, max(active) + 2)
        bounds.append((top, bottom - top + 1))

    return bounds


def auto_centers(width: int, rows: int, columns: int) -> list[list[int]]:
    return [[round((col + 0.5) * width / columns) for col in range(columns)] for _ in range(rows)]


def parse_centers(text: str | None, rows: int, columns: int, width: int) -> list[list[int]]:
    if text is None:
        return [row[:] for row in DEFAULT_CENTERS] if rows == 5 and columns == 4 else auto_centers(width, rows, columns)

    row_values = []
    for row_text in text.split(";"):
        centers = [int(value.strip()) for value in row_text.split(",") if value.strip()]
        if len(centers) != columns:
            raise ValueError(f"Each --centers row must contain {columns} values")
        row_values.append(centers)

    if len(row_values) != rows:
        raise ValueError(f"--centers must contain {rows} semicolon-separated rows")
    return row_values


def detect_frame(
    width: int,
    pixels: list[tuple[int, int, int, int]],
    bg: tuple[int, int, int],
    y: int,
    height: int,
    left: int,
    right: int,
    padding: int,
    bg_threshold: int,
) -> tuple[int, int, int, int]:
    min_x, min_y = right, y + height
    max_x, max_y = left, y

    for py in range(y, y + height):
        for px in range(left, right + 1):
            if foreground(pixel_at(pixels, width, px, py), bg, bg_threshold):
                min_x = min(min_x, px)
                min_y = min(min_y, py)
                max_x = max(max_x, px)
                max_y = max(max_y, py)

    if max_x < min_x or max_y < min_y:
        return left, y, right - left + 1, height

    x0 = max(left, min_x - padding)
    y0 = max(y, min_y - padding)
    x1 = min(right, max_x + padding)
    y1 = min(y + height - 1, max_y + padding)
    return x0, y0, x1 - x0 + 1, y1 - y0 + 1


def scan(
    path: Path,
    rows: int,
    columns: int,
    padding: int,
    centers_text: str | None,
    bg_threshold: int,
) -> list[list[tuple[int, int, int, int]]]:
    width, height, pixels = read_png(path)
    corners = [
        pixel_at(pixels, width, 0, 0),
        pixel_at(pixels, width, width - 1, 0),
        pixel_at(pixels, width, 0, height - 1),
        pixel_at(pixels, width, width - 1, height - 1),
    ]
    bg = tuple(sum(c[i] for c in corners) // len(corners) for i in range(3))
    row_bounds = detect_row_bounds(width, height, pixels, bg, rows, bg_threshold)
    centers_by_row = parse_centers(centers_text, rows, columns, width)
    frames: list[list[tuple[int, int, int, int]]] = []

    for row, centers in enumerate(centers_by_row):
        lanes = [0]
        for a, b in zip(centers, centers[1:]):
            lanes.append(round((a + b) / 2))
        lanes.append(width)

        y, row_height = row_bounds[row]
        row_frames = []
        for col in range(columns):
            row_frames.append(detect_frame(width, pixels, bg, y, row_height, lanes[col], lanes[col + 1] - 1, padding, bg_threshold))
        frames.append(row_frames)

    return frames


def discover_sprites(game_name: str, root: Path) -> list[Path]:
    sprite_dir = root / "games" / game_name / "public" / "sprites"
    if not sprite_dir.exists():
        raise FileNotFoundError(f"No sprite directory found at {sprite_dir}")
    return sorted(sprite_dir.glob("*.png"))


def print_ts(name: str, frames: list[list[tuple[int, int, int, int]]]) -> None:
    print(f"const {name} = [")
    for row in frames:
        pieces = ", ".join(f"{{ x: {x}, y: {y}, width: {w}, height: {h} }}" for x, y, w, h in row)
        print(f"  [{pieces}],")
    print("] as const;")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("sprites", nargs="*", type=Path)
    parser.add_argument("--gameName", "--game-name", dest="game_name")
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--rows", type=int, default=5)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--padding", type=int, default=0)
    parser.add_argument("--bg-threshold", type=int, default=46)
    parser.add_argument("--centers", help="semicolon-separated row centers, e.g. '418,628,830,1028;...'")
    args = parser.parse_args()

    sprites = list(args.sprites)
    if args.game_name:
        sprites.extend(discover_sprites(args.game_name, args.root))
    if not sprites:
        parser.error("provide sprite paths or --gameName")

    for sprite in sprites:
        frames = scan(sprite, args.rows, args.columns, args.padding, args.centers, args.bg_threshold)
        const_name = sprite.stem.upper() + "_SCANNED_FRAMES"
        print(f"// {sprite}")
        print_ts(const_name, frames)
        print()


if __name__ == "__main__":
    main()
