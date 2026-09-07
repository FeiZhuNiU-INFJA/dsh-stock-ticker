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

    var CSS = ".shq-bar{position:fixed;left:0;right:0;bottom:0;z-index:99999;height:42px;display:flex;align-items:stretch;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 85%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.12));color:var(--dsw-alias-label-primary,#eef0f4);font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;font-variant-numeric:tabular-nums}" +
      ".shq-bar-label{display:flex;align-items:center;padding:0 14px;font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary,#c7ccd6);border-right:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08));white-space:nowrap}" +
      ".shq-bar-list{display:flex;align-items:center;gap:2px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none;padding:0 4px}" +
      ".shq-bar-list::-webkit-scrollbar{display:none}" +
      ".shq-item{display:flex;align-items:baseline;gap:7px;padding:0 12px;white-space:nowrap}" +
      ".shq-item + .shq-item{border-left:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.07))}" +
      ".shq-name{font-size:12px;color:var(--dsw-alias-label-secondary,#c7ccd6)}" +
      ".shq-price{font-size:13.5px;font-weight:700}" +
      ".shq-pct{font-size:12px;font-weight:700}" +
      ".shq-toggle{width:42px;flex:0 0 auto;border:none;border-left:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.08));background:transparent;color:var(--dsw-alias-label-secondary,#aab0bc);cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center}" +
      ".shq-toggle:hover{background:var(--dsw-alias-border-l1,rgba(255,255,255,.08));color:var(--dsw-alias-label-primary,#eef0f4)}" +
      ".shq-pill{position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:color-mix(in srgb, var(--dsw-alias-bg-overlay,#1a1c23) 90%, transparent);border:1px solid var(--dsw-alias-border-l1,rgba(255,255,255,.14));color:var(--dsw-alias-label-secondary,#c7ccd6);font-size:12px;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2)}" +
      ".shq-pill:hover{color:var(--dsw-alias-label-primary,#eef0f4)}" +
      ".shq-err{font-size:12px;color:var(--dsw-alias-label-secondary,#8f96a3);padding:0 14px;white-space:nowrap}";

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

    function Item(item) {
      var c = (item && typeof item.changePct === "number")
        ? (item.changePct > 0 ? UP : item.changePct < 0 ? DOWN : NEUTRAL)
        : NEUTRAL;
      return React.createElement("div", { className: "shq-item", key: item.code },
        React.createElement("span", { className: "shq-name" }, item.name),
        React.createElement("span", { className: "shq-price", style: { color: c } }, fmt(item.price)),
        React.createElement("span", { className: "shq-pct", style: { color: c } }, sign(item.changePct) + fmt(item.changePct) + "%")
      );
    }

    function TickerBar() {
      var itemsState = React.useState(null);
      var items = itemsState[0], setItems = itemsState[1];
      var errState = React.useState(null);
      var err = errState[0], setErr = errState[1];
      var collapsedState = React.useState(false);
      var collapsed = collapsedState[0], setCollapsed = collapsedState[1];

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

      if (collapsed) {
        return React.createElement("button", {
          className: "shq-pill",
          title: "展开行情",
          onClick: function () { setCollapsed(false); },
        },
          React.createElement("span", null, "+"),
          React.createElement("span", null, "行情")
        );
      }

      var body = (items && items.length)
        ? React.createElement("div", { className: "shq-bar-list" }, items.map(Item))
        : React.createElement("div", { className: "shq-err" }, err || "加载中…");

      return React.createElement("div", { className: "shq-bar" },
        React.createElement("div", { className: "shq-bar-label" }, "行情"),
        body,
        React.createElement("button", {
          className: "shq-toggle",
          title: "收起",
          onClick: function () { setCollapsed(true); },
        }, "—")
      );
    }

    function apply(ctx) {
      ctx.effect(function () {
        return injectStyle(CSS);
      }, "dsh-stock-ticker: styles");
      ctx.slots.inject("shell.overlay", function () {
        return ctx.slots.register(
          { name: "shell.overlay", id: "dsh-stock-ticker" },
          function () { return React.createElement(TickerBar); },
        );
      });
    }

    exports.name = "dsh-stock-ticker";
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
