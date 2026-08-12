#!/usr/bin/env python3
"""Generate article Markdown from the canonical JavaScript data layer.

The archive currently has:
- data/articles.js      articles 01–07
- data/article-*.js     individually versioned additions (08 onward)

Every file mutates the same window.SITE object. The website and this builder load
them in the same order, so Markdown, article pages, the index and the word bank
share one authoritative data layer.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
BASE_DATA = DATA_DIR / "articles.js"
EXTRA_DATA = sorted(DATA_DIR.glob("article-*.js"))
OUT = ROOT / "articles"

BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
ZH_PAIR_RE = re.compile(r"\*\*(.+?)\*\*\(([A-Za-z][A-Za-z'’\-]*)\)")


def load_site() -> dict[str, Any]:
    files = [BASE_DATA, *EXTRA_DATA]
    missing = [str(path) for path in files if not path.exists()]
    if missing:
        raise SystemExit("数据文件不存在：\n" + "\n".join(missing))

    require_lines = "\n".join(
        f"require({json.dumps(str(path.resolve()))});" for path in files
    )
    script = f"""
      globalThis.window = globalThis;
      {require_lines}
      process.stdout.write(JSON.stringify(globalThis.SITE));
    """
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode:
        raise SystemExit("读取文章数据失败：\n" + result.stderr)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"文章数据不是有效 JSON：{exc}") from exc


def count_words(text: str) -> int:
    """Use the project's historical counting rule."""
    tokens = text.replace("**", "").split()
    return sum(1 for token in tokens if re.search(r"[A-Za-z0-9]", token))


def normalize(value: str) -> str:
    return re.sub(r"[^a-z]", "", value.lower())


