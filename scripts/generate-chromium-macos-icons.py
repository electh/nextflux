"""Compensate Chromium's macOS mask without changing Safari/Android artwork.

Run with Python + Pillow. Chromium clips 50px on each side of a 512px
maskable icon; Safari instead scales the source into that 412px square.
Source: chromium/src/chrome/browser/web_applications/os_integration/mac/icon_utils.mm
"""
from pathlib import Path
from PIL import Image

public = Path(__file__).resolve().parents[1] / 'public'
source = Image.open(public / 'web-app-manifest-1024x1024.png').convert('RGB')
for size in (512, 1024):
    inset = size * 50 // 512
    content_size = size - inset * 2
    # The outer background is clipped by Chromium. Keep the input full-bleed
    # and opaque; the entire original artwork fills the visible rounded rect.
    icon = Image.new('RGB', (size, size), source.getpixel((0, 0)))
    icon.paste(source.resize((content_size, content_size), Image.Resampling.LANCZOS), (inset, inset))
    icon.save(public / f'icon-macos-chromium-{size}.png')
