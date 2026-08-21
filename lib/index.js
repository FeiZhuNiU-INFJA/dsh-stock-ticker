// Host half of dsh-stock-ticker.
//
// Registers one same-origin HTTP route, `/dsh-stock-ticker/quotes`, that fetches
// the four indices from Tencent's quote endpoint (via the `shell` service +
// `curl`, because the default deployment ships no `web` fetch provider) and
// serves them as lossless JSON. The client bundle polls this route.

export const name = "dsh-stock-ticker";

export const inject = ["webServer", "shell"];

const NAMES = {
  "000001": "上证指数",
  "399006": "创业板指",
  "000688": "科创50",
  HSTECH: "恒生科技",
};

const toNum = (s) => {
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Object.is(n, -0) ? 0 : n;
};

async function fetchQuotes(shell) {
  const spec = shell.resolve({
    command: 'curl -sS --max-time 8 "https://qt.gtimg.cn/q=sh000001,sz399006,sh000688,hkHSTECH"',
    timeoutMs: 10000,
  });
  const res = await shell.run(spec);
  const content = res && res.stdout && typeof res.stdout.text === "string" ? res.stdout.text : "";
  if (!content) return null;

  const items = [];
  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    const a = line.indexOf('"');
    const b = line.lastIndexOf('"');
    if (a === -1 || b <= a) continue;
    const f = line.slice(a + 1, b).split("~");
    const code = f[2];
    const name = NAMES[code];
    if (!name) continue;
    items.push({ name, code, price: toNum(f[3]), changePct: toNum(f[32]) });
  }
  return items.length ? items : null;
}

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: "exact",
    path: "/dsh-stock-ticker/quotes",
    handler: async (req, res) => {
      try {
        const items = await fetchQuotes(ctx.shell);
        const body = JSON.stringify({ ok: items !== null, items: items || [] });
        res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(body);
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }));
      }
    },
  }), "dsh-stock-ticker: /quotes route");
}
