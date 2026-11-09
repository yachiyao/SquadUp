# 揪一下（Squad Up / スコッドアップ）

輕量、直覺且專為行動端瀏覽器最佳化的線上即時揪團與時間／地點協調 Web 應用程式，支援透過 LINE、Discord 一鍵擴散分享。

---

## ✨ 核心功能（MVP v1.3）

- **溫暖友善的行動優先設計（Warm & Friendly Casual）**：
  - 採用柔和暖白底色（`#FAF9F5`）、鼠尾草綠熱度漸層（`#2E7D5B` / `#38A169`）與暖蜜桃橘標籤，確保 44×44px 以上觸控目標。
- **多語系支援（i18n）**：
  - 支援繁體中文（`zh-TW`，預設）、英文（`en`）、日文（`ja`）切換。
- **雙重身分機制（免註冊訪客 & Google 會員）**：
  - **訪客（Guest）**：免登入即可發起或加入揪團，透過瀏覽器 `localStorage` 匿名 UUID Token 識別同裝置編輯，連結效期可選 3 / 5 / 7 天。
  - **一般會員（Free Member）**：支援 Google OAuth 2.0 登入，享有跨裝置「我主辦的 / 我參加的」儀表板、最長 30 天連結效期、常用生活圈快捷帶入、剔除惡意參加者與拍板定案功能。
- **2 個月月曆熱度圖與底部時段抽屜（Bottom Sheet）**：
  - 依各日期重疊人數動態呈現 5 階綠色漸層；點選日期滑出底部抽屜勾選 `[全天]`、`[上午]`、`[下午]`、`[晚上]` 或每小時區間。
- **最佳時段排行榜 Top 3 & 地點投票**：
  - 滿 2 人以上投票自動歸納重疊人數最高的前 3 名時段；支援 0～3 個候選地點（0 個待定、1 個直接顯示 Google Maps 連結、2～3 個開啟即時單選投票）。
- **原子交易與參加人數上限控管（v1.3 規格）**：
  - 建立活動可設定 `1～20` 人上限（預設 20 人），主辦人建立後自動占第 1 個名額。
  - 後端透過資料庫 Row Lock（`SELECT ... FOR UPDATE`）原子交易確保多人同時搶最後名額時不超額；額滿時回傳 HTTP 409 `Event is already full (N/N)`，已加入者仍可原位編輯自己的回覆而不重複占位。
- **主辦人控管與行事曆匯出**：
  - 支援剔除參加者（立即釋出 1 個名額並同步扣除票數重算 Top 3）與「拍板定案」（鎖定投票、一鍵加入 Google 日曆或下載 RFC 5545 `.ics` 檔案）。

---

## 📂 專案目錄結構

```text
Squad Up/
├── Gemini-4-Argon_v1.0/
│   └── index.html          # 單檔免伺服器互動式 HTML 雛形（可直接雙擊開啟體驗完整流程）
├── app/                    # Next.js 14 (App Router) + Prisma + PostgreSQL 全端應用程式
│   ├── app/                # 多語系頁面路由 (/create, /g/[id], /dashboard) 與 API Routes
│   ├── components/         # 月曆熱度圖、底部抽屜、Top 3 排行榜、地點投票、主辦人管理元件
│   ├── lib/                # 原子交易 (concurrency.ts)、計分演算法、.ics 匯出、驗證與權限
│   ├── messages/           # zh-TW / en / ja 多語系字典檔
│   ├── prisma/             # PostgreSQL Prisma Schema
│   └── tests/              # 核心驗證、熱度計分、行事曆匯出單元測試
├── docs/                   # 產品規格文件與競品研究
│   ├── product/規格文件.md  # 揪一下規格文件 v1.3
│   ├── planning/           # 早期專案企劃書
│   └── research/           # 競品查核稿（Doodle, Howbout, Rallly, When2Meet 等）
└── README.md
```

---

## 🚀 快速開始

### 方式一：直接開啟互動式 HTML 雛形（免安裝）

直接用瀏覽器開啟 [`Gemini-4-Argon_v1.0/index.html`](Gemini-4-Argon_v1.0/index.html)，即可體驗：
- 中／英／日語系切換与訪客／Google 會員角色切換
- 發起揪團、分享連結預覽、2 個月熱度圖、底部時段抽屜、Top 3 排行榜與地點投票
- 內建「🧪 互動驗收模擬器」工具列，可一鍵模擬路人報名占額、額滿阻擋（HTTP 409）、主辦人踢人釋放名額與拍板定案匯出 `.ics`。

### 方式二：啟動 Next.js 全端應用程式

```bash
cd app
cp .env.example .env
npm install

# 啟動本機內嵌 PostgreSQL 並自動同步 Prisma Schema（或設定自己的 DATABASE_URL）
npm run db:local

# 另開終端機啟動開發伺服器
npm run dev
```

開啟 `http://localhost:3000` 即可使用。

---

## 📄 相關文件

- [產品規格文件 v1.3](docs/product/規格文件.md)
- [早期專案企劃書](docs/planning/專案企劃書_早期版.md)
- [競爭者查核稿](docs/research/competitors/)
