# 揪一下（Squad Up / スコッドアップ）

線上即時聚會協調專案。可直接開啟根目錄的單檔 HTML 體驗互動原型；`app/` 則是 Next.js 全端應用程式。專案提供繁體中文、英文與日文介面，協助主辦人發起揪團、蒐集可參加時段與候選地點。

## 專案結構

```text
Squad Up/
├── index.html                 # 最新單檔 HTML 原型，可直接用瀏覽器開啟
├── version/
│   ├── GPT-6_v1.1/
│   │   └── index.html         # 最新原型的版本封存
│   └── Gemini-4-Argon_v1.0/
│       └── index.html         # 原始 v1.0 單檔原型
├── app/                       # Next.js 14、Prisma、PostgreSQL 全端應用程式
├── docs/                      # 產品規格、企劃與競品研究
└── README.md
```

根目錄的 `index.html` 與 `version/GPT-6_v1.1/index.html` 內容相同；`version/Gemini-4-Argon_v1.0/index.html` 保留原始 v1.0。

## 快速體驗 HTML 原型

直接在瀏覽器開啟 [`index.html`](index.html)。此版本採咖啡色主題，支援中／英／日切換、建立揪團、日期熱度圖、地點投票與分享預覽。發起揪團表單的活動主題、主辦人暱稱及首個候選地點初始留白；常用生活圈快捷區塊僅在切換為會員狀態後顯示。

**注意：**單檔 HTML 是互動原型。右上角的 Google 登入按鈕僅模擬會員狀態，房間資料也是示範資料；它不會執行真正的 Google OAuth 或連接後端資料庫。原型使用 Tailwind CDN，首次開啟需要網路載入樣式。

## 啟動全端應用程式

在 `app/` 下準備環境變數並安裝依賴：

```bash
cd app
cp .env.example .env
npm install
npm run db:local
```

另開終端機，在 `app/` 執行 `npm run dev`，再開啟 `http://localhost:3000`。Google OAuth 等功能需在 `.env` 設定對應憑證；詳見 [`app/.env.example`](app/.env.example)。

## 相關文件

- [產品規格文件](docs/product/規格文件.md)
- [早期專案企劃書](docs/planning/專案企劃書_早期版.md)
- [競品研究](docs/research/competitors/)
