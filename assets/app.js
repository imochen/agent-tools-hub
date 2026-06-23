const state = {
  skills: [],
  tag: "all",
  type: "all",
  sort: "featured",
  stars: {},
};

const tagFilters = document.querySelector("#tagFilters");
const typeFilters = document.querySelector("#typeFilters");
const cardsGrid = document.querySelector("#cardsGrid");
const emptyState = document.querySelector("#emptyState");
const sortMenu = document.querySelector("#sortMenu");
const sortButton = document.querySelector("#sortButton");
const sortButtonLabel = document.querySelector("#sortButtonLabel");
const sortOptions = document.querySelector("#sortOptions");
const cardTemplate = document.querySelector("#cardTemplate");

const sortChoices = [
  { value: "featured", label: "默认排序" },
  { value: "stars", label: "Star 最多" },
  { value: "name", label: "名称排序" },
];

function getRepoKey(skill) {
  return `${skill.owner}/${skill.repo}`;
}

function getStarCount(skill) {
  const value = state.stars[getRepoKey(skill)];
  return typeof value === "number" ? value : -1;
}

function formatStars(count) {
  if (typeof count !== "number" || count < 0) return "加载中";
  return new Intl.NumberFormat("en", {
    notation: count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);
}

function parseCompactNumber(value) {
  const match = String(value).trim().toLowerCase().match(/^([\d.]+)\s*([km])?$/);
  if (!match) return null;
  const number = Number(match[1]);
  if (!Number.isFinite(number)) return null;
  const multiplier = match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Math.round(number * multiplier);
}

function getAllTags() {
  return ["all", ...Array.from(new Set(state.skills.flatMap((skill) => skill.tags))).sort()];
}

function getAllTypes() {
  const preferred = ["Skill", "MCP Server", "Plugin", "Prompt", "Workflow", "Browser Tool", "Dev Tool"];
  const available = new Set(state.skills.map((skill) => skill.type || "Tool"));
  const ordered = preferred.filter((type) => available.has(type));
  const rest = Array.from(available).filter((type) => !preferred.includes(type)).sort();
  return ["all", ...ordered, ...rest];
}

function getFilteredSkills() {
  return state.skills
    .filter((skill) => {
      const matchesTag = state.tag === "all" || skill.tags.includes(state.tag);
      const matchesType = state.type === "all" || (skill.type || "Tool") === state.type;
      return matchesTag && matchesType;
    })
    .sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "stars") {
        const diff = getStarCount(b) - getStarCount(a);
        return diff || a.featured - b.featured;
      }
      return a.featured - b.featured;
    });
}

function renderTags() {
  tagFilters.replaceChildren();
  getAllTags().forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tag === "all" ? "全部" : tag;
    button.className = [
      "h-9 cursor-pointer rounded-md border px-3 font-mono text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-run focus:ring-offset-2 focus:ring-offset-ink",
      state.tag === tag
        ? "border-run bg-run text-ink"
        : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-run/50 hover:bg-white/10",
    ].join(" ");
    button.addEventListener("click", () => {
      state.tag = tag;
      render();
    });
    tagFilters.appendChild(button);
  });
}

function renderTypes() {
  typeFilters.replaceChildren();
  getAllTypes().forEach((type) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = type === "all" ? "全部类型" : type;
    button.className = [
      "h-10 cursor-pointer rounded-md border px-3 font-mono text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-run focus:ring-offset-2 focus:ring-offset-ink sm:px-4",
      state.type === type
        ? "border-run bg-run text-ink"
        : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-run/50 hover:bg-white/10",
    ].join(" ");
    button.addEventListener("click", () => {
      state.type = type;
      render();
    });
    typeFilters.appendChild(button);
  });
}

function renderSortOptions() {
  const selected = sortChoices.find((choice) => choice.value === state.sort) || sortChoices[0];
  sortButtonLabel.textContent = selected.label;
  sortOptions.replaceChildren();

  sortChoices.forEach((choice) => {
    const option = document.createElement("button");
    option.type = "button";
    option.role = "option";
    option.setAttribute("aria-selected", String(choice.value === state.sort));
    option.className = [
      "flex h-10 w-full cursor-pointer items-center justify-between rounded px-3 text-left text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-run",
      choice.value === state.sort ? "bg-run text-ink" : "text-slate-200 hover:bg-white/[0.06]",
    ].join(" ");
    option.innerHTML = `
      <span>${choice.label}</span>
      ${
        choice.value === state.sort
          ? '<svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"></path></svg>'
          : ""
      }
    `;
    option.addEventListener("click", () => {
      state.sort = choice.value;
      closeSortMenu();
      renderSortOptions();
      renderCards();
    });
    sortOptions.appendChild(option);
  });
}

