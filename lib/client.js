window.__ModuleLoader__.load({
  id: "dsh-stock-ticker",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");

    var UP = "#ff3b30";
    var DOWN = "#00e08a";
    var NEUTRAL = "var(--dsw-alias-label-primary)";

    function fmt(n) {
      var v = Number(n);
      return (n == null || !Number.isFinite(v)) ? "--" : v.toFixed(2);
    }
    function sign(n) {
      return n > 0 ? "+" : "";
    }

    var CSS = ".shq-widget{position:fixed;z-index:99999;width:216px;background:#1a1c23;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 80%, transparent);color:var(--dsw-alias-label-primary,#eef0f4);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.25);font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}" +
      ".shq-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:grab;touch-action:none;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08))}" +
      ".shq-head:active{cursor:grabbing}" +
      ".shq-title{font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary,#c7ccd6)}" +
      ".shq-toggle{width:18px;height:18px;border:none;border-radius:6px;background:var(--dsw-alias-border-l1,rgba(255,255,255,.1));color:var(--dsw-alias-label-secondary,#aab0bc);cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;opacity:.85}" +
      ".shq-toggle:hover{background:var(--dsw-alias-border-l2,rgba(255,255,255,.18));color:var(--dsw-alias-label-primary,#eef0f4)}" +
      ".shq-body{padding:5px 12px 8px}" +
      ".shq-row{display:flex;align-items:baseline;padding:6px 0}" +
      ".shq-row + .shq-row{border-top:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.07))}" +
      ".shq-name{font-size:12.5px;color:var(--dsw-alias-label-secondary,#c7ccd6);flex:1}" +
      ".shq-price{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}" +
      ".shq-pct{font-size:11.5px;font-weight:700;font-variant-numeric:tabular-nums;width:64px;text-align:right}" +
      ".shq-err{font-size:12px;color:var(--dsw-alias-label-secondary,#8f96a3);padding:4px 0}";

    var TAG_ID = "dsh-stock-ticker/style.css";

    function injectStyle(css) {
      var tag = document.querySelector('style[data-plugin-css="' + TAG_ID + '"]');
      if (tag === null) {
        tag = document.createElement("style");
        tag.dataset.plugin = "dsh-stock-ticker";
        tag.dataset.pluginCss = TAG_ID;
        tag.textContent = css;
        document.head.appendChild(tag);
      }
      return function disposeStyle() {
        tag.remove();
      };
    }

    var inject = ["slots"];

    function Row(item) {
      var c = (item && typeof item.changePct === "number")
        ? (item.changePct > 0 ? UP : item.changePct < 0 ? DOWN : NEUTRAL)
        : NEUTRAL;
      return React.createElement("div", { className: "shq-row", key: item.code },
        React.createElement("span", { className: "shq-name" }, item.name),
        React.createElement("span", { className: "shq-price", style: { color: c } }, fmt(item.price)),
        React.createElement("span", { className: "shq-pct", style: { color: c } }, sign(item.changePct) + fmt(item.changePct) + "%")
      );
    }

    function StockWidget() {
      var itemsState = React.useState(null);
      var items = itemsState[0], setItems = itemsState[1];
      var errState = React.useState(null);
      var err = errState[0], setErr = errState[1];
      var posState = React.useState({ x: 16, y: 16 });
      var pos = posState[0], setPos = posState[1];
      var collapsedState = React.useState(false);
      var collapsed = collapsedState[0], setCollapsed = collapsedState[1];
      var drag = React.useRef(null);

      React.useEffect(function () {
        var alive = true;
        function load() {
          fetch("/dsh-stock-ticker/quotes")
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (!alive) return;
              if (data && data.ok) { setItems(data.items || []); setErr(null); }
              else setErr((data && data.error) || "获取失败");
            })
            .catch(function (e) {
              if (alive) setErr(String((e && e.message) || e));
            });
        }
        load();
        var timer = setInterval(load, 5000);
        return function () { alive = false; clearInterval(timer); };
      }, []);

      function onDown(e) {
        drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        if (e.currentTarget && e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
      }
      function onMove(e) {
        if (!drag.current) return;
        setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy });
      }
      function onUp() { drag.current = null; }

      var body = null;
      if (!collapsed) {
        if (items && items.length) {
          body = React.createElement("div", { className: "shq-body" }, items.map(Row));
        } else {
          body = React.createElement("div", { className: "shq-body" },
            React.createElement("div", { className: "shq-err" }, err || "加载中…")
          );
        }
      }

      return React.createElement("div", { className: "shq-widget", style: { left: pos.x + "px", top: pos.y + "px" } },
        React.createElement("div", {
          className: "shq-head",
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerCancel: onUp,
        },
          React.createElement("span", { className: "shq-title" }, "行情"),
          React.createElement("button", {
            className: "shq-toggle",
            title: collapsed ? "展开" : "收起",
            onPointerDown: function (e) { e.stopPropagation(); },
            onClick: function () { setCollapsed(function (v) { return !v; }); },
          }, collapsed ? "+" : "—")
        ),
        body
      );
    }

    function apply(ctx) {
      ctx.effect(function () {
        return injectStyle(CSS);
      }, "dsh-stock-ticker: styles");
      ctx.slots.inject("shell.overlay", function () {
        return ctx.slots.register(
          { name: "shell.overlay", id: "dsh-stock-ticker" },
          function () { return React.createElement(StockWidget); },
        );
      });
    }

    exports.name = "dsh-stock-ticker";
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
