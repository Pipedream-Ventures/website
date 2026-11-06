// Rebuilds the AllTails field notes page from one Markdown file per entry.
// A GitHub Action runs this when an entry changes. File names are dates: 2026-11-05.md
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

const dir = "apps/alltails/field-notes";
const page = "apps/alltails/field-notes.html";
const entries = readdirSync(dir)
  .filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
  .sort()
  .reverse()
  .map((name) => {
    const date = name.slice(0, 10);
    const label = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    const body = marked.parse(readFileSync(`${dir}/${name}`, "utf8"), { async: false });
    return `    <article id="${date}">\n      <h2><a href="#${date}"><time datetime="${date}">${label}</time></a></h2>\n${body}    </article>`;
  });
const html = readFileSync(page, "utf8").replace(/<!-- entries -->[\s\S]*<!-- \/entries -->/, `<!-- entries -->\n${entries.join("\n")}\n    <!-- /entries -->`);
writeFileSync(page, html);