function openSortMenu() {
  sortOptions.classList.remove("hidden");
  sortButton.setAttribute("aria-expanded", "true");
}

function closeSortMenu() {
  sortOptions.classList.add("hidden");
  sortButton.setAttribute("aria-expanded", "false");
}

function toggleSortMenu() {
  if (sortOptions.classList.contains("hidden")) {
    openSortMenu();
  } else {
    closeSortMenu();
  }
}

function resetCopyButton(button) {
  button.innerHTML = `
    <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="11" height="11" rx="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    复制链接
  `;
}

function renderCards() {
  const filteredSkills = getFilteredSkills();
  cardsGrid.replaceChildren();
  emptyState.classList.toggle("hidden", filteredSkills.length > 0);

  filteredSkills.forEach((skill) => {
    const key = getRepoKey(skill);
    const node = cardTemplate.content.cloneNode(true);
    node.querySelector('[data-field="owner"]').textContent = key;
    node.querySelector('[data-field="name"]').textContent = skill.name;
    node.querySelector('[data-field="type"]').textContent = skill.type || "Tool";
    node.querySelector('[data-field="description"]').textContent = skill.description;
    node.querySelector('[data-field="github"]').href = skill.url;
    node.querySelector('[data-field="starsBadgeLink"]').href = skill.url;
    node.querySelector('[data-field="starsText"]').textContent = `${formatStars(getStarCount(skill))} stars`;

    const starsBadge = node.querySelector('[data-field="starsBadge"]');
    starsBadge.src = `https://img.shields.io/github/stars/${key}?style=flat-square&label=stars&color=22C55E&labelColor=0F172A`;
    starsBadge.alt = `${key} GitHub stars`;

    const tags = node.querySelector('[data-field="tags"]');
    const surfaces = node.querySelector('[data-field="surfaces"]');
    surfaces.textContent = `形态：${(skill.surfaces || [skill.type || "Tool"]).join(" · ")}`;

    const visibleTags = skill.tags.slice(0, 3);
    const hiddenTagCount = Math.max(skill.tags.length - visibleTags.length, 0);

    visibleTags.forEach((tag) => {
      const tagNode = document.createElement("button");
      tagNode.type = "button";
      tagNode.textContent = tag;
      tagNode.className =
        "h-7 cursor-pointer rounded border border-white/10 bg-white/[0.04] px-2 font-mono text-xs text-slate-300 transition-colors duration-200 hover:border-run/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-run focus:ring-offset-2 focus:ring-offset-panel";
      tagNode.addEventListener("click", () => {
        state.tag = tag;
        render();
      });
      tags.appendChild(tagNode);
    });

    if (hiddenTagCount > 0) {
      const moreTags = document.createElement("span");
      moreTags.textContent = `+${hiddenTagCount}`;
      moreTags.title = skill.tags.slice(visibleTags.length).join(", ");
      moreTags.className = "flex h-7 items-center rounded border border-white/10 bg-white/[0.03] px-2 font-mono text-xs text-slate-500";
      tags.appendChild(moreTags);
    }

    const copyButton = node.querySelector('[data-action="copy"]');
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(skill.url);
      copyButton.textContent = "已复制";
      window.setTimeout(() => resetCopyButton(copyButton), 1200);
    });

    cardsGrid.appendChild(node);
  });
}

function render() {
  renderTags();
  renderTypes();
  renderSortOptions();
  renderCards();
}

async function loadSkills() {
  const response = await fetch("./data/skills.json");
  if (!response.ok) throw new Error("无法加载工具数据");
  state.skills = await response.json();
  render();
  loadStars();
}

async function loadStars() {
  await Promise.all(
    state.skills.map(async (skill) => {
      const key = getRepoKey(skill);
      try {
        const response = await fetch(`https://api.github.com/repos/${key}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error("GitHub API request failed");
        const data = await response.json();
        state.stars[key] = data.stargazers_count;
      } catch {
        try {
          const fallback = await fetch(`https://img.shields.io/github/stars/${key}.json`);
          if (!fallback.ok) throw new Error("Shields fallback failed");
          const data = await fallback.json();
          state.stars[key] = parseCompactNumber(data.value || data.message);
        } catch {
          state.stars[key] = null;
        }
      }
    }),
  );
  renderCards();
}

sortButton.addEventListener("click", toggleSortMenu);

document.addEventListener("click", (event) => {
  if (!sortMenu.contains(event.target)) closeSortMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSortMenu();
});

loadSkills().catch(() => {
  emptyState.classList.remove("hidden");
});
