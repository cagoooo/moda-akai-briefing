/* Service Worker 註冊與「有新版本」提示
 *  - 新版部署後，已開著簡報的人會看到提示列，按「重新整理載入」才換版（簡報進行中不會被突然換頁）。
 *  - 兩個偵測來源：① 新 Service Worker 進入 waiting；② 讀 version.json 發現比目前頁面新。
 *    兩者共用同一個提示、同一個按鈕；按下當下才查 waiting，沒有就改用帶版本號的網址重新載入。
 *  - 版本閘門：只有「比目前頁面版本新」才提示（CDN 邊緣節點殘留舊檔時不會誤報）；同一版本只提示一次，按過更新的版本不再提示。
 *  - 網址加 ?swdemo=1 可直接預覽提示列的樣式。 */
(function () {
  var params = new URLSearchParams(location.search);
  if (params.has('print-pdf')) return;

  var meta = document.querySelector('meta[name="build-version"]');
  var APP_VERSION = meta ? meta.content : '';
  var DEV = !APP_VERSION || APP_VERSION.indexOf('__') === 0; // 本機開發沒有版本號
  var DEMO = params.has('swdemo');
  var ACK_KEY = 'moda2026akai_update_ack';
  var SW_REG = null;
  var UPDATING = false;
  var announced = '';
  var latest = '';
  var HAD_CONTROLLER = !!(navigator.serviceWorker && navigator.serviceWorker.controller); // 第一次安裝接管頁面不算新版

  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* 忽略 */ } }

  // 版本格式：2026.11.01-0838-c008940（日期時間可排序＋提交雜湊）。比較時間部分，較舊＝CDN 殘留，忽略。
  function stamp(v) { return String(v).replace(/-[0-9a-f]{7,}$/i, ''); }
  function isNewer(candidate, base) {
    if (!candidate || !base || candidate === base) return false;
    var a = stamp(candidate), b = stamp(base);
    return a !== b ? a > b : true;
  }

  function hardReload() {
    var u = new URL(location.href);
    u.searchParams.set('v', latest || String(Date.now()));
    location.replace(u.toString());
  }

  function applyUpdate() {
    if (UPDATING) return;
    UPDATING = true;
    ssSet(ACK_KEY, latest);
    var bar = document.getElementById('sw-update-bar');
    if (bar) bar.remove();
    document.documentElement.classList.remove('has-update-bar');
    if (SW_REG && SW_REG.waiting) {
      SW_REG.waiting.postMessage({ type: 'SKIP_WAITING' }); // → activate → controllerchange → 重新載入
      setTimeout(hardReload, 8000); // 保底：手機接管較慢時多等一下，仍沒換手才改用帶版本號的網址載入
    } else {
      hardReload();
    }
  }

  function showBar(version) {
    if (!DEMO && (DEV || !version || announced === version || ssGet(ACK_KEY) === version)) return;
    if (document.getElementById('sw-update-bar')) return;
    announced = version || announced;
    latest = version || latest;
    var bar = document.createElement('div');
    bar.id = 'sw-update-bar';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML =
      '<span class="sw-msg"><b>簡報有新版本</b><small>重新整理載入，就能看到最新內容</small></span>' +
      '<button type="button" id="sw-x" aria-label="關閉提示">✕</button>' +
      '<button type="button" id="sw-go">重新整理載入</button>';
    document.body.appendChild(bar);
    document.documentElement.classList.add('has-update-bar');
    document.getElementById('sw-x').onclick = function () {
      bar.remove();
      document.documentElement.classList.remove('has-update-bar');
    };
    document.getElementById('sw-go').onclick = applyUpdate; // 統一走 applyUpdate：點擊當下才查 waiting
  }

  if (DEMO) { showBar('demo'); }

  // 讀取任一 Service Worker 的版本；1.5 秒沒回應就當作未知（寧可多提示，不擋真更新）
  function workerVersion(worker) {
    return new Promise(function (resolve) {
      try {
        var ch = new MessageChannel();
        var timer = setTimeout(function () { resolve(null); }, 1500);
        ch.port1.onmessage = function (e) { clearTimeout(timer); resolve(e.data && e.data.version ? e.data.version : null); };
        worker.postMessage({ type: 'GET_VERSION' }, [ch.port2]);
      } catch (e) { resolve(null); }
    });
  }

  function onWaiting(worker) {
    workerVersion(worker).then(function (v) {
      if (v && !DEV && !isNewer(v, APP_VERSION)) return; // 同版重建或較舊：不是新版
      showBar(v || latest || 'waiting');
    });
  }

  if (DEV) {
    // 本機開發：清掉殘留的 Service Worker，避免快取干擾
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); });
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
      SW_REG = reg;
      if (reg.waiting && navigator.serviceWorker.controller) onWaiting(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function () {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) onWaiting(nw);
        });
      });
      setInterval(function () { reg.update().catch(function () {}); }, 60000);
    }).catch(function () { /* 不支援或被封鎖時，仍靠 version.json 提示 */ });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!HAD_CONTROLLER) { HAD_CONTROLLER = true; return; } // 第一次安裝＋clients.claim() 也會觸發，不能重新整理
      if (ssGet('moda2026akai_sw_reloaded')) return;
      ssSet('moda2026akai_sw_reloaded', '1');
      setTimeout(function () { try { sessionStorage.removeItem('moda2026akai_sw_reloaded'); } catch (e) { /* 忽略 */ } }, 4000);
      location.reload();
    });
  }

  // 備胎：讀 version.json。發現較新版本時，先叫 Service Worker 去抓更新，再顯示同一個提示列
  function checkVersion() {
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !isNewer(d.version, APP_VERSION)) return;
        latest = d.version;
        if (SW_REG) SW_REG.update().catch(function () {});
        showBar(d.version);
      })
      .catch(function () { /* 離線時維持現狀 */ });
  }
  ['focus', 'online', 'pageshow'].forEach(function (ev) { window.addEventListener(ev, checkVersion); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') checkVersion(); });
  setTimeout(checkVersion, 6000);
  setInterval(checkVersion, 180000);
})();
