/**
 * 揪一下 (Squad Up) - 成行 E-Mail 自動通知服務 (Google Apps Script)
 *
 * 【部署步驟】（只需設定一次，約 1 分鐘）：
 * 1. 前往 https://script.google.com/ 點選左上角「＋ 新專案」。
 * 2. 將本檔案 (Code.gs) 的所有程式碼完整複製，覆蓋貼上到編輯器中，按 Ctrl+S 儲存。
 * 3. 點選右上角藍色按鈕「部署 (Deploy)」 -> 「新增部署作業 (New deployment)」。
 * 4. 點選左上角齒輪「選取類型」 -> 勾選「網頁應用程式 (Web app)」。
 * 5. 設定如下：
 *    - 說明：Squad Up 成行通知
 *    - 執行身分 (Execute as)：選「我 (Me)」
 *    - 誰可以存取 (Who has access)：務必選「所有人 (Anyone)」
 * 6. 點選「部署 (Deploy)」，並點選「核准存取權 (Authorize access)」：
 *    - 選擇您的 Google 帳號 -> 點選左下角「進階 (Advanced)」 -> 點選「前往『未命名專案』(不安全)」 -> 點選「允許 (Allow)」。
 * 7. 複製產生的「網頁應用程式網址 (Web app URL)」（格式為 https://script.google.com/macros/s/AKfycb.../exec），
 *    貼給 AI 助手或填入 index.html 的 GAS_EMAIL_WEBAPP_URL 即可！
 */

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var recipients = Array.isArray(data.recipients) ? data.recipients : [];
    var subject = data.subject || ('【揪一下成行通知】「' + (data.title || '揪團活動') + '」已拍板定案！');
    var bodyText = data.bodyText || '';
    var sentList = [];

    for (var i = 0; i < recipients.length; i++) {
      var r = recipients[i];
      var email = (r && r.email ? String(r.email) : '').trim();
      if (!email) continue;

      var nickname = (r && r.nickname ? String(r.nickname) : '會員').trim();
      var htmlBody = buildHtmlEmail_(data, nickname, Boolean(r && r.isHost));

      MailApp.sendEmail({
        to: email,
        subject: subject,
        body: bodyText,
        htmlBody: htmlBody,
        name: '揪一下 Squad Up 聚會通知'
      });

      sentList.push(email);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sentCount: sentList.length, sentTo: sentList }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'Squad Up GAS Email Notification Service',
      status: 'Active'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlEmail_(data, recipientName, isHost) {
  var title = escapeHtml_(data.title || '未命名揪團');
  var hostNickname = escapeHtml_(data.hostNickname || '主辦人');
  var timeText = escapeHtml_(data.timeText || '--');
  var locationText = escapeHtml_(data.locationText || '地點尚未確定');
  var notes = escapeHtml_(data.notes || '');
  var participantsText = escapeHtml_(data.participantsText || '--');
  var roomCode = escapeHtml_(data.roomCode || '--');
  var shareUrl = escapeHtml_(data.shareUrl || 'https://yachiyao.github.io/SquadUp/');
  var greetName = escapeHtml_(recipientName || '會員');
  var roleTag = isHost ? '（主辦人）' : '（參加者）';

  var notesBlock = notes
    ? '<div style="margin-top:12px;padding:12px 14px;background:#FAF6F1;border-left:4px solid #795238;border-radius:8px;">' +
        '<div style="font-size:12px;font-weight:bold;color:#64422E;margin-bottom:4px;">📝 活動備註</div>' +
        '<div style="font-size:14px;color:#2D3748;white-space:pre-wrap;line-height:1.6;">' + notes + '</div>' +
      '</div>'
    : '';

  return (
    '<div style="font-family:\'Noto Sans TC\',\'PingFang TC\',\'Microsoft JhengHei\',sans-serif;max-width:560px;margin:0 auto;background:#FAF9F5;padding:24px;border-radius:20px;border:1px solid #E2CDB7;color:#2D3748;">' +
      '<div style="background:linear-gradient(135deg,#2C1E16,#503526);padding:20px 22px;border-radius:16px;color:#FFFFFF;">' +
        '<div style="font-size:12px;color:#F9C48A;font-weight:bold;letter-spacing:0.5px;">🎉 揪一下 SQUAD UP · 成行通知</div>' +
        '<h2 style="margin:6px 0 0;font-size:20px;color:#FFFFFF;">「' + title + '」已拍板定案！</h2>' +
      '</div>' +
      '<div style="padding:18px 4px 8px;">' +
        '<p style="font-size:14px;line-height:1.6;margin:0 0 14px;">Hi <strong>' + greetName + '</strong> ' + roleTag + '，您參與的揪團活動已經由主辦人 <strong>' + hostNickname + '</strong> 拍板定案囉！以下是本次成行活動的詳細資訊：</p>' +
        '<div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:16px;space-y:10px;">' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">📌 活動主題</span><strong style="font-size:15px;color:#2D3748;">' + title + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">👑 主辦人</span><strong style="font-size:14px;color:#2D3748;">' + hostNickname + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">🕒 確認時間</span><strong style="font-size:15px;color:#795238;">' + timeText + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">📍 確認地點</span><strong style="font-size:15px;color:#C26D1F;">' + locationText + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">👥 參加成員名單</span><span style="font-size:14px;color:#2D3748;font-weight:600;">' + participantsText + '</span></div>' +
          '<div><span style="font-size:12px;color:#718096;display:block;">🔑 房間代碼</span><code style="font-size:13px;background:#F1E6DA;color:#503526;padding:2px 8px;border-radius:6px;font-weight:bold;">' + roomCode + '</code></div>' +
          notesBlock +
        '</div>' +
        '<div style="text-align:center;margin-top:20px;">' +
          '<a href="' + shareUrl + '" target="_blank" style="display:inline-block;background:#795238;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 26px;border-radius:12px;">開啟揪團房間與匯出行事曆 →</a>' +
        '</div>' +
        '<p style="margin-top:20px;font-size:11px;color:#718096;text-align:center;">此信件由「揪一下 Squad Up」系統自動發送，因為您已登入會員並勾選「接收成行 E-Mail 通知」。</p>' +
      '</div>' +
    '</div>'
  );
}
