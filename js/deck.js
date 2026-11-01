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

/* 新版偵測與提示改由 js/sw-register.js 負責（Service Worker 版本通知）。 */

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
