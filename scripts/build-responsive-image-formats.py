#!/usr/bin/env python3
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
REF_FILE = ROOT / "ref2d.js"
WEBP_VARIANTS_DIR = ROOT / "IMG" / "webp" / "variants"
AVIF_DIR = ROOT / "IMG" / "avif"
AVIF_VARIANTS_DIR = ROOT / "IMG" / "avif" / "variants"
REPORT_PATH = ROOT / "reports" / "image-downloads" / "responsive-formats-latest.json"

TARGET_WIDTHS = [640, 1280]
WEBP_QUALITY = 78
AVIF_QUALITY = 50
AVIF_SPEED = 6

SRC_WEBP_LINE_RE = re.compile(r'^(?P<indent>\s*)src:\s*"(?P<src>IMG/webp/[^"]+\.webp)",\s*$')


def open_image(path: Path):
    with Image.open(path) as img:
        img.load()
        if img.mode not in ("RGB", "RGBA", "L", "LA"):
            img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
        return img


def resize_to_width(img: Image.Image, width: int) -> Image.Image:
    if img.width <= width:
        return img.copy()
    height = max(1, int(round((width / img.width) * img.height)))
    return img.resize((width, height), Image.Resampling.LANCZOS)


def ensure_webp_variant(src_path: Path, out_path: Path, width: int):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        return "cached"
    img = open_image(src_path)
    resized = resize_to_width(img, width)
    resized.save(out_path, format="WEBP", quality=WEBP_QUALITY, method=6)
    return "generated"


def ensure_avif(src_path: Path, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        return "cached"
    img = open_image(src_path)
    img.save(out_path, format="AVIF", quality=AVIF_QUALITY, speed=AVIF_SPEED)
    return "generated"


def ensure_avif_variant(src_path: Path, out_path: Path, width: int):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.exists():
        return "cached"
    img = open_image(src_path)
    resized = resize_to_width(img, width)
    resized.save(out_path, format="AVIF", quality=AVIF_QUALITY, speed=AVIF_SPEED)
    return "generated"


def parse_sources(text: str):
    srcs = []
    for line in text.splitlines():
        m = SRC_WEBP_LINE_RE.match(line)
        if m:
            srcs.append(m.group("src"))
    # unique preserving order
    seen = set()
    out = []
    for src in srcs:
        if src in seen:
            continue
        seen.add(src)
        out.append(src)
    return out


def build_srcset(entries):
    return ", ".join([f"{path} {width}w" for path, width in entries])


def main():
    text = REF_FILE.read_text("utf-8")
    sources = parse_sources(text)

    mapping = {}
    errors = []
    gen_counts = {
        "avif_base_generated": 0,
        "avif_base_cached": 0,
        "avif_variants_generated": 0,
        "avif_variants_cached": 0,
        "webp_variants_generated": 0,
        "webp_variants_cached": 0,
    }

    for idx, src_rel in enumerate(sources, start=1):
        src_path = ROOT / src_rel
        if not src_path.exists():
            errors.append({"src": src_rel, "error": "source_missing"})
            continue

        try:
            with Image.open(src_path) as img_probe:
                original_width = int(img_probe.width)
        except Exception as exc:
            errors.append({"src": src_rel, "error": f"probe_failed: {exc}"})
            continue

        stem = Path(src_rel).stem

        avif_base_rel = f"IMG/avif/{stem}.avif"
        avif_base_path = ROOT / avif_base_rel
        status = ensure_avif(src_path, avif_base_path)
        gen_counts[f"avif_base_{status}"] += 1

        webp_entries = []
        avif_entries = []

        for w in TARGET_WIDTHS:
            if w >= original_width:
                continue

            webp_var_rel = f"IMG/webp/variants/{stem}-{w}.webp"
            webp_var_path = ROOT / webp_var_rel
            status = ensure_webp_variant(src_path, webp_var_path, w)
            gen_counts[f"webp_variants_{status}"] += 1
            webp_entries.append((webp_var_rel, w))

            avif_var_rel = f"IMG/avif/variants/{stem}-{w}.avif"
            avif_var_path = ROOT / avif_var_rel
            status = ensure_avif_variant(src_path, avif_var_path, w)
            gen_counts[f"avif_variants_{status}"] += 1
            avif_entries.append((avif_var_rel, w))

        webp_entries.append((src_rel, original_width))
        avif_entries.append((avif_base_rel, original_width))

        mapping[src_rel] = {
            "srcAvif": avif_base_rel,
            "srcSetWebp": build_srcset(webp_entries),
            "srcSetAvif": build_srcset(avif_entries),
        }

        if idx % 40 == 0:
            print(f"Processed {idx}/{len(sources)}")

    lines = text.splitlines(keepends=True)
    out = []
    i = 0
    inserted = 0

    while i < len(lines):
        line = lines[i]
        m = SRC_WEBP_LINE_RE.match(line.rstrip("\n"))
        if not m:
            out.append(line)
            i += 1
            continue

        src_rel = m.group("src")
        indent = m.group("indent")
        out.append(line)
        i += 1

        while i < len(lines) and re.match(rf'^{re.escape(indent)}(srcAvif|srcSetWebp|srcSetAvif):\s*"', lines[i].rstrip("\n")):
            i += 1

        cfg = mapping.get(src_rel)
        if cfg:
            out.append(f'{indent}srcAvif: "{cfg["srcAvif"]}",\n')
            out.append(f'{indent}srcSetAvif: "{cfg["srcSetAvif"]}",\n')
            out.append(f'{indent}srcSetWebp: "{cfg["srcSetWebp"]}",\n')
            inserted += 3

    updated = "".join(out)
    REF_FILE.write_text(updated, "utf-8")

    report = {
        "sources": len(sources),
        "updated_fields_inserted": inserted,
        "generation": gen_counts,
        "errors": errors,
        "target_widths": TARGET_WIDTHS,
        "quality": {
            "webp": WEBP_QUALITY,
            "avif": AVIF_QUALITY,
            "avif_speed": AVIF_SPEED,
        },
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")

    print(json.dumps({
        "sources": report["sources"],
        "errors": len(errors),
        "avif_generated": gen_counts["avif_base_generated"],
        "webp_variants_generated": gen_counts["webp_variants_generated"],
        "avif_variants_generated": gen_counts["avif_variants_generated"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
