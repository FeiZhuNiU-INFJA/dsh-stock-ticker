// dsh-market — Host half (dynamic-plugin form)
//
// This file is the exact `code.host` body for a DeepSeek Harness dynamic Cordis
// plugin. Load it with the Host `code.host` of `cordis_define` (see README).
//
// It registers one Package-private RPC, `getQuotes`, that:
//   1. runs `curl` against Tencent's quote endpoint (no auth, plain text),
//   2. parses the `~`-separated rows for four indices,
//   3. returns a small, lossless JSON array of { name, code, price, changePct }.
//
// Network goes through the `shell` service because the default DSH deployment
// ships a search provider but no `web` fetch provider, and the Host sandbox
// withholds native `fetch`.

return {
  apply(ctx) {
    const shell = ctx.get('shell')
    if (shell === undefined) return

    const NAMES = {
      '000001': '上证指数',
      '399006': '创业板指',
      '000688': '科创50',
      'HSTECH': '恒生科技',
    }
    const toNum = (s) => {
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    harness.handle('getQuotes', async () => {
      try {
        const spec = shell.resolve({
          command: 'curl -sS --max-time 8 "https://qt.gtimg.cn/q=sh000001,sz399006,sh000688,hkHSTECH"',
          timeoutMs: 10000,
        })
        const res = await shell.run(spec)
        const content = res && res.stdout && typeof res.stdout.text === 'string' ? res.stdout.text : ''
        if (!content) {
          return { ok: false, error: 'empty output (exit ' + (res && res.exitCode) + ')' }
        }

        const items = []
        for (const line of content.split('\n')) {
          if (!line.trim()) continue
          const a = line.indexOf('"')
          const b = line.lastIndexOf('"')
          if (a === -1 || b <= a) continue
          const f = line.slice(a + 1, b).split('~')
          const code = f[2]
          const name = NAMES[code]
          if (!name) continue
          items.push({
            name,
            code,
            price: toNum(f[3]),
            changePct: toNum(f[32]),
          })
        }
        if (items.length === 0) return { ok: false, error: 'no quotes parsed' }
        return { ok: true, items }
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) }
      }
    })
  },
}
