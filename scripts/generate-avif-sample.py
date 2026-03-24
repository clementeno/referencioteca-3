#!/usr/bin/env python3
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path.cwd()
REF_FILE = ROOT / "ref2d.js"
AVIF_DIR = ROOT / "IMG" / "avif"
REPORT_PATH = ROOT / "reports" / "image-downloads" / "avif-sample-latest.json"
MAX_ITEMS = 60
QUALITY = 52
SPEED = 6

SRC_RE = re.compile(r'^(?P<indent>\s*)src:\s*"(?P<src>IMG/webp/[^"]+\.webp)",\s*$')


def pick_sample_sources(text: str, max_items: int) -> list[str]:
    matches = [m.group(1) for m in re.finditer(r'^\s*src:\s*"(IMG/webp/[^"]+\.webp)",\s*$', text, re.M)]
    unique = []
    seen = set()
    for src in reversed(matches):
        if src in seen:
            continue
        seen.add(src)
        unique.append(src)
        if len(unique) >= max_items:
            break
    unique.reverse()
    return unique


def to_avif_path(src: str) -> str:
    name = Path(src).stem + ".avif"
    return f"IMG/avif/{name}"


def convert_one(src_rel: str, avif_rel: str) -> tuple[bool, str]:
    src = ROOT / src_rel
    dst = ROOT / avif_rel
    if not src.exists():
        return False, f"missing source: {src_rel}"
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        return True, "cached"
    try:
        with Image.open(src) as img:
            img.load()
            if img.mode not in ("RGB", "RGBA", "L", "LA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            img.save(dst, format="AVIF", quality=QUALITY, speed=SPEED)
        return True, "converted"
    except Exception as exc:
        return False, str(exc)


def inject_src_avif(text: str, src_to_avif: dict[str, str]) -> tuple[str, int]:
    out_lines = []
    lines = text.splitlines(keepends=True)
    inserted = 0

    i = 0
    while i < len(lines):
        line = lines[i]
        m = SRC_RE.match(line.rstrip("\n"))
        if not m:
            out_lines.append(line)
            i += 1
            continue

        src = m.group("src")
        indent = m.group("indent")
        out_lines.append(line)

        avif = src_to_avif.get(src)
        if not avif:
            i += 1
            continue

        next_line = lines[i + 1] if i + 1 < len(lines) else ""
        if re.match(rf'^{re.escape(indent)}srcAvif:\s*"', next_line):
            i += 1
            continue

        out_lines.append(f'{indent}srcAvif: "{avif}",\n')
        inserted += 1
        i += 1

    return "".join(out_lines), inserted


def main() -> None:
    text = REF_FILE.read_text("utf-8")
    sample_srcs = pick_sample_sources(text, MAX_ITEMS)

    src_to_avif = {src: to_avif_path(src) for src in sample_srcs}

    converted = 0
    cached = 0
    errors = []
    for src, avif in src_to_avif.items():
        ok, status = convert_one(src, avif)
        if ok:
            if status == "converted":
                converted += 1
            else:
                cached += 1
        else:
            errors.append({"src": src, "avif": avif, "error": status})

    updated_text, inserted = inject_src_avif(text, src_to_avif)
    REF_FILE.write_text(updated_text, "utf-8")

    payload = {
        "sample_size": len(sample_srcs),
        "inserted_src_avif": inserted,
        "converted": converted,
        "cached": cached,
        "errors": errors,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), "utf-8")

    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    main()
