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

const names = new Set();
const repositories = new Set();
const urls = new Set();
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

  const nameKey = entry.name.toLowerCase();
  if (names.has(nameKey)) {
    throw new Error(`${label}: duplicate name ${entry.name}`);
  }
  names.add(nameKey);

  const repositoryKey = `${entry.owner}/${entry.repo}`;
  if (repositories.has(repositoryKey)) {
    throw new Error(`${label}: duplicate repository ${repositoryKey}`);
  }
  repositories.add(repositoryKey);

  if (urls.has(entry.url)) {
    throw new Error(`${label}: duplicate url ${entry.url}`);
  }
  urls.add(entry.url);

  if (featured.has(entry.featured)) {
    throw new Error(`${label}: duplicate featured value ${entry.featured}`);
  }
  featured.add(entry.featured);
}

console.log(`Validated ${entries.length} tools.`);
