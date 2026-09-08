#!/usr/bin/env python3
"""Stamp the CSS/JS links with a content hash so browsers pick up changes at once.

GitHub Pages serves assets with a ten-minute cache. Without a version string a
returning visitor can run yesterday's JavaScript against today's HTML. Each
file's link becomes `site.css?v=<hash of that file>`, so the URL changes only
when the file does — new code is fetched immediately, unchanged code stays
cached.

Run after editing assets/css/site.css or assets/js/site.js:

    python3 tools/version-assets.py
"""
import glob, hashlib, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir)
ASSETS = {'assets/css/site.css': None, 'assets/js/site.js': None}


def main():
    for rel in ASSETS:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f'missing {rel}', file=sys.stderr)
            return 1
        ASSETS[rel] = hashlib.sha256(open(path, 'rb').read()).hexdigest()[:10]

    changed = 0
    for page in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        html = open(page, encoding='utf-8').read()
        before = html
        for rel, digest in ASSETS.items():
            html = re.sub(re.escape(rel) + r'(\?v=[0-9a-f]+)?', f'{rel}?v={digest}', html)
        if html != before:
            open(page, 'w', encoding='utf-8').write(html)
            changed += 1

    for rel, digest in ASSETS.items():
        print(f'  {rel}  v={digest}')
    print(f'stamped {changed} page(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
