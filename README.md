# 科技教育創新專區・阿凱老師｜公共程式平臺上架內容報告

石門國小資訊組長阿凱老師向數位發展部報告「科技教育創新專區」開發緣起、校園使用情形，以及公共程式平臺上架與資安檢測歷程的 Reveal.js 互動簡報。

🔗 線上觀看：[https://cagoooo.github.io/moda-akai-briefing/](https://cagoooo.github.io/moda-akai-briefing/)

## 📋 簡報內容

全份簡報共 18 頁（開場片頭＋17 頁內容），規劃 20 分鐘，每頁都附講者備註與時間配置。

| 章節 | 頁面 | 重點 |
|---|---|---|
| 開場 | 開場片頭、封面 | 21 秒片頭；封面列出 10/28 複掃結果：Fortify、Mend 中風險以上皆 0，MIT 授權 |
| 議程 | 今天的 20 分鐘 | 七個段落與時間分配 |
| 01 為什麼要做 | 一個人的資訊組，全校的需求 | 老師的日常需求與市售工具的門檻（註冊、廣告、個資） |
| 02 怎麼做到 | 老師提需求，AI 協作寫程式 | 提需求 → AI 協作開發 → 自動測試 → 自動上線 → 收回饋；134 款工具、1,261 次程式提交 |
| | 從 6 款到 134 款 | 七大類工具數量與入口網 |
| 03 現場示範 | 現場示範 | 入口網首頁、工具索引神器、班級小管家、場地與平板車預約；附示範錄影備援 |
| 04 校園使用情形 | 老師真的在用 | 入口網累計造訪 7,861 次、點開工具 11,917 次，2026 年每月造訪長條圖 |
| | 點開次數最多的三款 | #10 班級小管家、#81 資訊科技教學駕駛艙、#46 場地與平板車預約 |
| 05 上架之路與資安檢測 | 三週走完上架流程 | 10/06 收到說明到 10/28 複掃合格送審的時間軸 |
| | 每一次掃描的結果 | Fortify 初掃 237 筆（中風險以上 40）到第 5 次複掃中風險以上 0；Mend 套件弱點 15 筆剩 1 筆低風險 |
| | 修了什麼 | HTTPS、路徑檢查、安全亂數、套件升級、移除未標授權元件、誤判為密碼的說明文字 |
| 06 維運與被找到 | 出狀況時，系統會自己通報 | Sentry（瀏覽器端）＋雲端錯誤日誌 → 雲端函式分級限流 → Google Chat 通知 → 自動開 Issue |
| | 讓搜尋引擎與 AI 都找得到 | 問題 → 文章 → 工具頁 → 工具的三層導流；SEO（sitemap、結構化資料）與 GEO（llms.txt、robots.txt） |
| 07 開源與建議 | 一個儲存庫，其他學校也能用 | Akai 主儲存庫結構（MIT）、92 個工具公開 repo、Fork 再利用三步驟 |
| | 一鍵複製，貼給 AI 就能改成自己的版本 | 文章左下角「複製 AI 開發提示詞」的使用流程 |
| | 感謝與建議 | 給平臺的四點建議：協助檢測、學校版上架指引、常見誤判說明、教育類交流與再利用 |
| 結尾 | 一位老師開始，讓更多學校受惠 | 入口網、原始碼、本簡報三個 QR Code |

> 簡報內數字以各頁標示的擷取時間為準（例如工具數與提交次數截至 11/3、造訪統計為 2026.10.30 擷取）。

## ✨ 功能特色

- **開場片頭**：打開簡報就播放 21 秒片頭，播完自動進入封面；瀏覽器擋下有聲自動播放時會顯示播放鈕，點影片可暫停／繼續。
- **進場動畫**：用 GSAP 讓標題逐字浮現、區塊依序進場、數字跳動、長條與時間軸逐步長出；系統開啟「減少動態效果」時直接顯示完成畫面。
- **深淺底色切換**：右上角「☀️ 白底／🌙 深底」按鈕，投影太亮看不清時可切換，選擇會記在瀏覽器裡。
- **手機版上下滑動**：螢幕寬度 435px 以下時 Reveal.js 會改成上下捲動檢視，並顯示「往上滑，看下一頁」箭頭提示，第一次滑動後自動隱藏。
- **示範備援影片**：現場示範頁有「網路不穩時：播放示範錄影」按鈕，按 Esc 或「關閉」結束。
- **QR Code**：結尾頁的三個 QR Code 由 qrcode-generator 在頁面上即時產生。
- **離線可開與新版本提示**：Service Worker 預先存好頁面、樣式、程式與截圖，現場網路不穩也能載入；部署新版後，已開著簡報的人會看到「簡報有新版本」提示列，按「重新整理載入」才換版，簡報進行中不會被突然換頁。
- **列印成 PDF**：支援 Reveal.js 的 `?print-pdf` 模式，此時動畫與更新提示會關閉、分段內容全部顯示。
- **PWA 與分享預覽**：附 manifest、全套圖示（favicon、apple-touch-icon、192／512 含可遮罩版）與社群分享圖 `og-image.jpg`。

## 🎮 操作方式

| 操作 | 方式 |
|---|---|
| 翻頁 | 鍵盤方向鍵、空白鍵，或畫面右下角的箭頭 |
| 跳過片頭 | 在片頭頁按 → 直接進入封面 |
| 講者備註 | 按 `S` 開啟 Reveal.js 演講者檢視，可看講稿與時間配置 |
| 關閉示範錄影 | 按 `Esc` |
| 手機 | 上下滑動翻頁 |
| 指定頁面 | 網址帶頁碼（例如 `#/3`），可直接分享某一頁 |

## 🛠️ 技術與專案結構

純靜態網站，不需要打包工具。函式庫從 CDN 載入：Reveal.js 5.1.0（含 Notes 外掛）、GSAP 3.13.0（含 SplitText）、qrcode-generator 1.4.4，字型為 Google Fonts 的 Noto Sans TC 與 JetBrains Mono。

```
moda-akai-briefing/
├─ index.html              # 簡報本體（18 頁與講者備註）
├─ css/deck.css            # 版面、深淺主題、手機版樣式
├─ js/
│  ├─ deck.js              # 深淺主題、QR Code、手機滑動提示、示範備援影片
│  ├─ motion.js            # GSAP 進場動畫
│  ├─ opening.js           # 開場片頭自動播放
│  └─ sw-register.js       # Service Worker 註冊與新版本提示列
├─ sw.js                   # Service Worker（預存與離線快取）
├─ manifest.webmanifest    # PWA 設定
├─ images/                 # 入口網、工具頁、文章等截圖
├─ media/                  # 開場片頭、示範備援影片
├─ favicon.* / icon-*.png / apple-touch-icon.png / og-image.jpg
└─ .github/
   ├─ workflows/deploy.yml # 部署到 GitHub Pages
   └─ stamp_version.py     # 部署時寫入版本號
```

## 💻 本機預覽

用任一靜態伺服器開啟專案資料夾即可，例如：

```bash
python -m http.server 8000
```

再開 `http://localhost:8000/`。本機版本沒有部署時寫入的版本號，因此不會註冊 Service Worker，還會清掉殘留的 Service Worker，避免快取干擾修改。

## 🚀 部署方式

推送到 `main`（或在 Actions 手動執行）會觸發 `.github/workflows/deploy.yml`：

1. 把 `index.html`、`css/`、`js/`、`images/`、`media/`、Service Worker、manifest 與圖示複製到 `_site/`，並建立 `version.json`。
2. 執行 `.github/stamp_version.py`，把檔案中的 `__BUILD_VERSION__` 換成「提交時間＋提交雜湊」（例如 `2026.11.01-0838-c008940`）；同一個提交重跑部署版本不變，不會一再跳出更新提示。
3. 以 GitHub Pages 官方動作（`configure-pages`、`upload-pages-artifact`、`deploy-pages`）發布。

新增檔案或資料夾時，記得一併加進工作流程的複製步驟，否則不會出現在正式網站。

## 👨‍🏫 作者與學校

- 教學設計與製作：[阿凱老師](https://www.smes.tyc.edu.tw/modules/school/index.php?department_id=2&zone_id=0&page_id=2&content_id=11&type=news&from_op=all_news#a5)
- 學校：桃園市龍潭區石門國民小學

Made with ❤️ by [阿凱老師](https://www.smes.tyc.edu.tw/modules/school/index.php?department_id=2&zone_id=0&page_id=2&content_id=11&type=news&from_op=all_news#a5)

## 🔗 阿凱老師教育工具集

這個專案是[阿凱老師教育工具集](https://cagoooo.github.io/Akai/)的 **#135 公共程式平臺上架報告**，由桃園市龍潭區石門國民小學阿凱老師開發。

- 工具介紹頁：[https://cagoooo.github.io/Akai/tool/135/](https://cagoooo.github.io/Akai/tool/135/)
- 線上使用：[https://cagoooo.github.io/moda-akai-briefing/](https://cagoooo.github.io/moda-akai-briefing/)
- 教學情境文章：[https://cagoooo.github.io/Akai/blog/moda-briefing-135-public-code-report/](https://cagoooo.github.io/Akai/blog/moda-briefing-135-public-code-report/)
- 全部工具（上百個教育工具與原始碼）：[https://cagoooo.github.io/Akai/](https://cagoooo.github.io/Akai/)

想改造成自己的版本？到上面的教學情境文章，按左下角「複製 AI 開發提示詞」，貼給 ChatGPT、Claude、Gemini 等 AI 助手，就能參考這份原始碼開始規劃。
