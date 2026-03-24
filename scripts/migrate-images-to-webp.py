#!/usr/bin/env python3
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, UnidentifiedImageError

ROOT = Path.cwd()
REF_FILE = ROOT / "ref2d.js"
REMOTE_DIR = ROOT / "IMG" / "remote-originals"
REPORT_LATEST = ROOT / "reports" / "image-downloads" / "latest.json"
QUALITY = 82

SRC_LINE_RE = re.compile(r'^(?P<indent>\s*)src:\s*"(?P<src>[^"]+)",\s*$', re.M)


def safe_base_from_src(src: str) -> str:
    raw = src.split("?")[0].split("#")[0]
    base = Path(raw).name or "image"
    base = re.sub(r"[^A-Za-z0-9._-]+", "_", base)
    base = re.sub(r"\.[A-Za-z0-9]{1,6}$", "", base)
    return base or "image"


def short_hash(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]


def load_remote_map():
    if not REPORT_LATEST.exists():
        return {}
    data = json.loads(REPORT_LATEST.read_text("utf-8"))
    mapping = {}
    for item in data.get("items", []):
        url = str(item.get("url") or "").strip()
        file_name = str(item.get("file") or "").strip()
        if url and file_name:
            mapping[url] = file_name
    return mapping


def resolve_source_file(src: str, remote_map: dict[str, str]) -> Path | None:
    if src.startswith("http://") or src.startswith("https://"):
        file_name = remote_map.get(src)
        if not file_name:
            return None
        path = REMOTE_DIR / file_name
        return path if path.exists() else None
    path = (ROOT / src).resolve()
    return path if path.exists() else None


def convert_to_webp(src_file: Path, webp_file: Path):
    webp_file.parent.mkdir(parents=True, exist_ok=True)
    if webp_file.exists():
        return
    try:
        with Image.open(src_file) as img:
            img.load()
            if img.mode not in ("RGB", "RGBA", "L", "LA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            save_kwargs = {"format": "WEBP", "quality": QUALITY, "method": 6}
            img.save(webp_file, **save_kwargs)
    except UnidentifiedImageError:
        raise RuntimeError(f"Unsupported image format: {src_file}")


def main():
    text = REF_FILE.read_text("utf-8")
    remote_map = load_remote_map()

    srcs = []
    for m in SRC_LINE_RE.finditer(text):
        src = m.group("src").strip()
        if not src or src.startswith("IMG/webp/"):
            continue
        srcs.append(src)

    unique_srcs = list(dict.fromkeys(srcs))

    mapping: dict[str, str] = {}
    errors: list[str] = []

    for src in unique_srcs:
        source_file = resolve_source_file(src, remote_map)
        if source_file is None:
            errors.append(f"Missing source for src: {src}")
            continue

        base = safe_base_from_src(src)
        tag = short_hash(src)
        rel_webp = Path("IMG") / "webp" / f"{base}_{tag}.webp"
        abs_webp = ROOT / rel_webp

        try:
            convert_to_webp(source_file, abs_webp)
            mapping[src] = rel_webp.as_posix()
        except Exception as exc:
            errors.append(f"{src} -> {exc}")

    def replacer(match: re.Match[str]) -> str:
        indent = match.group("indent")
        original = match.group("src").strip()
        replacement = mapping.get(original)
        if not replacement:
            return match.group(0)
        return f'{indent}src: "{replacement}",\n{indent}srcOriginal: "{original}",' 

    updated = SRC_LINE_RE.sub(replacer, text)
    REF_FILE.write_text(updated, "utf-8")

    report = {
        "total_src_entries": len(srcs),
        "unique_src": len(unique_srcs),
        "converted": len(mapping),
        "errors": errors,
    }
    report_path = ROOT / "reports" / "image-downloads" / "webp-migration-latest.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")

    print(f"Converted: {len(mapping)}")
    print(f"Errors: {len(errors)}")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
