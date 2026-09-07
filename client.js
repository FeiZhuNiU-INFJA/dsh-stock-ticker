// dsh-stock-ticker — Client half (dynamic-plugin form), bottom-bar variant
//
// This file is the exact `code.client` body for a DeepSeek Harness dynamic
// Cordis plugin. Load it with the Client `code.client` of `cordis_define`.
//
// It injects a fixed, full-width bar at the bottom of the window into
// `shell.overlay`, polls `getQuotes` every 5s, and renders each index as
// name + price + change% laid out horizontally. The bar can be collapsed to a
// small bottom-right pill so it never blocks the composer.

const UP = '#ff3b30'
const DOWN = '#00e08a'
const NEUTRAL = 'var(--dsw-alias-label-primary)'

const fmt = (n) => {
  const v = Number(n)
  return (n == null || !Number.isFinite(v)) ? '--' : v.toFixed(2)
}
const sign = (n) => (n > 0 ? '+' : '')

return {
  inject: ['timer'],
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    ctx.effect(() => styles.insert(`
.shq-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;height:42px;display:flex;align-items:stretch;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 85%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));color:var(--dsw-alias-label-primary,#eef0f4);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;font-variant-numeric:tabular-nums}
.shq-bar-label{display:flex;align-items:center;padding:0 14px;font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary,#c7ccd6);border-right:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08));white-space:nowrap}
.shq-bar-list{display:flex;align-items:center;gap:2px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none;padding:0 4px}
.shq-bar-list::-webkit-scrollbar{display:none}
.shq-item{display:flex;align-items:baseline;gap:7px;padding:0 12px;white-space:nowrap}
.shq-item + .shq-item{border-left:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.07))}
.shq-name{font-size:12px;color:var(--dsw-alias-label-secondary,#c7ccd6)}
.shq-price{font-size:13.5px;font-weight:700}
.shq-pct{font-size:12px;font-weight:700}
.shq-toggle{width:42px;flex:0 0 auto;border:none;border-left:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08));background:transparent;color:var(--dsw-alias-label-secondary,#aab0bc);cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center}
.shq-toggle:hover{background:var(--dsw-alias-border-l1,rgba(255,255,255,.08));color:var(--dsw-alias-label-primary,#eef0f4)}
.shq-pill{position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 90%, transparent);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));color:var(--dsw-alias-label-secondary,#c7ccd6);font-size:12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2)}
.shq-pill:hover{color:var(--dsw-alias-label-primary,#eef0f4)}
.shq-err{font-size:12px;color:var(--dsw-alias-label-secondary,#8f96a3);padding:0 14px;white-space:nowrap}
`))

    function Item(item) {
      const c = (item && typeof item.changePct === 'number')
        ? (item.changePct > 0 ? UP : item.changePct < 0 ? DOWN : NEUTRAL)
        : NEUTRAL
      return React.createElement('div', { className: 'shq-item', key: item.code },
        React.createElement('span', { className: 'shq-name' }, item.name),
        React.createElement('span', { className: 'shq-price', style: { color: c } }, fmt(item.price)),
        React.createElement('span', { className: 'shq-pct', style: { color: c } }, sign(item.changePct) + fmt(item.changePct) + '%')
      )
    }

    function TickerBar() {
      const [items, setItems] = React.useState(null)
      const [err, setErr] = React.useState(null)
      const [collapsed, setCollapsed] = React.useState(false)

      React.useEffect(() => {
        let alive = true
        const load = async () => {
          try {
            const data = await host.call('getQuotes')
            if (!alive) return
            if (data && data.ok) { setItems(data.items || []); setErr(null) }
            else setErr((data && data.error) || '获取失败')
          } catch (e) {
            if (alive) setErr(String((e && e.message) || e))
          }
        }
        load()
        const stop = ctx.interval(load, 5000)
        return () => { alive = false; stop() }
      }, [])

      if (collapsed) {
        return React.createElement('button', {
          className: 'shq-pill',
          title: '展开行情',
          onClick: () => setCollapsed(false),
        },
          React.createElement('span', null, '+'),
          React.createElement('span', null, '行情')
        )
      }

      const body = (items && items.length)
        ? React.createElement('div', { className: 'shq-bar-list' }, items.map(Item))
        : React.createElement('div', { className: 'shq-err' }, err || '加载中…')

      return React.createElement('div', { className: 'shq-bar' },
        React.createElement('div', { className: 'shq-bar-label' }, '行情'),
        body,
        React.createElement('button', {
          className: 'shq-toggle',
          title: '收起',
          onClick: () => setCollapsed(true),
        }, '—')
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'shq-bar' },
      () => React.createElement(TickerBar),
    ))
  },
}
