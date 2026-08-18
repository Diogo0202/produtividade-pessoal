from pathlib import Path

from PIL import Image


ICON_FILES = [
    "assets/images/icon.png",
    "assets/images/splash-icon.png",
    "assets/images/favicon.png",
    "assets/images/android-icon-foreground.png",
]


def optimize_icon(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True, compress_level=9)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    for relative_path in ICON_FILES:
        optimize_icon(root / relative_path)
