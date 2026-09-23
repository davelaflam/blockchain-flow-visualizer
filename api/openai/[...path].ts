// Vercel serverless function — mirrors the dev-server proxy in vite.config.ts.
// Forwards /api/openai/* to https://api.openai.com/v1/* with the API key
// injected server-side, so it never reaches the browser.
export default async function handler(req: any, res: any) {
  const path = ([] as string[]).concat(req.query.path ?? []).join('/');
  const upstream = await fetch(`https://api.openai.com/v1/${path}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body),
  });

  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
  res.send(await upstream.text());
}