def build_markdown(article: dict[str, Any]) -> str:
    metrics = article["metrics"]
    lines: list[str] = [
        f'# {article["id"]} · {article["title"]}',
        "",
        f'> 题材：{article["topic"]}',
        f'> 状态：**{article["status"]}**（{article["date"]}）',
        f'> 指标：{metrics["words"]} 词 / {metrics["keywords"]} 重点词 / 密度 {float(metrics["density"]):.1f}%',
    ]
    if article.get("standfirst"):
        lines.append(f'> {article["standfirst"]}')

    lines += ["", "---", "", "## 英文正文", ""]
    for paragraph in article["paras"]:
        lines += [paragraph["en"], ""]

    lines += [
        "---",
        "",
        "## 中文译文",
        "",
        "> 铁律：英文加粗词在中文里对应的译法同样加粗，后附 `(english)` 括注词源。",
        "> 中文按最自然的说法写，加粗落在自然说法上——不为对齐扭曲句法。",
        "",
    ]
    for paragraph in article["paras"]:
        lines += [paragraph["zh"], ""]

    lines += ["---", "", f'## {metrics["keywords"]} 词速查表', ""]
    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for item in article["glossary"]:
        grouped[int(item["p"])].append(item)
    for paragraph_no in sorted(grouped):
        items = "｜".join(f'{item["w"]} {item["zh"]}' for item in grouped[paragraph_no])
        lines += [f"**§{paragraph_no}**（{len(grouped[paragraph_no])}词）{items}", ""]

    if article.get("facts"):
        lines += ["---", "", "## 史实核对", "", "以下关键信息已据所列来源核对：", ""]
        for fact in article["facts"]:
            lines.append(f"- {fact}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def validate_article(article: dict[str, Any]) -> tuple[list[str], int, int, float]:
    problems: list[str] = []
    article_id = article.get("id", "?")
    metrics = article.get("metrics", {})
    paragraphs = article.get("paras", [])
    glossary = article.get("glossary", [])

    if not paragraphs:
        problems.append("  没有正文段落")
    expected_paragraphs = 4 if str(article_id) == "01" else 5
    if len(paragraphs) != expected_paragraphs:
        problems.append(
            f"  正文为 {len(paragraphs)} 段；当前文章标准为 {expected_paragraphs} 段"
        )

    total_en = total_zh = 0
    for number, paragraph in enumerate(paragraphs, 1):
        en_forms = [match.group(1) for match in BOLD_RE.finditer(paragraph.get("en", ""))]
        zh_forms = [match.group(2) for match in ZH_PAIR_RE.finditer(paragraph.get("zh", ""))]
        total_en += len(en_forms)
        total_zh += len(zh_forms)

        en_counter = Counter(normalize(form) for form in en_forms)
        zh_counter = Counter(normalize(form) for form in zh_forms)
        if en_counter != zh_counter:
            missing = list((en_counter - zh_counter).elements())
            extra = list((zh_counter - en_counter).elements())
            if missing:
                problems.append(f"  §{number} 中文缺对应：{', '.join(missing)}")
            if extra:
                problems.append(f"  §{number} 中文多出：{', '.join(extra)}")

    expected_keywords = int(metrics.get("keywords", 0))
    if total_en != expected_keywords:
        problems.append(f"  英文加粗 {total_en} 个，metrics 为 {expected_keywords}")
    if total_zh != expected_keywords:
        problems.append(f"  中文对应 {total_zh} 个，metrics 为 {expected_keywords}")
    if len(glossary) != expected_keywords:
        problems.append(f"  速查表 {len(glossary)} 条，metrics 为 {expected_keywords}")

    word_count = sum(count_words(paragraph.get("en", "")) for paragraph in paragraphs)
    if word_count != int(metrics.get("words", 0)):
        problems.append(f'  实测 {word_count} 词，metrics 为 {metrics.get("words")}')

    density = round(total_en / word_count * 100, 1) if word_count else 0.0
    if density != float(metrics.get("density", 0)):
        problems.append(f'  实测密度 {density}%，metrics 为 {metrics.get("density")}%')
    if density > 20:
        problems.append(f"  密度 {density}% 越过 20% 红线")

    local_lemmas = [normalize(str(item.get("w", ""))) for item in glossary]
    repeated_local = [lemma for lemma, count in Counter(local_lemmas).items() if count > 1]
    if repeated_local:
        problems.append("  本篇速查表词元重复：" + ", ".join(sorted(repeated_local)))

    if str(article_id).zfill(2) != str(article_id):
        problems.append(f"  编号应为两位字符串，当前为 {article_id!r}")

    return problems, word_count, total_en, density


def validate_archive(articles: list[dict[str, Any]]) -> list[str]:
    problems: list[str] = []

    for field in ("id", "slug"):
        values = [str(article.get(field, "")) for article in articles]
        duplicates = [value for value, count in Counter(values).items() if value and count > 1]
        if duplicates:
            problems.append(f"全库 {field} 重复：" + ", ".join(sorted(duplicates)))

    lemma_origins: dict[str, list[str]] = defaultdict(list)
    surface_origins: dict[str, list[str]] = defaultdict(list)
    for article in articles:
        aid = str(article["id"])
        for item in article.get("glossary", []):
            lemma_origins[normalize(str(item["w"]))].append(aid)
        for paragraph in article.get("paras", []):
            for form in BOLD_RE.findall(paragraph.get("en", "")):
                surface_origins[normalize(form)].append(aid)

    duplicate_lemmas = {
        lemma: ids for lemma, ids in lemma_origins.items() if len(set(ids)) > 1
    }
    duplicate_surfaces = {
        surface: ids for surface, ids in surface_origins.items() if len(set(ids)) > 1
    }
    if duplicate_lemmas:
        preview = "; ".join(
            f"{lemma}({','.join(sorted(set(ids)))})"
            for lemma, ids in sorted(duplicate_lemmas.items())[:20]
        )
        problems.append("跨篇速查表词元重复：" + preview)
    if duplicate_surfaces:
        preview = "; ".join(
            f"{surface}({','.join(sorted(set(ids)))})"
            for surface, ids in sorted(duplicate_surfaces.items())[:20]
        )
        problems.append("跨篇英文加粗表面形式重复：" + preview)

    return problems


def main() -> int:
    site = load_site()
    articles = sorted(site.get("ARTICLES", []), key=lambda item: str(item["id"]))
    OUT.mkdir(exist_ok=True)

    error_count = 0
    for article in articles:
        problems, words, keywords, density = validate_article(article)
        path = OUT / f'{article["id"]}-{article["slug"]}.md'
        path.write_text(build_markdown(article), encoding="utf-8")
        flag = "✗" if problems else "✓"
        print(f'{flag} {path.relative_to(ROOT)}  {words} 词 · {keywords} 重点词 · {density}%')
        for problem in problems:
            print(problem)
        error_count += len(problems)

    archive_problems = validate_archive(articles)
    for problem in archive_problems:
        print("✗ " + problem)
    error_count += len(archive_problems)

    total_keywords = sum(len(article.get("glossary", [])) for article in articles)
    print(
        f"\n{len(articles)} 篇已生成 · {total_keywords} 个重点词"
        + (f" · {error_count} 处问题" if error_count else " · 全部通过")
    )
    return 1 if error_count else 0


if __name__ == "__main__":
    sys.exit(main())
