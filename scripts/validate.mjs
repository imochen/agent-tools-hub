import { readFile } from "node:fs/promises";

const allowedTypes = new Set([
  "Skill",
  "MCP Server",
  "Plugin",
  "Prompt",
  "Workflow",
  "Browser Tool",
  "Dev Tool",
]);

const text = await readFile(new URL("../data/skills.json", import.meta.url), "utf8");
const entries = JSON.parse(text);

if (!Array.isArray(entries)) {
  throw new Error("data/skills.json must contain an array");
}

const seen = new Set();
const featured = new Set();

for (const [index, entry] of entries.entries()) {
  const label = entry?.name || `entry #${index + 1}`;
  for (const field of ["name", "owner", "repo", "type", "description", "url", "featured"]) {
    if (entry[field] === undefined || entry[field] === "") {
      throw new Error(`${label}: missing ${field}`);
    }
  }

  if (!allowedTypes.has(entry.type)) {
    throw new Error(`${label}: unsupported type ${entry.type}`);
  }

  if (!Array.isArray(entry.surfaces) || entry.surfaces.length === 0) {
    throw new Error(`${label}: surfaces must be a non-empty array`);
  }

  if (!Array.isArray(entry.tags) || entry.tags.length !== 3) {
    throw new Error(`${label}: tags must contain exactly 3 items`);
  }

  const expectedUrl = `https://github.com/${entry.owner}/${entry.repo}`;
  if (entry.url !== expectedUrl) {
    throw new Error(`${label}: url must be ${expectedUrl}`);
  }

  const key = `${entry.owner}/${entry.repo}`;
  if (seen.has(key)) {
    throw new Error(`${label}: duplicate repository ${key}`);
  }
  seen.add(key);

  if (featured.has(entry.featured)) {
    throw new Error(`${label}: duplicate featured value ${entry.featured}`);
  }
  featured.add(entry.featured);
}

console.log(`Validated ${entries.length} tools.`);
