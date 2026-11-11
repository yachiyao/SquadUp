# 揪一下（Squad Up / スコッドアップ）

線上即時聚會協調專案。可直接開啟根目錄的單檔 HTML 體驗互動原型；`app/` 則是 Next.js 全端應用程式。專案提供繁體中文、英文與日文介面，協助主辦人發起揪團、蒐集可參加時段與候選地點。

## 專案結構

```text
Squad Up/
├── index.html                 # 最新單檔 HTML（支援真實揪團連結、訪客 LocalStorage 與會員 Firebase 雲端同步）
├── version/
│   ├── Gemini_v1.2/
│   │   └── index.html         # v1.2 版本封存：整合 Firebase Auth/Firestore 雙軌儲存、真實分享連結與代碼進入
│   ├── GPT-6_v1.1/
│   │   └── index.html         # v1.1 原型的版本封存
│   └── Gemini-4-Argon_v1.0/
│       └── index.html         # 原始 v1.0 單檔原型
├── app/                       # Next.js 14、Prisma、PostgreSQL 全端應用程式
├── docs/                      # 產品規格、企劃與競品研究
└── README.md
```

根目錄的 `index.html` 與 `version/Gemini_v1.2/index.html` 內容相同；`version/GPT-6_v1.1/index.html` 與 `version/Gemini-4-Argon_v1.0/index.html` 保留先前版本。

## 快速體驗 HTML 互動版（已整合 Firebase）

直接在瀏覽器開啟 [`index.html`](index.html)（若要測試彈出式 Google OAuth 視窗，建議以 `npx serve .` 或 VS Code Live Server 於 `http://localhost` 開啟）。此版本支援：
- **訪客與 Google 會員雙軌架構**：
  - **免註冊訪客（Guest）**：依賴瀏覽器 `LocalStorage` 與裝置 Token 暫存，搭配 URL Hash 編碼即可快速發起與投票。
  - **Google 登入會員（Member）**：串接 Firebase Authentication 與 Cloud Firestore（專案 `squad-up-42b1a`），發起的揪團自動寫入雲端資料庫並支援 `onSnapshot` 多人即時熱度圖同步與「4. 會員紀錄」跨裝置查詢。
- **真實可分享的揪團連結與短代碼**：建立揪團後會生成唯一的房間代碼（如 `SQ-XXXX`），可透過短代碼（雲端房間）或完整連結在任何裝置加入房間。

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
