import { readFile, writeFile } from "node:fs/promises";

const allowedTypes = new Set([
  "Skill",
  "MCP Server",
  "Plugin",
  "Prompt",
  "Workflow",
  "Browser Tool",
  "Dev Tool",
]);

const allowedSurfaces = [
  "Skill",
  "MCP Server",
  "Plugin",
  "CLI",
  "CLI Installer",
  "Agent Instructions",
  "Prompt",
  "Workflow",
  "Browser Tool",
  "Dev Tool",
  "Hooks",
  "Templates",
  "Presets",
  "Agent Commands",
  "Tools",
];

const githubToken = process.env.GITHUB_TOKEN;
const issueBody = process.env.ISSUE_BODY || "";
const issueTitle = process.env.ISSUE_TITLE || "";
const issueNumber = process.env.ISSUE_NUMBER || "";

if (!githubToken && !process.env.OPENAI_API_KEY) {
  throw new Error("GITHUB_TOKEN or OPENAI_API_KEY is required");
}

function parseIssueForm(body) {
  const result = {};
  const matches = [...body.matchAll(/^###\s+(.+?)\s*\n\n([\s\S]*?)(?=\n###\s+|\s*$)/gm)];
  for (const match of matches) {
    result[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return result;
}

function parseGithubUrl(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:[/?#].*)?$/i);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${trimmed}`);
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
    url: `https://github.com/${match[1]}/${match[2].replace(/\.git$/i, "")}`,
  };
}

async function githubJson(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "agent-tools-hub",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} from GitHub API ${path}: ${await response.text()}`);
  }
  return response.json();
}

async function githubText(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "agent-tools-hub",
    },
  });
  if (!response.ok) return "";
  return response.text();
}

async function readRepoContext(owner, repo) {
  const metadata = await githubJson(`/repos/${owner}/${repo}`);
  const root = await githubJson(`/repos/${owner}/${repo}/contents?ref=${metadata.default_branch}`);
  const rootFiles = Array.isArray(root)
    ? root.map((item) => ({ name: item.name, type: item.type, path: item.path })).slice(0, 120)
    : [];

  const readme = await githubText(`/repos/${owner}/${repo}/readme`);
  const usefulFiles = [];
  const candidates = [
    "package.json",
    "pyproject.toml",
    "SKILL.md",
    "AGENTS.md",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
  ];

  for (const file of candidates) {
    try {
      const text = await githubText(`/repos/${owner}/${repo}/contents/${encodeURIComponent(file)}?ref=${metadata.default_branch}`);
      if (text) usefulFiles.push({ path: file, text: text.slice(0, 6000) });
    } catch {
      // Optional context file.
    }
  }

  return {
    full_name: metadata.full_name,
    name: metadata.name,
    description: metadata.description,
    default_branch: metadata.default_branch,
    topics: metadata.topics || [],
    language: metadata.language,
    rootFiles,
    readme: readme.slice(0, 12000),
    usefulFiles,
  };
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Model did not return JSON: ${text.slice(0, 500)}`);
  }
  return JSON.parse(raw.slice(start, end + 1));
}

async function callModel({ repoContext, hintedType, notes }) {
  const system = [
    "You classify GitHub repositories for Agent Tools Hub.",
    "Return strict JSON only.",
    "description must be one concise Chinese sentence.",
    "tags must contain exactly 3 concise Chinese labels or common acronyms.",
    `type must be one of: ${[...allowedTypes].join(", ")}.`,
    `surfaces may use: ${allowedSurfaces.join(", ")}.`,
    "Do not invent capabilities that are not supported by repository evidence.",
  ].join("\n");

  const user = JSON.stringify(
    {
      issue: { number: issueNumber, title: issueTitle, hintedType, notes },
      repository: repoContext,
      requiredJsonShape: {
        name: "Display name",
        type: "Primary type",
        surfaces: ["Actual usage forms"],
        description: "中文一句话介绍",
        tags: ["标签1", "标签2", "标签3"],
      },
    },
    null,
    2,
  );

  const useOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const endpoint = useOpenAI
    ? "https://api.openai.com/v1/chat/completions"
    : "https://models.github.ai/inference/chat/completions";
  const token = useOpenAI ? process.env.OPENAI_API_KEY : githubToken;
  const model = useOpenAI
    ? process.env.OPENAI_MODEL || "gpt-4.1-mini"
    : process.env.GITHUB_MODELS_MODEL || "openai/gpt-4.1-mini";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} from model API: ${await response.text()}`);
  }

  const data = await response.json();
  return extractJson(data.choices?.[0]?.message?.content || "");
}

function sanitizeAnalysis(analysis, fallback) {
  const type = allowedTypes.has(analysis.type) ? analysis.type : fallback.type;
  const surfaces = Array.isArray(analysis.surfaces)
    ? analysis.surfaces.map(String).map((value) => value.trim()).filter(Boolean)
    : [type];
  const tags = Array.isArray(analysis.tags)
    ? analysis.tags.map(String).map((value) => value.trim()).filter(Boolean).slice(0, 3)
    : [];

  while (tags.length < 3) tags.push(["工具", "开发", "AI"][tags.length]);

  return {
    name: String(analysis.name || fallback.name).trim(),
    type,
    surfaces: surfaces.length ? [...new Set(surfaces)] : [type],
    description: String(analysis.description || fallback.description).trim(),
    tags,
  };
}

const form = parseIssueForm(issueBody);
const urlValue = form["github url"] || form["url"] || "";
const hintedType = form["primary type"] || "Dev Tool";
const notes = form.notes || "";
const repoRef = parseGithubUrl(urlValue);
const skillsUrl = new URL("../data/skills.json", import.meta.url);
const entries = JSON.parse(await readFile(skillsUrl, "utf8"));

if (entries.some((entry) => entry.owner === repoRef.owner && entry.repo === repoRef.repo)) {
  throw new Error(`${repoRef.owner}/${repoRef.repo} already exists in data/skills.json`);
}

const repoContext = await readRepoContext(repoRef.owner, repoRef.repo);
const modelAnalysis = await callModel({ repoContext, hintedType, notes });
const analysis = sanitizeAnalysis(modelAnalysis, {
  name: repoContext.name,
  type: allowedTypes.has(hintedType) ? hintedType : "Dev Tool",
  description: repoContext.description || `${repoContext.name} 工具。`,
});

const nextFeatured = Math.max(0, ...entries.map((entry) => Number(entry.featured) || 0)) + 1;
entries.push({
  name: analysis.name,
  owner: repoRef.owner,
  repo: repoRef.repo,
  type: analysis.type,
  surfaces: analysis.surfaces,
  description: analysis.description,
  tags: analysis.tags,
  url: repoRef.url,
  featured: nextFeatured,
});

await writeFile(skillsUrl, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Added ${repoRef.owner}/${repoRef.repo} as ${analysis.type}.`);
