#!/usr/bin/env python3
"""Require complete social metadata on every shareable scratch page."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_META = {
    ("name", "description"),
    ("property", "og:type"),
    ("property", "og:title"),
    ("property", "og:description"),
    ("property", "og:url"),
    ("property", "og:image"),
    ("name", "twitter:card"),
    ("name", "twitter:title"),
    ("name", "twitter:description"),
    ("name", "twitter:image"),
}


class HeadParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.in_title = False
        self.meta: dict[tuple[str, str], str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            for key in ("name", "property"):
                if values.get(key):
                    self.meta[(key, values[key] or "")] = values.get("content", "") or ""

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data.strip()


def validate(page: Path) -> list[str]:
    parser = HeadParser()
    parser.feed(page.read_text())
    errors: list[str] = []

    if not parser.title:
        errors.append("missing <title>")

    for key in REQUIRED_META:
        if not parser.meta.get(key):
            errors.append(f"missing meta {key[0]}={key[1]}")

    for key in (("property", "og:image"), ("name", "twitter:image")):
        image_url = parser.meta.get(key, "")
        parsed = urlparse(image_url)
        if image_url and (parsed.scheme != "https" or parsed.netloc != "pipedream.ventures"):
            errors.append(f"{key[1]} must use an absolute pipedream.ventures URL")
            continue
        if image_url:
            image_path = ROOT / parsed.path.lstrip("/")
            if not image_path.is_file() or image_path.stat().st_size == 0:
                errors.append(f"{key[1]} points to missing image: {parsed.path}")

    return errors


def main() -> int:
    pages = sorted((ROOT / "scratch").glob("**/index.html"))
    failures = {page: validate(page) for page in pages}
    failures = {page: errors for page, errors in failures.items() if errors}

    if failures:
        for page, errors in failures.items():
            print(page.relative_to(ROOT))
            for error in errors:
                print(f"  - {error}")
        return 1

    print(f"Validated social metadata for {len(pages)} scratch page(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
