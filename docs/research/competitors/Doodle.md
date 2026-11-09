# 揪一下競爭者研究：Doodle

- 查核日期：2026-11-06（Asia/Taipei）。
- 背景文件：`original/揪一下_競爭者分析_Doodle.md`；原文僅作待核對背景，未覆寫。
- 方法：實際搜尋及閱讀官方網站、價格頁、Help Center 與 App 商店開發者頁。本研究是文件查核，**沒有註冊帳號、建立或參加實際投票、購買方案、安裝 App 或執行實機測試**。
- 標記：**事實**＝官方資料明載；**推論**＝根據資料作出的策略判斷；**未知／衝突**＝資料不足或來源不一致。官方文件描述不等於已驗證實際介面。
- 「揪一下」全部功能均依背景文件所述的規劃比較，不代表已實作；本次資料夾未見可供驗證的產品程式或獨立需求規格。

## 1. 結論與產品定位

**事實：**Doodle 現行產品涵蓋 Group Poll、Booking Page、Sign-up Sheet 與 1:1，分別處理多人選時間、他人預約個人、場次報名及一對一排程。官網另宣傳 Doodle Time OS，但標示 Coming soon，不能將其新功能當成已可用功能。[官方首頁](https://doodle.com/en/)

**推論：**Doodle 是「揪一下」在多人時間協調上的直接競爭者。依其個人專業服務、團隊及企業方案設計，商務排程是重要定位；這不代表它不適合朋友聚會，也沒有證據證明其實際使用者以商務客群占多數。[方案定位](https://doodle.com/en/premium)

「揪一下」較可成立的差異化假設為：**繁體中文介面、僅暱稱參與，以及時間與多個候選地點共同決策**。單純免註冊參加、分享連結、修改回覆或定案通知，Doodle 都已有對應能力，不能當成獨有優勢。是否更容易使用、是否提高完成率，仍需使用者研究。

## 2. 建立、參加、修改與定案流程

### 主辦人

1. 建立免費或付費帳號；官方明載完成活動建立需要帳號與 Email 驗證。[建立帳號門檻](https://help.doodle.com/en/articles/12086821-how-can-i-create-a-group-poll-without-an-account)
2. 從 dashboard 建立 Group Poll，填寫標題、說明、地點及候選日期／時段；設定時區。地點是活動資訊欄位，不能直接等同地點投票。
3. 複製邀請連結，在通訊軟體或 Email 分享；Doodle 內建寄送邀請功能需要 Professional。進階設定包含截止時間、自動提醒、隱藏參加者與各時段名額限制。[建立與分享說明](https://help.doodle.com/en/articles/9457353-how-do-i-create-a-group-poll)
4. 收集回覆後選一個最終時段，點選 Book it。是主辦人決策，不是票數最高後自動定案；一次只能定案一個時段。[定案說明](https://help.doodle.com/en/articles/9457342-how-do-i-select-the-final-option-for-my-group-poll)

### 參加者

1. 開啟連結，不需要 Doodle 帳號。
2. 對各時段選 YES／IF-NEED-BE／NO，或整體拒絕。
3. 繼續後填寫**姓名與 Email**，提交才完成回覆；已登入者可帶入帳號資料。這不是僅輸入暱稱的流程。
4. 可選擇接收其他人投票的更新；最終時間確定後會收到通知。[參加流程](https://help.doodle.com/en/articles/9457279-how-do-i-participate-in-a-group-poll)

### 修改、重新開放與關閉

- 訪客可從投票確認信的 Review response 進入修改；也可在原投票裝置開啟連結。登入投票者可從 dashboard 修改。只有投票開放期間可改，過去時段不能更改；參加者不能自行完全刪除參與紀錄，但可改為拒絕。[修改回覆](https://help.doodle.com/en/articles/9457214-how-do-i-change-my-votes-in-a-group-poll)
- 主辦人可編輯活動、重新開放已定案投票及再定案；相關操作會寄送更新，連結不因編輯改變。新的／改動的時間選項可能讓原回覆出現問號，表示尚未取得該選項的意願，不應把它視為同意或反對。[活動編輯](https://help.doodle.com/en/articles/9457348-how-do-i-edit-my-group-poll)、[問號說明](https://help.doodle.com/en/articles/9457341-i-edited-my-group-poll-and-it-now-shows-question-marks-all-over-the-table)

## 3. 功能核對表與揪一下比較

| 項目 | Doodle 查核結果與限制 | 揪一下（原文件規劃）／比較判讀 |
|---|---|---|
| 建立活動 | **事實**：需要帳號；見上述帳號門檻文件 | 支援建立；主辦人是否必須登入未明確，不能宣稱全面免註冊 |
| 訪客參加 | **事實**：免帳號，但需姓名與 Email；見參加流程 | 僅暱稱、免 Email 是具體差異 |
| 安裝門檻 | **事實**：可使用桌面／手機網頁，無須原生 App；見第 5 節 | 網頁式輕量參與不能單獨作為獨有優勢 |
| 日期與時間投票 | **事實**：三種可用性回覆，時區轉換；見建立與參加說明 | 支援；屬共同核心能力 |
| 地點協調 | **事實**：可填活動地點；**未知**：未找到現行 Group Poll 原生多地點候選投票的官方證據 | 時間＋地點雙投票可作差異化假設；不能把填地點說成投地點，也不宜宣稱 Doodle 絕對無法變通 |
| 分享邀請 | **事實**：連結分享；內建 Email 邀請須付費；見建立說明 | 分享連結是共同能力；貼入 LINE 不等於 LINE API 整合 |
| 修改回覆 | **事實**：支援，受開放狀態與過去時段限制；見修改說明 | 原文件對自身修改規則不夠明確，應補上規格 |
| 結果定案 | **事實**：主辦人選單一時段並 Book it；可重新開放；見定案／編輯文件 | 支援；需定義平票、無共同時間、改期與鎖票 |
| 即時更新 | **事實**：有回覆檢視及投票更新通知；**未知**：未證實跨裝置畫面自動即時刷新及延遲 | 規劃自動更新；不可直接宣稱 Doodle 沒有即時功能 |
| 定案通知 | **事實**：依是否連接行事曆送行事曆邀請或確認 Email；見第 4 節 | 會員可選 Email；訪客免 Email 時仍需設計主動回訪／分享結果 |
| 催票 | **事實**：自動提醒須 Professional，且透過 Doodle Email invitation 邀請才生效；見第 4 節 | 未列為核心；與一般定案通知分開比較 |
| 活動歷史 | **事實**：dashboard 可搜尋 Doodles、查看 Upcoming／Past；見第 4 節 | 會員歷史紀錄是共同能力，不能稱獨有 |
| 行事曆整合 | **事實**：Google、Microsoft Outlook 365、Apple iCloud；整合說明列免費可連接；見第 4 節 | 未列核心；是 Doodle 較完整的能力 |
| 繁體中文 | **事實**：官方原生語言清單未列中文；見第 5 節 | 繁中優先可作產品方向，但自身完成度未驗證 |
| 手機使用 | **事實**：官方提供手機瀏覽器方案；原生 App 暫停；見第 5 節 | 手機優先仍需以任務操作測試驗證優勢 |
| 免費及付費限制 | **事實／衝突**：免費可使用但數量、時段與部分文件有差異；見第 6 節 | 揪一下收費、額度未定，不以「全部免費無限制」比較 |

## 4. 通知、歷史與行事曆的實際邊界

**定案通知：**接上主辦人行事曆時，所有已投票參加者都會收到邀請，包含未選中該最終時段者；未參與投票的人不會收到。未連接行事曆時，Doodle 寄確認 Email，收件者自行加入行事曆。因此「寄出邀請」不等於「每人已接受且自動加入」。[定案通知條件](https://help.doodle.com/en/articles/9457342-how-do-i-select-the-final-option-for-my-group-poll)

**自動催票：**Professional 功能，需用 Doodle 的 Email invitation 建立被邀者名單；只在 LINE 等地方貼連結，不能假設系統知道誰尚未回覆。這是催促投票，與活動開始前提醒、App 推播不同。[自動提醒說明](https://help.doodle.com/en/articles/9457379-how-do-automatic-reminders-for-group-poll-work)

**活動紀錄：**See all Doodles 可搜尋與篩選，See all Events 可切換 Upcoming／Past。訪客未登入的參加紀錄是否能於日後註冊後完整合併，未查證。[Dashboard 說明](https://help.doodle.com/en/articles/9457217-how-is-the-dashboard-organized)

**保存期限：**歷史清單不等於永久保存。隱私說明提及過期投票可能定期刪除，最早在最後候選日期後 30 天；付費訂閱有效期間的投票另有保留規則。這不是「固定第 30 天刪除」承諾。該文件的手動刪除敘述與新版編輯文件的付費限制不同，實際刪除權限仍需核對。[隱私政策第 7 節](https://help.doodle.com/en/articles/9457290-privacy-policy)、[新版編輯說明](https://help.doodle.com/en/articles/9457348-how-do-i-edit-my-group-poll)

**整合：**官方整合矩陣列出 Google Calendar、Microsoft Outlook 365 與 Apple iCloud Calendar 均可用於 Free／Professional；Microsoft Teams、Webex、Zapier 則列付費。不要把桌面 Apple Calendar App、iCloud 帳號與 ICS 匯入混為一談。[整合矩陣](https://help.doodle.com/en/articles/10456860-getting-started-with-doodle-integrations)

iCloud 連接需 Apple 的雙重認證及 app-specific password；行事曆連接不是一般 Group Poll 使用的必要條件。此為文件流程，未登入任何外部行事曆驗證同步。[連接行事曆](https://help.doodle.com/en/articles/9457274-how-do-i-connect-my-calendar-to-doodle)

## 5. 繁中與手機／App 狀態

**事實：**官方列出的原生語言是英文、德文、法文、義大利文、西班牙文，未列繁體中文。瀏覽器翻譯、可輸入中文文字、商店網頁有繁中介面，都不能作為產品原生繁中支援的證據；中文輸入的實際呈現未測。[語言設定](https://help.doodle.com/en/articles/9457361-how-do-i-change-my-account-settings-email-name-language-etc)

**重要更新：**官方公告發布於 2025-06-10，頁面標示更新 2026-09-23：原 Doodle 手機 App 已暫停商店下載；已安裝版本可能繼續執行，但不再主動支援。官方引導使用手機／桌面瀏覽器，亦可加入主畫面。本研究不把加入主畫面視為已驗證離線功能或推播支援。[官方 App 暫停公告](https://doodle.com/en/doodle-mobile-app-change/)

商店交叉核對：

- [Apple App Store：Doodle AG 開發者頁（德國區）](https://apps.apple.com/de/developer/doodle-ag/id938069764)列出 IRL by Doodle、SixMin Law，本次未見原 Doodle 排程 App。
- [Google Play：Doodle.com 開發者頁（美國英文頁）](https://play.google.com/store/apps/dev?id=8519672815997513612)列出 IRL by Doodle，並連回 doodle.com。
- 搜尋出現的 [Doodle Polls](https://play.google.com/store/apps/details?hl=en_US&id=com.doodle.lpu)開發者是 Love Power Up, LLC，不能當成本研究的 Doodle AG 官方 App。
- IRL 是另一個面對面認識後安排後續會議的產品，不能據此宣稱原 Group Poll App 已復活。[IRL 官方服務說明](https://irl.doodle.com/irl_terms_and_conditions_v1.0.pdf)

**未知：**未逐區驗證台灣 App 商店供應情形；新 App 的推出日期、與 Group Poll 的整合、手機瀏覽器效能、LINE 內建瀏覽器相容性、無障礙操作均未實測。對原 App 暫停的結論以官方公告為主要證據，而非單憑搜尋不到。

## 6. 方案價格與限制（2026-11-06 查核）

價格頁實際入口為 [Premium / Pricing](https://doodle.com/en/premium)；本次嘗試 `/en/pricing/` 回傳 404。價格頁可讀到 Free／Pro／Team／Enterprise 與功能，但 Pro／Team 主卡片金額未完整出現在可讀文字中，因此以下數字引用 **2026-09-24 更新的官方費用說明**，不宣稱已看到台灣結帳報價。[官方費用說明](https://help.doodle.com/en/articles/9457366-how-much-does-doodle-cost)

| 方案 | 月繳（USD） | 年繳（USD） | 計價與限制 |
|---|---:|---:|---|
| Free | 0 | 0 | 免費帳號；有功能與數量限制 |
| 個人 Pro／Professional | US$15／月 | US$132／年 | 單人授權；年繳折合 US$11／月（算術換算，非月繳價） |
| Team | US$21／人／月 | US$16／人／月，全年一次支付 | 至少 2 人；每人每年 US$192、2 人每年 US$384（算術換算） |
| Enterprise | 未列統一月價 | 價格頁標示 US$15,000 起、客製年繳 | 確切授權範圍與報價需詢價，不等同一般 Group Poll 方案 |

個人／Team 費用說明以地區決定幣別：瑞士 CHF、歐元區 EUR、其他地區 USD；因此台灣依該規則屬 USD，而非新台幣報價。未核對稅額、匯差、促銷或結帳總價。Team 大席次折扣表有「per year」與主表月均年繳單位不一致，不採用其數字推算大團隊報價。[官方費用與地區規則](https://help.doodle.com/en/articles/9457366-how-much-does-doodle-cost)

### 已確認及有衝突的權益

| 項目 | 官方資料 | 本報告採用方式 |
|---|---|---|
| 免費 Group Poll 數量 | 價格頁列 1；建立說明也寫每帳號僅 1 個 | 可確認有 1 個限制；不能自行解讀為每天、每月或永久一生一次，定案後能否再建未實測 |
| 免費候選時段 | 2026-10-06 FAQ 與錯誤碼文件列 20；Free 入門文件列 10 | **來源衝突**；20 有較新具日期 FAQ 支持，但實際帳號額度未知，不作無保留定論 |
| 免費其他產品數量 | 價格頁列 Booking Page、1:1、Sign-up Sheet 各 1；Free 入門文件的 Sign-up Sheet 為 3 | 對外摘要優先引用價格頁；保留 1／3 差異 |
| 付費數量及管理 | Pro 價格卡列不限 Group Poll 等活動數量、截止、提醒、隱藏參加者及無廣告 | 「不限活動數」不等於每個投票不限人數或所有資源無上限 |
| 每投票參加人數 | 建立說明列最多 1,000 人 | 是官方文件上限，未做負載／人數測試 |
| 刪除投票 | 2026-06-09 編輯文件列 Professional 才可刪 Group Poll；舊 dashboard／隱私說明較寬鬆 | 不承諾免費帳號可透過刪除重建繞過數量限制 |
| Zoom／Stripe 方案歸屬 | 整合矩陣列 Free 可用；價格卡將 Zoom 列於 Pro、Stripe 列於 Team | 列示位置與矩陣不一致；不據此認定免費功能已移除，具體方案需再確認 |

來源：[價格頁](https://doodle.com/en/premium)、[建立限制](https://help.doodle.com/en/articles/9457353-how-do-i-create-a-group-poll)、[Group Poll FAQ](https://help.doodle.com/en/articles/10295132-group-poll-troubleshooting-and-faq)、[錯誤碼](https://help.doodle.com/en/articles/10695631-error-codes-and-how-to-fix-them)、[Free 入門](https://help.doodle.com/en/articles/9987290-get-started-with-your-new-doodle-free-account)、[編輯權限](https://help.doodle.com/en/articles/9457348-how-do-i-edit-my-group-poll)、[整合矩陣](https://help.doodle.com/en/articles/10456860-getting-started-with-doodle-integrations)。

## 7. 原報告需要更新的地方

| 原報告內容 | 查核後處理 |
|---|---|
| 價格是先前引用、未重新確認 | 原個人與 Team 基本數字與官方費用說明相符；補查核日、來源更新日、USD 地區規則、年繳一次收取及至少兩人；不可稱已驗證結帳價 |
| 免費時段及管理功能「可能有限制」 | 改列已確認的 1 個 Group Poll 與管理付費條件；明列 10／20 時段來源衝突 |
| 進階提醒、截止、隱藏資訊「可能依方案」 | 建立文件已明確要求 Professional；催票還須透過 Doodle 寄邀請 |
| 訪客「通常」需要 Email | 現行 Group Poll 參加文件明載姓名與 Email，改為明確陳述並限定產品流程 |
| 參加者可修改回覆 | 補訪客確認信／原裝置、投票關閉及過去時段限制；不要等同可任意刪除紀錄 |
| 通知只概括 Email 支援 | 區分投票更新、催票、定案、改期與行事曆邀請；未回覆者不會自動收到定案通知 |
| 歷史紀錄可透過帳號管理 | 補 Upcoming／Past 與保存限制，避免永久保存誤解 |
| Google、Outlook、Apple 行事曆 | 精確為 Google Calendar、Microsoft Outlook 365、Apple iCloud；補免費連接及 iCloud 額外步驟 |
| 未說明手機 App 現況與語言 | 新增原 App 暫停、手機網頁替代及原生繁中未列支援 |
| 多地點投票「非主要功能」 | 保留審慎措辭：現有文件僅確認地點欄位，未確認原生多地點票選，不能證明絕對無法變通 |
| 揪一下即時更新優勢 | Doodle 的畫面即時同步未測，不能以未知當劣勢；揪一下亦仍為規劃 |
| 5 分制競爭力評分 | 建議移除：沒有測試方法、樣本或權重，不能作為競爭優劣的證據 |

## 8. 對揪一下的策略建議（推論，非市場驗證結果）

1. **優先完成同一活動的時間與地點票選。**以「週五／週六」及「餐廳 A／B」為具體任務，驗證能否在一頁完成選擇、看懂結果並定案。
2. **保留僅暱稱參與，同時設計修改與找回。**免 Email 可少填一項個資，但也失去 Doodle 使用確認信找回回覆的方式；應定義個人修改連結、裝置識別、同名參加者及清除瀏覽資料後的處理。
3. **繁中、手機與 LINE 群組情境優先。**測試貼連結、預覽、參與、返回群組及分享決議；以任務完成情形評估，不預設手機網頁一定優於 Doodle。
4. **把定案當成明確狀態。**候選項目新增後應標示待回覆；定案後鎖票，改期需重新開放並顯示更新；缺席、全部不行與未回覆要分開。
5. **先不追求完整商務整合。**Doodle 的行事曆與預約能力較完整；揪一下可先驗證朋友聚會需求，再決定是否加入行事曆匯出與通知。

可用於企劃書的結論：Doodle 已提供成熟的多人時間協調、免帳號參加與結果通知，但訪客需提供姓名及 Email，進階管理有付費門檻，官方原生語言未包含繁體中文。揪一下可針對台灣朋友與社群聚會，驗證僅暱稱參與及時間、地點共同決策的價值。此為基於官方資料的產品機會判斷，不是使用者偏好、市占或實測效能結論。

## 9. 後續仍需驗證

- 免費帳號當下實際顯示 10 或 20 個時段、1 個 Group Poll 的重置／再建立規則。
- Pro／Team 在台灣結帳的實際價格、稅額及大席次折扣；價格頁與說明中心整合權益差異。
- 多地點票選是否另有新功能、付費選項或官方替代流程。
- 未登入跨裝置修改、活動長期保存、即時刷新及通知到達情形。
- 繁中文字輸入、手機與 LINE 內建瀏覽器操作，以及台灣商店現況。

以上均為未完成驗證項目，不應在簡報中寫成已測試通過或已證明不存在。
