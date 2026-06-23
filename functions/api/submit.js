export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  const required = ["name", "url", "description"];
  const missing = required.filter((field) => !payload[field]);

  if (missing.length > 0) {
    return Response.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return Response.json({ error: "Submission backend is not configured" }, { status: 501 });
  }

  const body = [
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");

  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "skill-navigator",
    },
    body: JSON.stringify({
      title: `Tool submission: ${payload.name}`,
      body,
      labels: ["skill-submission"],
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "GitHub issue creation failed" }, { status: 502 });
  }

  const issue = await response.json();
  return Response.json({ url: issue.html_url });
}
