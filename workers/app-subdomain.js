// Cloudflare Worker — proxies app.anchorkit.net to the GitHub Pages deployment
// at anchorkit.net so that both domains serve the same SPA bundle.
//
// Deploy steps:
//  1. In Cloudflare dashboard → Workers & Pages → Create Worker → paste & deploy
//  2. Under the worker's Settings → Triggers → Add Route:
//       app.anchorkit.net/*   (zone: anchorkit.net)
//  3. In DNS, add a CNAME:  app  →  anchorkit.net  (proxied / orange cloud)
//
// The app detects window.location.hostname === 'app.anchorkit.net' at runtime
// and renders only auth + dashboard routes (no marketing pages).

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const originUrl = `https://anchorkit.net${url.pathname}${url.search}`;

  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow',
  });

  return fetch(originRequest);
}
