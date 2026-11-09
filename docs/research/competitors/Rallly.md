# 揪一下競爭者研究：Rallly

查核日期：2026-11-06（Asia/Taipei）｜研究範圍：Rallly Cloud，另註自行部署差異。

## 研究結論與證據界線

Rallly 是以候選日期／時段投票協調多人會議的開源產品，與「揪一下」的時間協調需求直接重疊。它已提供從分享、回覆到定案通知的完整流程，因此「免費、免註冊、找共同時間」不足以單獨形成差異化。[官方定位](https://rallly.co/)、[官方介紹](https://support.rallly.co/introduction)

本研究閱讀 `original/揪一下_競爭者分析報告_Rallly.md`，將其視為待核對背景；揪一下的比較基準只採用該報告所載規劃，未取得獨立需求規格或可執行成品，不代表已完成。外部查核採官方網站、文件、公告、公開建立頁與 App 商店搜尋，沒有建立活動、寄信、付款、登入帳號或進行手機實機測試。

本文的「已確認」指官方文件或公開頁面有明確依據，不代表實測通過；「推論」為研究判斷；「未知」為證據不足。搜尋未找到、頁面擷取失敗或未展示功能，均不構成不支援的證據。

## 1. 定位、對象及使用門檻

官方定位為團體會議排程投票：主辦人提供選項，大家回報可出席程度，再由主辦人決定。官網列出助理、委員會、運動社團及論文口試等情境；可應用朋友聚會，但「朋友社交網路」不是本次確認的主要產品定位。[官網](https://rallly.co/)

建立與參加投票不必先註冊；免費帳號增加跨裝置管理及回覆通知。訪客可同時維持 1 個開放投票，Hobby 免費帳號為 3 個，Pro 不限。這裡限制的是「仍在收票的投票」，不是一生能建立的總數。[FAQ](https://support.rallly.co/faq)、[2026-10-13 更新](https://rallly.co/blog/finalizing-polls-is-now-free)

**免帳號不等於不用 Email。** 2026-10-28 起，網站新建投票預設啟用 Require email，主辦人可關閉，讓參與者只填名字。既有投票維持原設定；API 新建投票保留其原預設。原報告的「暱稱即可參加」須附上此條件。[Email 預設更新](https://rallly.co/blog/participant-email-by-default)

Web 使用不需要安裝。官方有手機投票介面更新；但本次未確認屬於 rallly.co／Stack Snap Ltd. 的原生 iOS 或 Android 商店上架。搜尋出現的「Rallly - Social Running」為 Robert Koch 的跑步產品，連結 rallly.run，不能當作此競品的 App 證據。[官方手機公告](https://rallly.co/blog/mobile-voting-redesign)、[同名但不同產品的 App Store 頁](https://apps.apple.com/tw/app/rallly-social-running/id6757997351)

## 2. 建立、參加與定案流程

1. **建立：** 在 [公開建立頁](https://app.rallly.co/new) 設定標題；可加入地點、說明與視訊選項。用月／週檢視挑選日期或時段，也可選全天；可自動換算時區，或鎖定時區。[建立說明](https://support.rallly.co/workflow/create)
2. **分享：** 複製邀請網址，貼到群組或自行寄信；連結分享免費。透過 Rallly 寄送個人 Email 邀請並追蹤寄出、開啟及回覆狀態，則需 Cloud Pro。[邀請說明](https://support.rallly.co/workflow/invite)
3. **回覆：** 回答 Yes／If need be／No，主辦人也可改成二態。完成後填資料並儲存；未選的選項按 No 計算。手機更新提供明確 Decline 按鈕，並要求先作選擇才能繼續；不應把「未選某時段」與「完全沒回覆的人」混為一談。[參與者指南](https://support.rallly.co/guide/participant-guide)、[手機介面公告](https://rallly.co/blog/mobile-voting-redesign)
4. **修改：** 可用姓名旁選單編輯。瀏覽器 Cookie 辨認回覆者；換裝置或清 Cookie 可能失去辨識。填 Email 可收編輯連結，主辦人也能提供該連結、代改或刪除後讓對方重填。[回覆修改說明](https://support.rallly.co/guide/participant-guide)
5. **統計與定案：** Finalize 列出熱門程度排序、前三名及每個選項的票數分布，由主辦人選擇，並非票最多就自動定案。可選擇通知哪些有 Email 的參與者；完成後關閉新回覆，在原投票頁顯示最終日期，可加入行事曆。未留 Email 的人無法收到該 Email 通知。[定案說明](https://support.rallly.co/workflow/schedule)

## 3. 功能核對表

| 查核項目 | 狀態與具體界線 | 直接來源 |
|---|---|---|
| 活動標題、說明、地點 | 已確認；地點是活動資訊，不能直接等同多地點投票 | [建立文件](https://support.rallly.co/workflow/create) |
| 多日期／時間與全天 | 已確認；時段或整日選項、時區換算／鎖定 | [建立文件](https://support.rallly.co/workflow/create) |
| 多候選地點投票 | 未知；已確認的官方工作流為日期／時間選項，未取得多地點投票證據 | [工作流](https://support.rallly.co/workflow/create) |
| 三態／二態回覆 | 已確認，可切換；不是任意分數排序投票 | [建立文件](https://support.rallly.co/workflow/create) |
| 訪客參加 | 已確認不必註冊；新投票預設要求 Email，可關閉 | [更新公告](https://rallly.co/blog/participant-email-by-default) |
| 回覆修改與跨裝置恢復 | 已確認 Cookie 與編輯連結機制；並非必須會員才能改票 | [參與者指南](https://support.rallly.co/guide/participant-guide) |
| 統計、排序、人工定案 | 已確認；可看票況並挑選最終日期 | [定案文件](https://support.rallly.co/workflow/schedule) |
| 即時同步 | 可查看集中票況；無刷新同步、延遲及多人同時操作一致性未實測，不能保證即時推播 | [邀請文件](https://support.rallly.co/workflow/invite) |
| 留言討論 | 已確認公開建立頁有 Comments 開關，允許公開留言 | [建立頁](https://app.rallly.co/new) |
| 回覆通知給主辦人 | 官方確認免費帳號可在有人回覆時取得通知；各通知開關與頻率未驗證 | [官網 FAQ](https://rallly.co/) |
| Email 邀請與追蹤 | 已確認 Pro 功能；追蹤開啟及回覆，不應擴張成已確認自動催票 | [邀請文件](https://support.rallly.co/workflow/invite) |
| 定案通知 | 全方案可用，寄送給選定且有 Email 的參與者；大量寄送可能分批 | [定案文件](https://support.rallly.co/workflow/schedule) |
| 自動提醒未回覆者／LINE 推播 | 未知；本次官方資料未充分說明 | [邀請文件的證據範圍](https://support.rallly.co/workflow/invite) |
| 活動歷史與管理 | 帳號可跨裝置管理投票，但免費保留受刪除規則限制；不能推定所有曾參加活動都會自動形成永久歷史清單 | [官網](https://rallly.co/)、[價格頁](https://rallly.co/pricing) |
| 行事曆邀請／加入 | 已確認定案後寄送邀請與頁面加入行事曆；Google Meet 文件明載 `.ics` | [定案](https://support.rallly.co/workflow/schedule)、[Google Meet](https://support.rallly.co/integrations/google-meet) |
| 連接 Google Calendar | Google Meet 文件提及獨立 Calendar 連線，足以證明並非只有下載邀請；可讀忙閒範圍、雙向同步及方案限制仍未知 | [Google Meet 文件](https://support.rallly.co/integrations/google-meet) |
| 視訊連結 | Google Meet、Zoom、Microsoft Teams、Webex 全方案；需相應服務帳號與連接授權。Meet 連結本身不會透過該整合新增 Google Calendar 事件 | [免費定案公告](https://rallly.co/blog/finalizing-polls-is-now-free)、[Meet 說明](https://support.rallly.co/integrations/google-meet) |
| 手機支援 | 已確認官方提供手機 Web 投票設計；操作品質、裝置相容性未實測 | [2026-08-14 公告](https://rallly.co/blog/mobile-voting-redesign) |
| 繁體中文 | 未確認現行正式站繁中切換、完整度與 Email 在地化。官方有志工翻譯及 Crowdin 專案；這本身不足以證明繁中已完整上線 | [翻譯文件](https://support.rallly.co/contribute/translations)、[Crowdin](https://crowdin.com/project/rallly) |
| 每選項人數上限、投票截止期限 | 官方 FAQ 明確稱目前不支援；候選日期過去自動關閉是另一項規則 | [FAQ](https://support.rallly.co/faq) |
| 開源／自行部署 | 已確認；自行部署授權與 Cloud 訂閱不同，不能等同企業使用零成本 | [官方 GitHub](https://github.com/lukevella/rallly)、[自架授權](https://support.rallly.co/self-hosting/licensing) |
| API／Webhooks | API 的 2026-09-15 公告日期已確認；現行價格頁列 Pro Webhooks，當年 API 發布文仍寫計畫中，須區分時間點。Webhook 文件此次未成功讀取，不列保證的事件細節 | [API 公告](https://rallly.co/blog/introducing-the-rallly-api)、[價格頁](https://rallly.co/pricing) |

## 4. 價格與限制（2026-11-06 查核）

| 項目 | 未註冊訪客 | Hobby 免費帳號 | Pro Cloud |
|---|---|---|---|
| 價格 | 免費 | 免費 | 月繳 US$10／席；年繳 US$72／席（等值 US$6／月） |
| 同時開放投票 | 1 | 3 | 不限 |
| 累計投票／參與者／選項 | 官方 FAQ 稱不限，另有防濫用技術限制 | 同左 | 同左 |
| 定案及行事曆邀請 | 全方案提供；通知仍需 Email | 提供 | 提供 |
| 保留 | 免費投票受清理規則影響 | 受清理規則影響 | 無限期保留 |
| 複製、隱藏姓名／票況 | 未列免費提供 | 未包含 | 包含 |
| 平台 Email 邀請／團隊協作／品牌／API 與 Webhooks | 未列免費提供 | 未包含 | 包含 |

來源：[價格表](https://rallly.co/pricing)、[限制 FAQ](https://support.rallly.co/faq)、[免費定案更新](https://rallly.co/blog/finalizing-polls-is-now-free)。

英文價格頁顯示 `$6 /seat/mo, billed yearly`；本次另於 2026-11-06 直接讀取官方頁面 HTML，確認幣別選單為 `$ USD`，頁面內嵌美元價格資料為 `monthly:1000, yearly:7200`（以分計），對應 **月繳 US$10／席／月、年繳 US$72／席／年**。年繳等值每月 US$6，不代表可每月只付 US$6。[官方挪威文價格頁](https://rallly.co/no/pricing) 亦明列 USD，作交叉核對。本次未結帳，稅額、台灣在地結帳幣別及最終扣款未確認。席位指 Pro space 成員，不是每位投票參與者。[席位及帳務](https://support.rallly.co/spaces/billing)

**刪除規則有官方文字差異：**現行英文價格頁稱「所有候選日期均已過去超過 30 天，且 30 天沒有活動」才刪除；FAQ 稱「所有候選日期已過去，且超過 30 天沒有活動」。活動包括投票、留言、修改。這會影響最早刪除日，不能只寫成「建立後 30 天刪除」，也不能在未實測前宣稱兩頁已一致。此報告引用價格頁為方案比較基準，保留 FAQ 差異待官方釐清。[價格頁](https://rallly.co/pricing)、[FAQ](https://support.rallly.co/faq)

自架另有 Personal／Plus／Organization／Enterprise 授權，官方稱個人使用免費，多使用者請購買授權，且採信任制。這是 v4.x 的永久授權，並非 Cloud Pro 月／年訂閱；伺服器及寄信維運也須另行考慮。本研究不將自架報價混入 Cloud 比價。[自行部署授權](https://support.rallly.co/self-hosting/licensing)

## 5. 與揪一下比較及策略推論

下表的「揪一下」全部是原報告中的規劃，非完成宣告。

| 面向 | Rallly 本次確認 | 揪一下規劃／意義 |
|---|---|---|
| 活動資訊與時間投票 | 已形成建立至定案流程 | 高度重疊，是基本能力 |
| 多地點投票 | 已有地點欄位，多地點決策未確認 | 規劃多候選地點，是值得驗證的差異方向 |
| 暱稱訪客 | 可行，但新投票預設要 Email | 可採暱稱優先；須同時設計改票恢復與通知選擇 |
| 最終結果與 Email | 免費方案已具備 | 規劃功能，不宜宣稱競品缺少 |
| 會員活動歷史 | 可管理投票；免費有保留限制 | 規劃歷史紀錄；可明確設計「我建立／我參加」與保存政策 |
| 即時結果 | 集中票況已確認，即時機制未測 | 規劃即時同步；須用可驗證延遲與並發情境支持 |
| 繁中 | 現行完整度未知 | 規劃繁中；應靠文案、日期格式與手機可用性驗證價值 |
| 開源自行部署 | 已有成熟選項與官方文件 | 原報告未規劃，無須作為初版競爭焦點 |

**推論：**Rallly 的優勢在低註冊門檻、成熟時間決策及可恢復回覆；對揪一下的威脅較原報告所暗示的「簡單時間投票」更完整。免費同時開放數限制與保留規則，可能影響經常揪團的主辦人，但影響大小須訪談確認，不能直接推論成大規模流失。

**建議：**優先把「時間＋地點一起完成決策」做成清楚的使用流程；同時考慮兩者搭配限制，例如某個地點只適用部分時段。匿名回覆應搭配可保存的編輯連結；通知可選填 Email，並清楚說明未留信箱只能回原頁查看結果。這些是揪一下的設計建議，不是已證實 Rallly 缺少的全部能力。

建議後續驗收：建立 3 個日期與 2 個地點；多人回覆後改票；主辦人比較交集並定案；未留 Email 者從原連結看到結果；有留 Email 者收到通知；在手機與另一瀏覽器恢復回覆。此清單尚未執行，不是測試結果。

## 6. 原報告需更新處

| 原內容 | 更新方式 |
|---|---|
| Hobby 建立投票無限制 | 補上「累計不限，但同時收票最多 3 個；訪客 1 個」 |
| 訪客暱稱參與 | 保留免帳號，但加上 2026-10-28 起預設要求 Email、可由主辦人關閉 |
| 地點欄位依版本確認 | 已有官方建立文件，可改為支援活動地點；多地點投票仍未知 |
| 最終確認及通知概述 | 補上 2026-10-13 起全方案免費、只通知有 Email 且選定的參與者 |
| Email 通知一概比較 | 拆為主辦人回覆通知、付費邀請追蹤、免費定案通知；提醒未回覆者仍未知 |
| 歷史保留 30 天 | 明列刪除條件及價格頁／FAQ 矛盾；勿暗示永久歷史或建立後固定刪除 |
| 回覆修改未詳細分析 | 補 Cookie、編輯連結、換裝置恢復與主辦人協助機制 |
| 行事曆功能籠統 | 分開 `.ics` 邀請、加入行事曆、Calendar 帳號連接及視訊連結；同步範圍仍待確認 |
| API 公告日期待確認 | 2026-09-15 已有官方公告；Webhooks 以目前價格頁列載為準，勿由舊公告推論仍未提供 |
| kodadocs 作為文件入口 | 改用官網直接連結的 support.rallly.co；舊網址可被搜尋到不等於官方最新文件來源 |
| 繁中與即時同步待測 | 保留待確認，補充已查來源及未確認範圍，不改成「不支援」 |
| 90／95／90／30 威脅評分 | 移除作為研究結論的數字；無量表、樣本或測試，不具可比較實證基礎 |

以上更新依據均見前述各節直接來源。未引用官網動態使用人數作為市場占有率，也未將同名 App、第三方價格彙整或自行部署站點當成官方 Cloud 的現況。

## 7. 尚待確認與研究限制

- 稅費與台灣結帳幣別：美元月繳與年繳價格已由官方價格頁及其內嵌資料核對；未進入結帳確認在地應付金額。
- 繁中：本次繁中網址擷取失敗，Crowdin 擷取也未提供可靠語言清單；須直接操作語言選單與檢查投票／通知文案。
- 多地點投票、Google Calendar 的忙閒讀取／雙向同步／權限與方案、歷史清單是否完整納入參與活動：未取得足夠官方證據。
- 即時同步、修改後通知、定案後再次修改、Email 實際抵達率、手機操作品質：未操作驗證。
- 公開頁面、索引及翻譯頁可能不同步；已特別保留保留期限與 Webhooks 公告時間差，不自行補成一致。

此研究可作專題競爭分析及需求討論依據；需要標示「實測」的欄位，應另安排測試帳號與裝置驗證。

