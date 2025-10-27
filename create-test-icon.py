#!/usr/bin/env python3
"""
Quick script to generate a test icon with custom colors.
Usage: python3 create-test-icon.py
"""
import struct
import zlib

def create_simple_png(filename, width, height, r, g, b, a=255):
    """Create a simple solid color PNG file"""

    def png_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)

    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png += png_chunk(b'IHDR', ihdr)

    # Create image data with a simple gradient/pattern
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter type
        for x in range(width):
            # Create a simple radial gradient effect
            dx = x - width/2
            dy = y - height/2
            dist = (dx*dx + dy*dy) ** 0.5
            max_dist = width * 0.7
            factor = max(0, 1 - dist / max_dist)

            # Mix color with white based on distance from center
            new_r = int(r * factor + 255 * (1-factor))
            new_g = int(g * factor + 255 * (1-factor))
            new_b = int(b * factor + 255 * (1-factor))

            raw_data += bytes([new_r, new_g, new_b, a])

    # IDAT chunk (compressed)
    compressed = zlib.compress(raw_data, 9)
    png += png_chunk(b'IDAT', compressed)

    # IEND chunk
    png += png_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)

if __name__ == '__main__':
    print("Creating test icon with gradient...")

    # Example: Create a green gradient icon
    # Change these RGB values for different colors:
    # Red: (220, 38, 38)
    # Green: (34, 197, 94)
    # Purple: (168, 85, 247)
    # Orange: (249, 115, 22)

    create_simple_png(
        'desktop/icons/icon.png',
        1024, 1024,
        34, 197, 94  # Green
    )
    print("✓ Created desktop/icons/icon.png (1024x1024)")

    # Also create for bechem branding
    create_simple_png(
        'branding/bechem/icons/icon.png',
        1024, 1024,
        34, 197, 94  # Green
    )
    print("✓ Created branding/bechem/icons/icon.png (1024x1024)")
    print("\nNow run: npm run electron:build:mac")
