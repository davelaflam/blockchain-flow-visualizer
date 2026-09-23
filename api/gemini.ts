// Vercel serverless function — mirrors the dev-server proxy in vite.config.ts.
// Forwards /api/gemini?model=<name> to
// https://generativelanguage.googleapis.com/v1beta/models/<name>:generateContent
// with the API key injected server-side, so it never reaches the browser.
export default async function handler(req: any, res: any) {
  const url = new URL(String(req.url ?? ''), 'http://localhost');
  const model = url.searchParams.get('model') ?? 'gemini-3.5-flash-lite';
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY ?? '',
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
    }
  );

  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
  res.send(await upstream.text());
}
