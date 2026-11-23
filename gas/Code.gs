/**
 * 揪一下 (Squad Up) - 成行 E-Mail 自動通知服務 (Google Apps Script)
 * 支援依各收件會員設定之語系（zh-TW 繁體中文 / en English / ja 日本語）自動寄送對應語系通知信。
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
 *    貼給 AI 助手或填入 index.html 的 DEFAULT_GAS_EMAIL_WEBAPP_URL 即可！
 */

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var recipients = Array.isArray(data.recipients) ? data.recipients : [];
    var defaultSubject = data.subject || ('【揪一下成行通知】「' + (data.title || '揪團活動') + '」已拍板定案！');
    var defaultBodyText = data.bodyText || '';
    var sentList = [];

    for (var i = 0; i < recipients.length; i++) {
      var r = recipients[i];
      var email = (r && r.email ? String(r.email) : '').trim();
      if (!email) continue;

      var lang = normalizeLang_(r && r.lang ? r.lang : data.lang);
      var nickname = (r && r.nickname ? String(r.nickname) : getDefaultMemberLabel_(lang)).trim();
      var isHost = Boolean(r && r.isHost);

      var subject = (r && r.subject) ? String(r.subject) : buildLocalizedSubject_(data, lang, defaultSubject);
      var bodyText = (r && r.bodyText) ? String(r.bodyText) : buildLocalizedBodyText_(data, nickname, isHost, lang, defaultBodyText);
      var htmlBody = (r && r.htmlBody) ? String(r.htmlBody) : buildHtmlEmail_(data, r, nickname, isHost, lang);
      var senderName = getSenderName_(lang);

      MailApp.sendEmail({
        to: email,
        subject: subject,
        body: bodyText,
        htmlBody: htmlBody,
        name: senderName
      });

      sentList.push({ email: email, lang: lang });
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
      status: 'Active',
      supportedLanguages: ['zh-TW', 'en', 'ja']
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeLang_(raw) {
  var s = String(raw || '').trim();
  if (s === 'en' || s.toLowerCase().indexOf('en') === 0) return 'en';
  if (s === 'ja' || s.toLowerCase().indexOf('ja') === 0) return 'ja';
  return 'zh-TW';
}

function getDefaultMemberLabel_(lang) {
  if (lang === 'en') return 'Member';
  if (lang === 'ja') return '会員';
  return '會員';
}

function getSenderName_(lang) {
  if (lang === 'en') return 'Squad Up Notification';
  if (lang === 'ja') return 'スコッドアップ Squad Up 通知';
  return '揪一下 Squad Up 聚會通知';
}

function buildLocalizedSubject_(data, lang, fallback) {
  var title = data.title || (lang === 'en' ? 'Gathering' : lang === 'ja' ? 'イベント' : '揪團活動');
  var dateSuffix = data.finalDate ? (lang === 'en' ? ' (' + data.finalDate + ')' : '（' + data.finalDate + '）') : '';
  if (lang === 'en') {
    return '[Squad Up Confirmed] "' + title + '" has been finalized!' + dateSuffix;
  }
  if (lang === 'ja') {
    return '【スコッドアップ開催確定】「' + title + '」の日程が確定しました！' + dateSuffix;
  }
  return fallback || ('【揪一下成行通知】「' + title + '」已拍板定案！' + dateSuffix);
}

function buildLocalizedBodyText_(data, recipientName, isHost, lang, fallback) {
  var title = data.title || (lang === 'en' ? 'Untitled Gathering' : lang === 'ja' ? '無題の募集' : '未命名揪團');
  var hostNickname = data.hostNickname || (lang === 'en' ? 'Host' : lang === 'ja' ? '幹事' : '主辦人');
  var timeText = data.timeText || '--';
  var locationText = data.locationText || (lang === 'en' ? 'Place to be decided' : lang === 'ja' ? '場所は未定です' : '地點尚未確定');
  var notes = data.notes || '';
  var participantsText = data.participantsText || '--';
  var roomCode = data.roomCode || '--';
  var shareUrl = data.shareUrl || 'https://squad-up-tw.vercel.app/';

  if (lang === 'en') {
    var enLines = [
      'Hi ' + recipientName + (isHost ? ' (Host)' : ' (Participant)') + ', your gathering "' + title + '" has been finalized by host ' + hostNickname + '! Here are the confirmed event details:',
      '',
      '📌 Event Title: ' + title,
      '👑 Host: ' + hostNickname,
      '🕒 Confirmed Time: ' + timeText,
      '📍 Confirmed Place: ' + locationText
    ];
    if (notes) enLines.push('📝 Event Notes: ' + notes);
    enLines.push(
      '👥 Participants: ' + participantsText,
      '🔑 Room Code: ' + roomCode,
      '🔗 Gathering Link: ' + shareUrl,
      '',
      '— Squad Up | Real-time online gathering coordination'
    );
    return enLines.join('\n');
  }

  if (lang === 'ja') {
    var jaLines = [
      recipientName + ' 様' + (isHost ? '（幹事）' : '（参加者）') + '、参加中の募集「' + title + '」が幹事の ' + hostNickname + ' さんにより確定されました！確定した詳細は以下の通りです：',
      '',
      '📌 イベント名：' + title,
      '👑 幹事：' + hostNickname,
      '🕒 確定日時：' + timeText,
      '📍 確定場所：' + locationText
    ];
    if (notes) jaLines.push('📝 イベント備考：' + notes);
    jaLines.push(
      '👥 参加メンバー：' + participantsText,
      '🔑 ルームコード：' + roomCode,
      '🔗 ルームリンク：' + shareUrl,
      '',
      '—— スコッドアップ Squad Up | オンラインでリアルタイムに集まりを調整'
    );
    return jaLines.join('\n');
  }

  return fallback;
}

function escapeHtml_(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlEmail_(data, recipientObj, recipientName, isHost, lang) {
  var l = normalizeLang_(lang);
  var title = escapeHtml_(data.title || (l === 'en' ? 'Untitled Gathering' : l === 'ja' ? '無題の募集' : '未命名揪團'));
  var hostNickname = escapeHtml_(data.hostNickname || (l === 'en' ? 'Host' : l === 'ja' ? '幹事' : '主辦人'));
  var timeText = escapeHtml_((recipientObj && recipientObj.timeText) || data.timeText || '--');
  var locationText = escapeHtml_((recipientObj && recipientObj.locationText) || data.locationText || (l === 'en' ? 'Place to be decided' : l === 'ja' ? '場所は未定です' : '地點尚未確定'));
  var notes = escapeHtml_(data.notes || '');
  var participantsText = escapeHtml_((recipientObj && recipientObj.participantsText) || data.participantsText || '--');
  var roomCode = escapeHtml_(data.roomCode || '--');
  var shareUrl = escapeHtml_(data.shareUrl || 'https://squad-up-tw.vercel.app/');
  var greetName = escapeHtml_(recipientName || getDefaultMemberLabel_(l));

  var badgeText = '🎉 揪一下 SQUAD UP · 成行通知';
  var headerTitle = '「' + title + '」已拍板定案！';
  var roleTag = isHost ? '（主辦人）' : '（參加者）';
  var introHtml = 'Hi <strong>' + greetName + '</strong> ' + roleTag + '，您參與的揪團活動已經由主辦人 <strong>' + hostNickname + '</strong> 拍板定案囉！以下是本次成行活動的詳細資訊：';
  var lblTitle = '📌 活動主題';
  var lblHost = '👑 主辦人';
  var lblTime = '🕒 確認時間';
  var lblLoc = '📍 確認地點';
  var lblParticipants = '👥 參加成員名單';
  var lblCode = '🔑 房間代碼';
  var lblNotes = '📝 活動備註';
  var btnText = '開啟揪團房間與匯出行事曆 →';
  var footerText = '此信件由「揪一下 Squad Up」系統自動發送，因為您已登入會員並勾選「接收成行 E-Mail 通知」。';

  if (l === 'en') {
    badgeText = '🎉 SQUAD UP · GATHERING CONFIRMED';
    headerTitle = '"' + title + '" is Confirmed!';
    roleTag = isHost ? '(Host)' : '(Participant)';
    introHtml = 'Hi <strong>' + greetName + '</strong> ' + roleTag + ', your gathering has been finalized by host <strong>' + hostNickname + '</strong>! Here are the confirmed details:';
    lblTitle = '📌 Event Title';
    lblHost = '👑 Host';
    lblTime = '🕒 Confirmed Time';
    lblLoc = '📍 Confirmed Place';
    lblParticipants = '👥 Participants';
    lblCode = '🔑 Room Code';
    lblNotes = '📝 Event Notes';
    btnText = 'Open Gathering Room & Export Calendar →';
    footerText = 'Sent automatically by Squad Up because you signed in and enabled finalized gathering E-Mail notifications.';
  } else if (l === 'ja') {
    badgeText = '🎉 スコッドアップ SQUAD UP · 開催確定通知';
    headerTitle = '「' + title + '」の日程が確定しました！';
    roleTag = isHost ? '（幹事）' : '（参加者）';
    introHtml = '<strong>' + greetName + '</strong> 様 ' + roleTag + '、参加中の募集が幹事の <strong>' + hostNickname + '</strong> さんによって確定されました！詳細は以下の通りです：';
    lblTitle = '📌 イベント名';
    lblHost = '👑 幹事';
    lblTime = '🕒 確定日時';
    lblLoc = '📍 確定場所';
    lblParticipants = '👥 参加メンバー';
    lblCode = '🔑 ルームコード';
    lblNotes = '📝 イベント備考';
    btnText = 'ルームを開いてカレンダーに追加 →';
    footerText = 'このメールは「スコッドアップ Squad Up」でログインし、開催確定のE-Mail通知をオンに設定された方へ自動送信されています。';
  }

  var notesBlock = notes
    ? '<div style="margin-top:12px;padding:12px 14px;background:#FAF6F1;border-left:4px solid #795238;border-radius:8px;">' +
        '<div style="font-size:12px;font-weight:bold;color:#64422E;margin-bottom:4px;">' + lblNotes + '</div>' +
        '<div style="font-size:14px;color:#2D3748;white-space:pre-wrap;line-height:1.6;">' + notes + '</div>' +
      '</div>'
    : '';

  return (
    '<div style="font-family:\'Noto Sans TC\',\'PingFang TC\',\'Hiragino Sans\',\'Meiryo\',\'Microsoft JhengHei\',sans-serif;max-width:560px;margin:0 auto;background:#FAF9F5;padding:24px;border-radius:20px;border:1px solid #E2CDB7;color:#2D3748;">' +
      '<div style="background:linear-gradient(135deg,#2C1E16,#503526);padding:20px 22px;border-radius:16px;color:#FFFFFF;">' +
        '<div style="font-size:12px;color:#F9C48A;font-weight:bold;letter-spacing:0.5px;">' + badgeText + '</div>' +
        '<h2 style="margin:6px 0 0;font-size:20px;color:#FFFFFF;">' + headerTitle + '</h2>' +
      '</div>' +
      '<div style="padding:18px 4px 8px;">' +
        '<p style="font-size:14px;line-height:1.6;margin:0 0 14px;">' + introHtml + '</p>' +
        '<div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:16px;space-y:10px;">' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">' + lblTitle + '</span><strong style="font-size:15px;color:#2D3748;">' + title + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">' + lblHost + '</span><strong style="font-size:14px;color:#2D3748;">' + hostNickname + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">' + lblTime + '</span><strong style="font-size:15px;color:#795238;">' + timeText + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">' + lblLoc + '</span><strong style="font-size:15px;color:#C26D1F;">' + locationText + '</strong></div>' +
          '<div style="margin-bottom:10px;"><span style="font-size:12px;color:#718096;display:block;">' + lblParticipants + '</span><span style="font-size:14px;color:#2D3748;font-weight:600;">' + participantsText + '</span></div>' +
          '<div><span style="font-size:12px;color:#718096;display:block;">' + lblCode + '</span><code style="font-size:13px;background:#F1E6DA;color:#503526;padding:2px 8px;border-radius:6px;font-weight:bold;">' + roomCode + '</code></div>' +
          notesBlock +
        '</div>' +
        '<div style="text-align:center;margin-top:20px;">' +
          '<a href="' + shareUrl + '" target="_blank" style="display:inline-block;background:#795238;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 26px;border-radius:12px;">' + btnText + '</a>' +
        '</div>' +
        '<p style="margin-top:20px;font-size:11px;color:#718096;text-align:center;">' + footerText + '</p>' +
      '</div>' +
    '</div>'
  );
}
