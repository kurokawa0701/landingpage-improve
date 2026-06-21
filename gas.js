// ======================================================
// 設定
// ======================================================
const NOTIFY_EMAIL  = 'kazuma.kurokawa@oneness-group.jp'; // 管理者通知先
const PDF_FILE_ID   = '1s4QxAuf9ffV3xbla8Wklr1v9RHtlpCFF';
const PDF_FILE_NAME = 'SES営業支援サービス_資料.pdf'; // メール添付時のファイル名

// ======================================================
// POST リクエスト受信（フォーム送信時に呼ばれる）
// ======================================================
function doPost(e) {
  try {
    if (!e || !e.parameter) {
      throw new Error('パラメータが存在しません。フォームから送信してください。');
    }
    const params = e.parameter;
    const type   = params.type || 'contact'; // "download" or contact types

    if (type === 'download') {
      handleDownload(params);
    } else {
      handleContact(params);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ======================================================
// 資料請求フォーム処理
// ======================================================
function handleDownload(p) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('資料請求');
  const now   = new Date();

  // ヘッダーが無ければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['受信日時', '会社名', 'お名前', 'メールアドレス']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#163A5C').setFontColor('#ffffff');
  }

  sheet.appendRow([
    Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
    p.company || '',
    p.name    || '',
    p.email   || ''
  ]);

  const dateStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  // ── 申込者へPDF送信 ──────────────────────────────
  try {
    const file       = DriveApp.getFileById(PDF_FILE_ID);
    const pdfBlob    = file.getBlob().setName(PDF_FILE_NAME);
    const toSubject  = '【資料送付】SES営業支援サービスのご案内';
    const toBody     = [
      (p.name || '') + ' 様',
      '',
      'この度は資料請求いただきありがとうございます。',
      'ご請求いただいた資料をPDFにてお送りします。',
      '',
      'ご不明な点がございましたら、お気軽にご連絡ください。',
      '無料相談もお受けしております。',
      '',
      '─────────────────────────',
      '株式会社 Oneness',
      'https://oneness-group.jp',
      '─────────────────────────'
    ].join('\n');

    MailApp.sendEmail({
      to:          p.email,
      subject:     toSubject,
      body:        toBody,
      attachments: [pdfBlob]
    });
  } catch (pdfErr) {
    // PDF送信失敗時はログに残し、管理者通知は続行
    Logger.log('PDF送信エラー: ' + pdfErr.message);
    // 管理者にもエラーを通知
    MailApp.sendEmail(NOTIFY_EMAIL, '【エラー】PDF送信失敗', 'PDF送信に失敗しました。\n\nエラー: ' + pdfErr.message + '\n\n申込者: ' + (p.email || '不明'));
  }

  // ── 管理者へ通知 ─────────────────────────────────
  const subject = '【資料請求】' + (p.company || '') + ' ' + (p.name || '') + ' 様';
  const body = [
    '資料請求がありました。',
    '',
    '■ 会社名：' + (p.company || '未入力'),
    '■ お名前：' + (p.name    || '未入力'),
    '■ メール：' + (p.email   || '未入力'),
    '',
    '受信日時：' + dateStr
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

// ======================================================
// お問い合わせフォーム処理
// ======================================================
function handleContact(p) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('お問い合わせ');
  const now   = new Date();

  // ヘッダーが無ければ追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['受信日時', '会社名', 'お名前', 'メール', '電話番号', '種別', 'お問い合わせ内容']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#163A5C').setFontColor('#ffffff');
  }

  sheet.appendRow([
    Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
    p.company || '',
    p.name    || '',
    p.email   || '',
    p.phone   || '',
    p.type    || '',
    p.message || ''
  ]);

  const dateStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  // ── 管理者へ通知 ─────────────────────────────────
  const subject = '【お問い合わせ】' + (p.company || '') + ' ' + (p.name || '') + ' 様';
  const body = [
    'お問い合わせがありました。',
    '',
    '■ 会社名　：' + (p.company || '未入力'),
    '■ お名前　：' + (p.name    || '未入力'),
    '■ メール　：' + (p.email   || '未入力'),
    '■ 電話番号：' + (p.phone   || '未入力'),
    '■ 種別　　：' + (p.type    || '未入力'),
    '■ 内容　　：',
    (p.message || '未入力'),
    '',
    '受信日時：' + dateStr
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
