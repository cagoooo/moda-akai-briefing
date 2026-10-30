// 簡報介面：深淺主題切換、QR Code、示範備援影片
const THEME_KEY = 'moda2026akai_theme';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* 忽略 */ } },
};

/* ---------- 主題（預設深藍藍圖；投影太亮看不清時可切白底） ---------- */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
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
