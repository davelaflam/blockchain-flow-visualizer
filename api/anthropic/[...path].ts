// Vercel serverless function — mirrors the dev-server proxy in vite.config.ts.
// Forwards /api/anthropic/* to https://api.anthropic.com/v1/* with the API key
// injected server-side, so it never reaches the browser.
export default async function handler(req: any, res: any) {
  const [pathname, query] = String(req.url ?? '').split('?');
  const path = pathname.replace(/^\/api\/anthropic\/?/, '');
  const upstream = await fetch(`https://api.anthropic.com/v1/${path}${query ? `?${query}` : ''}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
  });

  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
  res.send(await upstream.text());
}
