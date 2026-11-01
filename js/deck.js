// 簡報介面：深淺主題切換、QR Code、示範備援影片
const THEME_KEY = 'moda2026akai_theme';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* 忽略 */ } },
};

/* ---------- 主題（預設深藍藍圖；投影太亮看不清時可切白底） ---------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0a1d33' : '#f6f9fd');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = t === 'dark' ? '☀️ 白底' : '🌙 深底';
}
document.getElementById('theme-btn')?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  store.set(THEME_KEY, next);
  applyTheme(next);
});
applyTheme(store.get(THEME_KEY) === 'light' ? 'light' : 'dark');

/* ---------- QR Code ---------- */
document.querySelectorAll('.qr[data-url]').forEach((box) => {
  const qr = qrcode(0, 'M');
  qr.addData(box.dataset.url);
  qr.make();
  box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });
});

/* ---------- 手機上下滑動提示 ----------
 * Reveal 在寬度 435px 以下會自動改成上下捲動；手機使用者容易照習慣左右滑，所以先放一個往下的箭頭提示。
 * 只認「手指真的滑了」（touchmove／滾輪／按鍵），片頭播完自動換頁的程式捲動不算，滑過一次就不再出現。 */
(function swipeHint() {
  const HINT_KEY = 'moda2026akai_swipehint_done';
  const root = document.documentElement;
  const sess = {
    get() { try { return sessionStorage.getItem(HINT_KEY); } catch { return null; } },
    set() { try { sessionStorage.setItem(HINT_KEY, '1'); } catch { /* 忽略 */ } },
  };
  let done = sess.get() === '1';
  const sync = () => root.classList.toggle('swipe-hint-on', !done && window.innerWidth <= 435);
  const finish = () => {
    if (done) return;
    done = true;
    sess.set();
    sync();
  };
  ['touchmove', 'wheel', 'keydown'].forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
  window.addEventListener('resize', sync);
  sync();
})();

/* ---------- 新版偵測 ----------
 * GitHub Pages 會讓瀏覽器把 index.html 留存約 10 分鐘，剛部署完用手機開，可能還拿到舊版頁面（沒有 Service Worker 可以更新）。
 * 載入時用不留快取的方式讀 version.json，和目前頁面引用的版本號比對，不同就換成帶版本號的網址重新載入（每個版本只會重載一次，避免無限重載）。 */
(function versionCheck() {
  const RELOAD_KEY = 'moda2026akai_reloaded_to';
  const current = (document.querySelector('link[href*="deck.css"]')?.getAttribute('href') || '').match(/[?&]v=([^&]+)/)?.[1];
  if (!current || current.startsWith('__')) return; // 本機開發沒有版本號，略過
  const check = async () => {
    try {
      const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const { version } = await res.json();
      if (!version || version === current) return;
      let tried = null;
      try { tried = sessionStorage.getItem(RELOAD_KEY); } catch { /* 忽略 */ }
      if (tried === version) return;
      try { sessionStorage.setItem(RELOAD_KEY, version); } catch { /* 忽略 */ }
      const url = new URL(location.href);
      url.searchParams.set('v', version);
      location.replace(url.toString());
    } catch { /* 離線或讀取失敗時維持現狀 */ }
  };
  check();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
})();

/* ---------- 示範備援影片：現場網路不穩時改播錄好的示範 ---------- */
const backup = document.getElementById('backup');
const backupVideo = backup?.querySelector('video');
function closeBackup() { backup.classList.remove('on'); backupVideo.pause(); }
document.querySelectorAll('[data-backup]').forEach((btn) => btn.addEventListener('click', () => {
  backup.classList.add('on');
  backupVideo.currentTime = 0;
  backupVideo.play().catch(() => {});
}));
backup?.querySelector('button').addEventListener('click', closeBackup);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && backup?.classList.contains('on')) { e.stopPropagation(); closeBackup(); }
}, true);
