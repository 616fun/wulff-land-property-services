#!/usr/bin/env python3
"""Strip EXIF/GPS/IPTC/XMP metadata from every image in assets/img/.

Customer properties are identifiable from GPS coordinates embedded by phone
cameras. Run this after adding any new photo:

    python3 tools/strip-metadata.py

JPEG: removes all APPn segments except APP0 (JFIF) and APP2 (ICC colour
profile), plus COM comments. PNG: removes tEXt/zTXt/iTXt/eXIf/tIME chunks.
Pixel data is untouched — this is lossless.
"""
import glob, os, struct, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, 'assets', 'img')
KEEP = {0xE0, 0xE2}
APPN = range(0xE0, 0xF0)
COM = 0xFE
PNG_DROP = {b'tEXt', b'zTXt', b'iTXt', b'eXIf', b'tIME'}
MARKERS = (b'Exif\x00\x00', b'GPS', b'http://ns.adobe.com/xap', b'Photoshop 3.0', b'8BIM')


def strip_jpeg(path):
    d = open(path, 'rb').read()
    if d[:2] != b'\xFF\xD8':
        return 0
    out, i, removed = bytearray(b'\xFF\xD8'), 2, 0
    while i < len(d) - 1:
        if d[i] != 0xFF:
            out += d[i:]
            break
        m = d[i + 1]
        if m == 0xDA:
            out += d[i:]
            break
        ln = struct.unpack('>H', d[i + 2:i + 4])[0]
        seg = d[i:i + 2 + ln]
        if (m in APPN and m not in KEEP) or m == COM:
            removed += len(seg)
        else:
            out += seg
        i += 2 + ln
    if removed:
        open(path, 'wb').write(bytes(out))
    return removed


def strip_png(path):
    d = open(path, 'rb').read()
    if d[:8] != b'\x89PNG\r\n\x1a\n':
        return 0
    out, i, removed = bytearray(d[:8]), 8, 0
    while i < len(d):
        ln = struct.unpack('>I', d[i:i + 4])[0]
        typ = d[i + 4:i + 8]
        chunk = d[i:i + 12 + ln]
        if typ in PNG_DROP:
            removed += len(chunk)
        else:
            out += chunk
        i += 12 + ln
        if typ == b'IEND':
            break
    if removed:
        open(path, 'wb').write(bytes(out))
    return removed


def main():
    files = sorted(glob.glob(os.path.join(ROOT, '**', '*.jpg'), recursive=True) +
                   glob.glob(os.path.join(ROOT, '**', '*.jpeg'), recursive=True) +
                   glob.glob(os.path.join(ROOT, '**', '*.png'), recursive=True))
    total = sum(strip_png(f) if f.lower().endswith('.png') else strip_jpeg(f) for f in files)
    dirty = [(os.path.relpath(f, ROOT), mk.decode('latin1'))
             for f in files for mk in MARKERS if mk in open(f, 'rb').read(200_000)]
    print(f'scanned {len(files)} images, removed {total} bytes of metadata')
    if dirty:
        print('STILL DIRTY:', dirty)
        return 1
    print('clean: no Exif, GPS, XMP or IPTC markers remain')
    return 0


if __name__ == '__main__':
    sys.exit(main())
