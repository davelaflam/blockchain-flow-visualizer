// Reports which providers have a server-side key configured, without exposing
// the keys themselves. Mirrors the /api/ai-config endpoint in vite.config.ts.
export default function handler(_req: any, res: any) {
  res.status(200).json({
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    claude: !!process.env.CLAUDE_API_KEY,
  });
}
