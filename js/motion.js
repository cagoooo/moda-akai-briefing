/* 動畫層（GSAP）：每頁進場時
 * 章節標籤 → 標題逐字浮現 → 區塊依序進場 → 數字跳動、長條長出、時間軸畫線
 * 系統開啟「減少動態效果」或列印 PDF 時，直接顯示完成狀態 */
(function () {
  if (/print-pdf/.test(location.search)) return;
  gsap.registerPlugin(SplitText);

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const T = (s) => (reduceMQ.matches ? 0 : s);
  const EASE = 'power3.out';
  const splits = new WeakMap();
  const timelines = new WeakMap();

  const FROM = {
    up:    { autoAlpha: 0, y: 26 },
    left:  { autoAlpha: 0, x: -48 },
    right: { autoAlpha: 0, x: 48 },
    pop:   { autoAlpha: 0, scale: 0.8 },
    fade:  { autoAlpha: 0 },
  };
  const TO = { autoAlpha: 1, x: 0, y: 0, scale: 1 };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  function charsOf(title) {
    if (!splits.has(title)) splits.set(title, SplitText.create(title, { type: 'chars', charsClass: 'ch' }));
    return splits.get(title).chars;
  }

  function partsOf(slide) {
    const kickers = [...slide.querySelectorAll('.kicker')];
    const titles = [...slide.querySelectorAll('h1, h2')].filter((t) => !t.closest('.fragment:not(.visible)'));
    const items = [...slide.querySelectorAll('[data-a], .stg > *, .fragment.visible')]
      .filter((el) => !el.matches('h1, h2, .kicker'));
    return { kickers, titles, items };
  }

  // 數字跳動、長條、直條、時間軸：跟著進場時間軸一起播
  function addData(slide, tl) {
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const o = { v: Number(el.dataset.from || 0) };
      el.textContent = fmt(o.v);
      tl.to(o, { v: end, duration: T(1.6), ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } }, T(0.5));
    });
    const fills = slide.querySelectorAll('.bars .fill');
    if (fills.length) tl.fromTo(fills, { scaleX: 0 }, { scaleX: 1, duration: T(0.9), stagger: T(0.08), ease: 'power2.out' }, T(0.5));
    const cols = slide.querySelectorAll('.cols .c i');
    if (cols.length) tl.fromTo(cols, { scaleY: 0 }, { scaleY: 1, duration: T(0.7), stagger: T(0.06), ease: 'power2.out' }, T(0.5));
    const line = slide.querySelector('.tl .line-fill');
    if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: T(2.4), ease: 'power1.inOut' }, T(0.4));
  }

  function enter(slide) {
    if (!slide) return;
    timelines.get(slide)?.kill();
    const { kickers, titles, items } = partsOf(slide);

    slide.querySelectorAll('.fragment:not(.visible)').forEach((f) => gsap.set(f, { autoAlpha: 0 }));
    gsap.set(kickers, FROM.up);
    items.forEach((el) => gsap.set(el, FROM[el.dataset.a] || FROM.up));
    titles.forEach((t) => { gsap.set(t, { autoAlpha: 1, y: 0 }); gsap.set(charsOf(t), { autoAlpha: 0, yPercent: 65 }); });

    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.to(kickers, { ...TO, duration: T(0.45) }, T(0.12));
    titles.forEach((t, i) => {
      tl.to(charsOf(t), { autoAlpha: 1, yPercent: 0, duration: T(0.5), stagger: T(0.022) }, i ? '<0.12' : T(0.2));
    });
    items.forEach((el, i) => {
      const ease = el.dataset.a === 'pop' ? 'back.out(1.6)' : EASE;
      tl.to(el, { ...TO, duration: T(0.55), ease }, i ? `<${T(0.09)}` : `-=${T(0.25)}`);
    });
    addData(slide, tl);
    timelines.set(slide, tl);

    // 保險：畫面暫停更新（背景分頁、省電）時直接顯示完成狀態，避免整頁空白
    const frameAtStart = gsap.ticker.frame;
    setTimeout(() => {
      if (timelines.get(slide) === tl && gsap.ticker.frame === frameAtStart) tl.progress(1);
    }, 1500);
  }

  function leave(slide) {
    if (!slide) return;
    timelines.get(slide)?.kill();
    const { kickers, titles, items } = partsOf(slide);
    gsap.to([...kickers, ...items], {
      autoAlpha: 0, y: -12, duration: T(0.28), stagger: T(0.015), ease: 'power2.in', overwrite: true,
    });
    gsap.to(titles, { autoAlpha: 0, duration: T(0.25), overwrite: true });
  }

  function start() {
    enter(Reveal.getCurrentSlide());
    Reveal.on('slidechanged', (e) => { leave(e.previousSlide); enter(e.currentSlide); });
    Reveal.on('fragmentshown', (e) => e.fragments.forEach((f) =>
      gsap.fromTo(f, FROM[f.dataset.a] || FROM.up, { ...TO, duration: T(0.5), ease: EASE, overwrite: true })));
    Reveal.on('fragmenthidden', (e) => e.fragments.forEach((f) =>
      gsap.to(f, { autoAlpha: 0, y: 10, duration: T(0.25), overwrite: true })));
  }

  const go = () => document.fonts.ready.then(start);
  Reveal.isReady() ? go() : Reveal.on('ready', go);
})();
