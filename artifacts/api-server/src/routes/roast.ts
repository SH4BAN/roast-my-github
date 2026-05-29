import { Router } from "express";
import { db } from "@workspace/db";
import { roastsTable } from "@workspace/db";
import { desc, count, avg, sql } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
const router = Router();

const RoastInputSchema = z.object({
  username: z.string().min(1),
  intensity: z.enum(["mild", "medium", "savage"]).default("medium"),
});

async function fetchGithubProfile(username: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "roast-my-github",
  };

  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (userRes.status === 404) return null;
  if (!userRes.ok) throw new Error(`GitHub API error: ${userRes.status}`);

  const user = await userRes.json() as {
    login: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    avatar_url: string;
  };

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=stars`,
    { headers }
  );

  let topLanguages: string[] = [];
  let mostStarredRepo: string | null = null;
  let totalStars = 0;

  if (reposRes.ok) {
    const repos = await reposRes.json() as Array<{
      name: string;
      language: string | null;
      stargazers_count: number;
    }>;

    const langCounts: Record<string, number> = {};
    for (const repo of repos) {
      totalStars += repo.stargazers_count;
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }

    topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    if (repos.length > 0 && repos[0].stargazers_count > 0) {
      mostStarredRepo = repos[0].name;
    }
  }

  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
    avatarUrl: user.avatar_url,
    topLanguages,
    mostStarredRepo,
    totalStars,
  };
}

function buildRoastPrompt(
  profile: NonNullable<Awaited<ReturnType<typeof fetchGithubProfile>>>,
  intensity: string
): string {
  const accountAge = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  const intensityInstructions: Record<string, string> = {
    mild: "Be playfully teasing — like a friend making fun of your code. Light and good-natured.",
    medium: "Be sharp and witty — like a senior dev doing a code review who has seen too much. Pointed but still funny.",
    savage: "Go absolutely savage — no mercy. Tear apart every aspect of their GitHub like a brutally honest tech interviewer who has given up on humanity. Still keep it funny, not mean-spirited.",
  };

  return `You are Samuel L. Jackson roasting a developer's GitHub profile. Channel his iconic voice — intense, explosive, brutally direct, with his signature profanity and dramatic emphasis. You do NOT hold back. You sound EXACTLY like Samuel L. Jackson in his most fired-up moments.

GitHub Profile Data:
- Username: ${profile.login}
- Name: ${profile.name || "No name set (mysterious or embarrassed?)"}
- Bio: ${profile.bio || "No bio (too cool to explain themselves or too lazy?)"}
- Public repos: ${profile.publicRepos}
- Followers: ${profile.followers}
- Following: ${profile.following}
- Account age: ${accountAge} years
- Top languages: ${profile.topLanguages.length > 0 ? profile.topLanguages.join(", ") : "None detected (empty repos?)"}
- Most starred repo: ${profile.mostStarredRepo || "None with stars (0/10 popularity)"}
- Total stars: ${profile.totalStars}

Intensity level: ${intensityInstructions[intensity] || intensityInstructions.medium}

Write exactly 2 sentences in Samuel L. Jackson's voice — explosive, profanity-laced, and devastating. Reference their real stats. No emojis. No bullet points. Make it sound like he just looked at their GitHub and completely lost his mind.`;
}

// POST /api/roast
router.post("/roast", async (req, res) => {
  const parsed = RoastInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  let { username, intensity } = parsed.data;

  // Strip full URL prefix if user pastes e.g. "github.com/torvalds" or "https://github.com/torvalds"
  username = username.replace(/^https?:\/\//i, "").replace(/^github\.com\//i, "").trim();

  let profile;
  try {
    profile = await fetchGithubProfile(username);
  } catch {
    res.status(500).json({ error: "Failed to fetch GitHub profile" });
    return;
  }

  if (!profile) {
    res.status(404).json({ error: `GitHub user "${username}" not found` });
    return;
  }

  const prompt = buildRoastPrompt(profile, intensity);

  let roast: string;
  try {
    const result = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });
    let text: string | undefined;
    try { text = result.text; } catch { text = undefined; }
    roast = text?.trim() || "Your code is so bad, even AI refuses to roast it.";
  } catch (err) {
    req.log.error({ err }, "Gemini API error");
    res.status(500).json({ error: "Failed to generate roast. The AI is judging you too hard to respond." });
    return;
  }

  try {
    await db.insert(roastsTable).values({
      username: profile.login,
      avatarUrl: profile.avatarUrl,
      roast,
      intensity,
      publicRepos: profile.publicRepos,
      followers: profile.followers,
      topLanguage: profile.topLanguages[0] ?? null,
      totalStars: profile.totalStars,
    });
  } catch (err) {
    req.log.error({ err }, "DB insert error");
  }

  res.json({ roast, username: profile.login, githubProfile: profile });
});

// GET /api/roast/history
router.get("/roast/history", async (_req, res) => {
  const records = await db
    .select()
    .from(roastsTable)
    .orderBy(desc(roastsTable.createdAt))
    .limit(20);

  res.json(
    records.map((r) => ({
      id: r.id,
      username: r.username,
      avatarUrl: r.avatarUrl,
      roast: r.roast,
      intensity: r.intensity,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

// GET /api/roast/stats
router.get("/roast/stats", async (_req, res) => {
  const [totalResult] = await db
    .select({ total: count() })
    .from(roastsTable);

  const [avgReposResult] = await db
    .select({ avg: avg(roastsTable.publicRepos) })
    .from(roastsTable);

  const mostRoastedResult = await db
    .select({ username: roastsTable.username, cnt: count() })
    .from(roastsTable)
    .groupBy(roastsTable.username)
    .orderBy(desc(count()))
    .limit(1);

  const mostCommonLangResult = await db
    .select({ lang: roastsTable.topLanguage, cnt: count() })
    .from(roastsTable)
    .where(sql`${roastsTable.topLanguage} IS NOT NULL`)
    .groupBy(roastsTable.topLanguage)
    .orderBy(desc(count()))
    .limit(1);

  res.json({
    totalRoasts: totalResult?.total ?? 0,
    mostRoastedUser: mostRoastedResult[0]?.username ?? null,
    mostCommonLanguage: mostCommonLangResult[0]?.lang ?? null,
    averageRepos: parseFloat(avgReposResult?.avg ?? "0") || 0,
  });
});

export default router;
