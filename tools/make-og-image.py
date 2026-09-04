#!/usr/bin/env python3
"""Compose the social link-preview (Open Graph) image.

Takes a hero photograph, darkens it, and composites the badge logo in the
centre behind the same soft radial vignette the site's hero uses — so a
pasted link shows the brand, not an anonymous lawn.

    python3 tools/make-og-image.py            # rebuild assets/img/og.jpg

Pure standard library: PNG decode/encode by hand, sips only for the
resize/crop/JPEG steps. Run tools/strip-metadata.py afterwards.
"""
import math, os, struct, subprocess, sys, tempfile, zlib

ROOT   = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir)
PHOTO  = os.path.join(ROOT, 'assets', 'img', 'full', 'img44.jpg')
LOGO   = os.path.join(ROOT, 'assets', 'img', 'logo.png')
OUT    = os.path.join(ROOT, 'assets', 'img', 'og.jpg')
W, H   = 1200, 630
BADGE  = 400                     # rendered logo width, px
CX, CY = W // 2, 312             # badge centre
CROP_Y = 0.50                    # 0 = crop from the top, 1 = from the bottom
INK    = (10, 13, 18)


def read_png(path):
    d = open(path, 'rb').read()
    i, idat = 8, b''
    while i < len(d):
        ln = struct.unpack('>I', d[i:i + 4])[0]
        typ = d[i + 4:i + 8]
        body = d[i + 8:i + 8 + ln]
        if typ == b'IHDR':
            w, h, bd, ct, _, _, interlace = struct.unpack('>IIBBBBB', body)
        elif typ == b'IDAT':
            idat += body
        elif typ == b'IEND':
            break
        i += 12 + ln
    if bd != 8 or interlace:
        raise SystemExit(f'{path}: need 8-bit non-interlaced PNG')
    ch = {2: 3, 6: 4}[ct]
    raw = zlib.decompress(idat)
    stride = w * ch
    out = bytearray(w * h * ch)
    pos = 0
    for y in range(h):
        f = raw[pos]; pos += 1
        line = raw[pos:pos + stride]; pos += stride
        base, prev = y * stride, (y - 1) * stride
        if f == 0:
            out[base:base + stride] = line
            continue
        for x in range(stride):
            a = out[base + x - ch] if x >= ch else 0
            b = out[prev + x] if y > 0 else 0
            c = out[prev + x - ch] if (y > 0 and x >= ch) else 0
            v = line[x]
            if f == 1:   v += a
            elif f == 2: v += b
            elif f == 3: v += (a + b) >> 1
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                v += a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
            out[base + x] = v & 0xFF
    return w, h, ch, out


def write_png(path, w, h, ch, buf):
    stride = w * ch
    rows = bytearray()
    for y in range(h):
        rows.append(0)
        rows += buf[y * stride:(y + 1) * stride]
    def chunk(t, b):
        return struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
    ct = {3: 2, 4: 6}[ch]
    open(path, 'wb').write(
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(bytes(rows), 9))
        + chunk(b'IEND', b''))


def bilinear(src, sw, sh, ch, dw, dh):
    """Down-sample with bilinear sampling — good enough at these ratios."""
    dst = bytearray(dw * dh * ch)
    xr, yr = (sw - 1) / max(dw - 1, 1), (sh - 1) / max(dh - 1, 1)
    for y in range(dh):
        fy = y * yr; y0 = int(fy); y1 = min(y0 + 1, sh - 1); wy = fy - y0
        for x in range(dw):
            fx = x * xr; x0 = int(fx); x1 = min(x0 + 1, sw - 1); wx = fx - x0
            o00 = (y0 * sw + x0) * ch; o01 = (y0 * sw + x1) * ch
            o10 = (y1 * sw + x0) * ch; o11 = (y1 * sw + x1) * ch
            o = (y * dw + x) * ch
            for c in range(ch):
                top = src[o00 + c] * (1 - wx) + src[o01 + c] * wx
                bot = src[o10 + c] * (1 - wx) + src[o11 + c] * wx
                dst[o + c] = int(top * (1 - wy) + bot * wy + .5)
    return dst


def vignette_alpha(dist, radius):
    """Same long, dissolving falloff as the hero badge's CSS vignette."""
    t = dist / radius
    if t >= 1:
        return 0.0
    stops = [(0.00, .74), (0.16, .70), (0.28, .60), (0.39, .45), (0.50, .30),
             (0.61, .18), (0.72, .10), (0.84, .04), (1.00, .00)]
    for (t0, a0), (t1, a1) in zip(stops, stops[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            k = k * k * (3 - 2 * k)                 # smoothstep, kills banding
            return a0 + (a1 - a0) * k
    return 0.0


def main():
    tmp = tempfile.mkdtemp()

    # scale the source so it covers 1200x630 without distortion, whatever its
    # aspect ratio, then crop the band we want ourselves
    probe = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', PHOTO],
                           check=True, capture_output=True, text=True).stdout
    sw = int(probe.split('pixelWidth:')[1].split()[0])
    sh = int(probe.split('pixelHeight:')[1].split()[0])
    scale = max(W / sw, H / sh)
    nw, nh = math.ceil(sw * scale), math.ceil(sh * scale)
    fit = os.path.join(tmp, 'fit.png')
    subprocess.run(['sips', '-z', str(nh), str(nw), PHOTO, '-s', 'format', 'png',
                    '--out', fit], check=True, capture_output=True)

    fw, fh, bch, src = read_png(fit)
    if bch == 4:                                   # drop any alpha
        src = bytearray(b for i, b in enumerate(src) if i % 4 != 3); bch = 3
    x0 = max(0, (fw - W) // 2)
    y0 = max(0, min(fh - H, int((fh - H) * CROP_Y)))
    bg = bytearray(W * H * 3)
    for y in range(H):
        so = ((y + y0) * fw + x0) * 3
        bg[y * W * 3:(y + 1) * W * 3] = src[so:so + W * 3]

    lw, lh, lch, logo = read_png(LOGO)
    if lch != 4:
        raise SystemExit('logo must be RGBA — run the transparency step first')
    logo = bilinear(logo, lw, lh, 4, BADGE, BADGE)

    radius = BADGE * 1.22
    lx, ly = CX - BADGE // 2, CY - BADGE // 2

    for y in range(H):
        # gentle overall darken, deepening toward the bottom edge
        vert = 0.78 - 0.24 * max(0.0, (y - H * .55) / (H * .45)) ** 1.6
        dy = y - CY
        for x in range(W):
            o = (y * W + x) * 3
            dx = x - CX
            a = vignette_alpha(math.hypot(dx, dy), radius)
            k = vert
            for c in range(3):
                v = bg[o + c] * k
                if a:
                    v = v * (1 - a) + INK[c] * a
                bg[o + c] = int(v)
            if 0 <= dy + BADGE // 2 < BADGE and 0 <= dx + BADGE // 2 < BADGE:
                lo = ((y - ly) * BADGE + (x - lx)) * 4
                la = logo[lo + 3] / 255
                if la:
                    for c in range(3):
                        bg[o + c] = int(bg[o + c] * (1 - la) + logo[lo + c] * la)

    comp = os.path.join(tmp, 'og.png')
    write_png(comp, W, H, 3, bg)
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72',
                    comp, '--out', OUT], check=True, capture_output=True)
    print(f'wrote {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT) // 1024} KB, {W}x{H})')


if __name__ == '__main__':
    main()
