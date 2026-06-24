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
    rows: int | None,
    bg_threshold: int,
) -> list[tuple[int, int]]:
    counts = []

    for y in range(height):
        count = 0
        for x in range(0, width, 2):
            if foreground(pixel_at(pixels, width, x, y), bg, bg_threshold):
                count += 1
        counts.append((y, count))

    global_threshold = max(8, int(max((count for _, count in counts), default=0) * 0.08))
    segments: list[tuple[int, int]] = []
    active_start: int | None = None

    for y, count in counts:
        if count >= global_threshold and active_start is None:
            active_start = y
        elif count < global_threshold and active_start is not None:
            segments.append((active_start, y - 1))
            active_start = None
    if active_start is not None:
        segments.append((active_start, height - 1))

    if rows is None:
        return [(start, end - start + 1) for start, end in segments]

    ideal = [round(i * height / rows) for i in range(rows + 1)]
    ideal_height = height / rows
    bounds: list[tuple[int, int]] = []
    for row in range(rows):
        y0, y1 = ideal[row], ideal[row + 1] - 1
        center = round((y0 + y1) / 2)
        containing = next(((start, end) for start, end in segments if start <= center <= end), None)
        if containing and (containing[1] - containing[0] + 1) <= ideal_height * 1.35:
            bounds.append((containing[0], containing[1] - containing[0] + 1))
            continue

        local_counts = [(y, count) for y, count in counts if y0 <= y <= y1]
        local_threshold = max(8, int(max((count for _, count in local_counts), default=0) * 0.08))
        active = [y for y, count in local_counts if count >= local_threshold]
        if not active:
            bounds.append((y0, y1 - y0 + 1))
            continue

        top = min(active)
        bottom = max(active)
        bounds.append((top, bottom - top + 1))

    return bounds


def parse_centers(text: str | None, rows: int, columns: int) -> list[list[int]] | None:
    if text is None:
        return None
    row_values = []
    for row_text in text.split(";"):
        centers = [int(value.strip()) for value in row_text.split(",") if value.strip()]
        if len(centers) != columns:
            raise ValueError(f"Each --centers row must contain {columns} values")
        row_values.append(centers)

    if len(row_values) != rows:
        raise ValueError(f"--centers must contain {rows} semicolon-separated rows")
    return row_values


def segments_from_projection(counts: list[tuple[int, int]], threshold: int, min_gap: int, min_size: int) -> list[tuple[int, int]]:
    raw_segments: list[tuple[int, int]] = []
    start: int | None = None
    last_active: int | None = None

    for position, count in counts:
        if count >= threshold:
            if start is None:
                start = position
            last_active = position
        elif start is not None and last_active is not None and position - last_active > min_gap:
            raw_segments.append((start, last_active))
            start = None
            last_active = None

    if start is not None and last_active is not None:
        raw_segments.append((start, last_active))

    return [(start, end) for start, end in raw_segments if end - start + 1 >= min_size]


def detect_row_frames(
    width: int,
    height: int,
    pixels: list[tuple[int, int, int, int]],
    bg: tuple[int, int, int],
    y: int,
    row_height: int,
    columns: int | None,
    padding: int,
    bg_threshold: int,
) -> list[tuple[int, int, int, int]]:
    x_counts = []
    for x in range(width):
        count = 0
        for py in range(y, y + row_height):
            if foreground(pixel_at(pixels, width, x, py), bg, bg_threshold):
                count += 1
        x_counts.append((x, count))

    threshold = max(2, int(max((count for _, count in x_counts), default=0) * 0.06))
    x_segments = segments_from_projection(x_counts, threshold, min_gap=10, min_size=8)

    if columns is not None and len(x_segments) != columns:
        x_segments = split_or_merge_segments(x_segments, columns)

    frames = []
    for left, right in x_segments:
        min_x, min_y = right, y + row_height
        max_x, max_y = left, y

        for py in range(y, y + row_height):
            for px in range(left, right + 1):
                if foreground(pixel_at(pixels, width, px, py), bg, bg_threshold):
                    min_x = min(min_x, px)
                    min_y = min(min_y, py)
                    max_x = max(max_x, px)
                    max_y = max(max_y, py)

        if max_x < min_x or max_y < min_y:
            frames.append((left, y, right - left + 1, row_height))
            continue

        x0 = max(0, min_x - padding)
        y0 = max(0, min_y - padding)
        x1 = min(width - 1, max_x + padding)
        y1 = min(height - 1, max_y + padding)
        frames.append((x0, y0, x1 - x0 + 1, y1 - y0 + 1))

    return frames


def split_or_merge_segments(segments: list[tuple[int, int]], target_count: int) -> list[tuple[int, int]]:
    if len(segments) == target_count:
        return segments
    if len(segments) > target_count:
        merged = segments[:]
        while len(merged) > target_count:
            gap_index = min(range(len(merged) - 1), key=lambda index: merged[index + 1][0] - merged[index][1])
            merged[gap_index] = (merged[gap_index][0], merged[gap_index + 1][1])
            del merged[gap_index + 1]
        return merged

    expanded = segments[:]
    while len(expanded) < target_count and expanded:
        widest_index = max(range(len(expanded)), key=lambda index: expanded[index][1] - expanded[index][0])
        start, end = expanded[widest_index]
        mid = (start + end) // 2
        expanded[widest_index:widest_index + 1] = [(start, mid), (mid + 1, end)]
    return expanded


def scan(
    path: Path,
    rows: int | None,
    columns: int | None,
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
    if centers_text is not None and (rows is None or columns is None):
        raise ValueError("--centers requires --rows and --columns")
    centers_by_row = parse_centers(centers_text, rows, columns) if rows is not None and columns is not None else None
    frames: list[list[tuple[int, int, int, int]]] = []

    for row, row_bounds_item in enumerate(row_bounds):
        y, row_height = row_bounds_item
        if centers_by_row is None:
            frames.append(detect_row_frames(width, height, pixels, bg, y, row_height, columns, padding, bg_threshold))
            continue

        centers = centers_by_row[row]
        lanes = [0]
        for a, b in zip(centers, centers[1:]):
            lanes.append(round((a + b) / 2))
        lanes.append(width)
        y, row_height = row_bounds[row]
        row_frames = []
        for col in range(columns or 0):
            left = lanes[col]
            right = lanes[col + 1] - 1
            frame = detect_row_frames(width, height, pixels, bg, y, row_height, None, padding, bg_threshold)
            lane_frame = [item for item in frame if item[0] >= left and item[0] + item[2] - 1 <= right]
            row_frames.append(lane_frame[0] if lane_frame else (left, y, right - left + 1, row_height))
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
    parser.add_argument("--rows", type=int)
    parser.add_argument("--columns", type=int)
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
