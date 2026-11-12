# 揪一下（Squad Up / スコッドアップ）v1.6

線上即時聚會協調專案，提供繁體中文、英文與日文介面，協助主辦人發起揪團、蒐集可參加時段與候選地點。

> 文件更新：2026-11-12。最新單檔 HTML 原型為 v1.6，根目錄 `index.html` 與 `version/Codex_v1.6/index.html` 內容相同。`app/` 是獨立的 Next.js 全端實作，套件版本為 `0.1.0`。

## v1.6 更新重點

- 更新首頁介紹文案，強調揪團時間與地點協調，以及免費使用；同步繁中、英文與日文，Next.js 多語系文案亦已更新。
- 房間分享按鈕改為「分享連結」，採用三點連線 SVG 分享圖示，並更新英日文標籤。
- 移除底部「送出時執行原子交易驗證名額上限」說明及其翻譯。
- 瀏覽器分頁標題改為「揪一下 | 線上即時聚會協調」，切換英文／日文時動態同步更新 `document.title`。
- 邀請連結精簡為原生短網址格式（`https://yachiyao.github.io/SquadUp/#room=SQ-XXXX`），移除網址內冗長的 `&data=` Base64 參數，直接由雲端讀取房間資料，並保留舊版長連結向下相容。
- 將目前單檔完整備份至 `version/Codex_v1.6/index.html`。此備份不包含獨立的 `app/` 應用。
- 已檢查文字差異與翻譯 JSON 格式；尚未進行瀏覽器視覺驗證。

## v1.5 更新重點

- 整合 Firebase Auth Google 帳號選擇與 Firestore 房間同步。
- 新增會員個人資料選單：常用暱稱自動代入、主要生活圈設定與登出。個人設定目前依帳號存於本機 LocalStorage。
- 修正拍板定案後受邀者的資訊顯示，以深色置頂卡片呈現確定行程。
- 調整右上角圓形語言選單、會員圖示與響應式排版，加入頁尾版權宣告。
- 2026-11-11 更新網站 Logo、書籤圖示及 Next.js 版頁首與 Open Graph 圖片；該次提交為 `0da6fa2`。

## 專案結構

```text
Squad Up/
├── index.html                 # 單檔 HTML 原型 v1.6
├── firebase.json              # Firestore 規則檔設定
├── firestore.rules            # 本機 Firestore 安全規則
├── version/
│   ├── Gemini-4-Argon_v1.0/
│   ├── GPT-6_v1.1/
│   ├── Gemini_v1.2/
│   ├── GPT-6_v1.3/
│   ├── Gemini_v1.4/
│   ├── Codex_v1.6/
│   ├── Gemini_v1.5/
│   └── README.md              # HTML 迭代紀錄
├── app/                       # Next.js 14、Prisma、PostgreSQL 全端應用
├── docs/                      # 產品規格、企劃與競品研究
└── README.md
```

## 快速體驗 HTML 互動版

在專案根目錄執行 `npx serve .`，開啟終端機提供的本機網址；也可使用 VS Code Live Server。直接開啟 [index.html](index.html) 可查看介面；Google OAuth 與雲端同步需網路及正確的 Firebase 設定，測試登入時應確認使用的網域已加入 Firebase 授權網域。

目前原型包含：

- 建立揪團、1～20 人上限（含主辦人）、月曆熱度圖、Top 3 時段與地點投票。
- 房間內分享卡片、原生精簡短連結（`#room=SQ-XXXX`）與 `SQ-XXXX` 形式的房間代碼；短連結與代碼查詢透過雲端同步服務載入房間資料，並向下相容舊版含 `&data=` 的長連結。
- 訪客本機暫存、裝置 Token、分頁身分與舊版 URL Hash 房間快照相容解析。
- Firebase Authentication 與 Cloud Firestore（專案 `squad-up-42b1a`）整合，透過 `onSnapshot` 接收房間更新，並提供會員紀錄介面。
- 保留 v1.4 的 CloudSync：使用 `ntfy.sh`、SSE／輪詢與 LocalStorage 同步。目前 CloudSync 與 Firestore 路徑並存，並非單純以訪客／會員切分儲存服務。

以上為程式與版本紀錄確認的範圍，不代表已完成線上驗收。本機規則檔不代表已部署；跨裝置同步與登入需實際驗證。HTML 的前端名額檢查不等同後端原子交易保證，不能據此宣稱已通過多人競爭最後名額的驗收。

## 啟動全端應用程式

`app/` 使用 Next.js 14、React、TypeScript、Prisma／PostgreSQL、NextAuth 與 next-intl。程式包含活動建立、報名、踢除參加者、拍板定案與行事曆匯出；報名與管理操作使用資料庫交易及活動列鎖。

在 `app/` 下準備環境變數並安裝依賴（PowerShell）。若已有 `.env`，請沿用並核對設定，略過複製步驟：

```powershell
cd app
Copy-Item .env.example .env
npm install
npm run db:local
```

另開終端機，在 `app/` 執行 `npm run dev`，再開啟 `http://localhost:3000`。Google OAuth 等功能需在 `.env` 設定對應憑證，詳見 [app/.env.example](app/.env.example)。此實作的登入及資料庫設定與 HTML 的 Firebase 設定分開。

## 相關文件

- [產品規格文件 v1.5](docs/product/規格文件.md)
- [HTML 版本迭代紀錄](version/README.md)
- [早期專案企劃書](docs/planning/專案企劃書_早期版.md)
- [競品研究](docs/research/competitors/)
