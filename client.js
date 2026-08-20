// dsh-stock-ticker — Client half (dynamic-plugin form)
//
// This file is the exact `code.client` body for a DeepSeek Harness dynamic
// Cordis plugin. Load it with the Client `code.client` of `cordis_define`.
//
// It injects a draggable, collapsible floating window into `shell.overlay`,
// polls `getQuotes` every 5s, and renders each index as name + price + change%.
// The card background follows the DSH theme surface token at 80% opacity, so it
// stays consistent with the app's look while text and up/down colors stay crisp.

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
.shq-widget{position:fixed;z-index:99999;width:216px;background:#1a1c23;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 80%, transparent);color:var(--dsw-alias-label-primary,#eef0f4);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.25);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.shq-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:grab;touch-action:none;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08))}
.shq-head:active{cursor:grabbing}
.shq-title{font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary,#c7ccd6)}
.shq-toggle{width:18px;height:18px;border:none;border-radius:6px;background:var(--dsw-alias-border-l1,rgba(255,255,255,.1));color:var(--dsw-alias-label-secondary,#aab0bc);cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;opacity:.85}
.shq-toggle:hover{background:var(--dsw-alias-border-l2,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#eef0f4)}
.shq-body{padding:5px 12px 8px}
.shq-row{display:flex;align-items:baseline;padding:6px 0}
.shq-row + .shq-row{border-top:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.07))}
.shq-name{font-size:12.5px;color:var(--dsw-alias-label-secondary,#c7ccd6);flex:1}
.shq-price{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
.shq-pct{font-size:11.5px;font-weight:700;font-variant-numeric:tabular-nums;width:64px;text-align:right}
.shq-err{font-size:12px;color:var(--dsw-alias-label-secondary,#8f96a3);padding:4px 0}
`))

    function Row(item) {
      const c = (item && typeof item.changePct === 'number')
        ? (item.changePct > 0 ? UP : item.changePct < 0 ? DOWN : NEUTRAL)
        : NEUTRAL
      return React.createElement('div', { className: 'shq-row', key: item.code },
        React.createElement('span', { className: 'shq-name' }, item.name),
        React.createElement('span', { className: 'shq-price', style: { color: c } }, fmt(item.price)),
        React.createElement('span', { className: 'shq-pct', style: { color: c } }, sign(item.changePct) + fmt(item.changePct) + '%')
      )
    }

    function StockWidget() {
      const [items, setItems] = React.useState(null)
      const [err, setErr] = React.useState(null)
      const [pos, setPos] = React.useState({ x: 16, y: 16 })
      const [collapsed, setCollapsed] = React.useState(false)
      const drag = React.useRef(null)

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

      const onDown = (e) => {
        drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
        if (e.currentTarget && e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
      }
      const onMove = (e) => {
        if (!drag.current) return
        setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy })
      }
      const onUp = () => { drag.current = null }

      return React.createElement('div', { className: 'shq-widget', style: { left: pos.x + 'px', top: pos.y + 'px' } },
        React.createElement('div', {
          className: 'shq-head',
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerCancel: onUp,
        },
          React.createElement('span', { className: 'shq-title' }, '行情'),
          React.createElement('button', {
            className: 'shq-toggle',
            title: collapsed ? '展开' : '收起',
            onPointerDown: (e) => e.stopPropagation(),
            onClick: () => setCollapsed((v) => !v),
          }, collapsed ? '+' : '—')
        ),
        collapsed ? null : (items && items.length
          ? React.createElement('div', { className: 'shq-body' }, items.map(Row))
          : React.createElement('div', { className: 'shq-body' },
              React.createElement('div', { className: 'shq-err' }, err || '加载中…')
            )
        )
      )
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'shq-floating' },
      () => React.createElement(StockWidget),
    ))
  },
}
