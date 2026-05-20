const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const simpleParser = require('mailparser').simpleParser;

// Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.turkticaret.net',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_ENCRYPTION === 'ssl' || process.env.SMTP_PORT === '465', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const imapConfig = {
  host: process.env.IMAP_HOST || 'imap.turkticaret.net',
  port: parseInt(process.env.IMAP_PORT) || 993,
  secure: process.env.IMAP_ENCRYPTION === 'ssl' || process.env.IMAP_PORT === '993',
  auth: {
    user: process.env.SMTP_USER, // usually same as SMTP
    pass: process.env.SMTP_PASS,
  },
  logger: false
};

const transporter = nodemailer.createTransport(smtpConfig);

const wrapHtmlTemplate = (contentHtml, toEmail = '') => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preload" as="image" href="images/d7b9a1ffefb3858034500757acf28daa.jpg">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    body{margin:0;padding:0}table{mso-table-lspace:0;mso-table-rspace:0}p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}p{line-height:inherit}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}img+div{display:none}.ecw{width:100%!important;min-width:0!important}
  </style>
  <!--[if mso]><div>
    <noscript>
      <xml>
        <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
        <o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
      </xml>
    </noscript>
  </div><![endif]-->
  <style>@media(max-width:550px){.ers-fs-173{font-size:16.7px!important}.ers-fs-200{font-size:18px!important}}</style>
</head>
<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5">
    <tbody>
      <tr>
        <td style="background-color:#f0f1f5">
          <!--[if mso]><center><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tbody><tr><td><![endif]-->
          <table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw" style="max-width:600px;min-height:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px">
            <tbody>
              <tr><td style="vertical-align:top"></td></tr>
              <tr>
                <td style="vertical-align:top;padding:0px 0px 0px 0px">
                  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td style="padding:24px 0 24px 0;vertical-align:top">
                          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word">
                            <tbody>
                              <tr>
                                <td style="padding:0px 0px 16px">
                                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                    <tbody>
                                      <tr>
                                        <td align="center">
                                          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
                                            <tbody>
                                              <tr>
                                                <td style="width:100%">
                                                  <img src="https://cexkuszyzlvbuimjh4o-br5juzdbtnlbxwyxphoqlog.canva-cdn.email/d7b9a1ffefb3858034500757acf28daa.jpg" width="600" height="369" style="display:block;width:100%;height:auto;max-width:100%">
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0px 24px 16px">
                                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                    <tbody>
                                      <tr>
                                        <td align="center">
                                          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:552px">
                                            <tbody>
                                              <tr><td height="0" style="border-top:1px dotted #b30000;height:0;font-size:0">&nbsp;</td></tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0px 0px 16px">
                                  <table border="0" cellpadding="0" cellspacing="0" class="layout-0" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto;background-color:#ffffff">
                                    <tbody>
                                      <tr>
                                        <td style="text-align:center;padding:0px 24px">
                                          <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto">
                                            <tbody>
                                              <tr>
                                                <td width="100.00%" style="width:100.00%;box-sizing:border-box;vertical-align:top;background-color:#ffffff;border-top-left-radius:0;border-top-right-radius:0;border-bottom-left-radius:0;border-bottom-right-radius:0">
                                                  <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed">
                                                    <tbody>
                                                      <tr>
                                                        <td style="padding:10px">
                                                          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word">
                                                            <tbody>
                                                              <tr>
                                                                <td dir="ltr" style="font-size:14.7px;white-space:normal;text-align:center;line-height:1.6;mso-line-height-alt:22.4px">${contentHtml}</td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0px 24px 16px">
                                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                    <tbody>
                                      <tr>
                                        <td align="center">
                                          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:552px">
                                            <tbody>
                                              <tr><td height="0" style="border-top:1px dotted #b30000;height:0;font-size:0">&nbsp;</td></tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0px 0px 16px">
                                  <table border="0" cellpadding="0" cellspacing="0" class="layout-1" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto;background-color:#ffffff">
                                    <tbody>
                                      <tr>
                                        <td style="text-align:center">
                                          <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:552px;table-layout:fixed;margin:0 auto">
                                            <tbody>
                                              <tr>
                                                <td width="100.00%" style="width:100.00%;box-sizing:border-box;vertical-align:top;background-color:#ffffff;border-top-left-radius:0;border-top-right-radius:0;border-bottom-left-radius:0;border-bottom-right-radius:0">
                                                  <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed">
                                                    <tbody>
                                                      <tr>
                                                        <td style="padding:17px">
                                                          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word">
                                                            <tbody>
                                                              <tr><td dir="ltr" style="color:#1e1e1e;font-size:12.7px;letter-spacing:0.1em;white-space:pre-wrap;text-align:center;line-height:38.4px;mso-line-height-alt:38.4px"><a href="https://geidostudio.com/iletisim" style="color:#1e1e1e;text-decoration:none">BİZİMLE İLETİŞİME GEÇ</a>  |  <a href="https://geidostudio.com/unsubscribe?email=${encodeURIComponent(toEmail)}" style="color:#1e1e1e;text-decoration:none">ABONELİKTEN ÇIK</a></td></tr>
                                                            </tbody>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0px 24px">
                                  <table border="0" cellpadding="0" cellspacing="0" class="layout-2" align="center" style="display:table;border-spacing:0px;border-collapse:separate;width:100%;max-width:100%;table-layout:fixed;margin:0 auto;background-color:#ffffff">
                                    <tbody>
                                      <tr>
                                        <td style="text-align:center;padding:4.827400509231098px 0px">
                                          <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;max-width:526px;table-layout:fixed;margin:0 auto">
                                            <tbody>
                                              <tr>
                                                <td width="100.00%" style="width:100.00%;box-sizing:border-box;vertical-align:top">
                                                  <table border="0" cellpadding="0" cellspacing="0" style="border-spacing:0px;border-collapse:separate;width:100%;table-layout:fixed">
                                                    <tbody>
                                                      <tr>
                                                        <td style="padding:13px">
                                                          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word">
                                                            <tbody>
                                                              <tr>
                                                                <td style="padding:0px 0px 16px">
                                                                  <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                                                    <tbody>
                                                                      <tr>
                                                                        <td align="center">
                                                                          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:500px">
                                                                            <tbody>
                                                                              <tr><td height="0" style="border-top:1px dotted #b30000;height:0;font-size:0">&nbsp;</td></tr>
                                                                            </tbody>
                                                                          </table>
                                                                        </td>
                                                                      </tr>
                                                                    </tbody>
                                                                  </table>
                                                                </td>
                                                              </tr>
                                                              <tr><td dir="ltr" style="color:#525252;font-size:12px;white-space:pre-wrap;text-align:center;padding:0px 0px 16px;line-height:18.2px;mso-line-height-alt:18.2px;text-decoration:none">&nbsp;</td></tr>
                                                              <tr><td dir="ltr" style="color:#525252;font-size:12px;white-space:pre-wrap;text-align:center;padding:0px 0px 16px;line-height:18.2px;mso-line-height-alt:18.2px">© 2026 GEİDO STUDIO<br></td></tr>
                                                              <tr><td dir="ltr" style="color:#525252;font-size:12px;white-space:pre-wrap;text-align:center;line-height:18.2px;mso-line-height-alt:18.2px">BU E-POSTA OTOMATİK OLARAK GÖNDERİLMİŞTİR.<br></td></tr>
                                                            </tbody>
                                                          </table>
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr><td height="100%" style="height:100%;font-size:0;line-height:0" aria-hidden="true">&nbsp;</td></tr>
            </tbody>
          </table>
          <!--[if mso]></td></tr></tbody></table></center><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};

// sendEmail: threadMessageId is used as the Message-ID header so replies can be
// matched back to the correct thread via the In-Reply-To header.
const sendEmail = async (to, subject, text, html, replyTo, threadMessageId) => {
  try {
    const finalHtml = wrapHtmlTemplate(html, to);
    const mailOptions = {
      from: process.env.SMTP_FROM || `"GeidoStudio" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: finalHtml,
    };
    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }
    // Set a deterministic Message-ID so we can match In-Reply-To on incoming mails
    if (threadMessageId) {
      mailOptions.messageId = threadMessageId;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Email sent: ' + info.response);
    return info;
  } catch (err) {
    console.error('[SMTP] Send email error:', err);
    throw err;
  }
};

const seenMessageIds = new Set();

const initImap = async (onNewMessage) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[IMAP] Credentials missing, IMAP not started.');
    return;
  }

  const POLL_INTERVAL_MS = 30 * 1000;

  const poll = async () => {
    const client = new ImapFlow({
      host: process.env.IMAP_HOST || 'imap.turkticaret.net',
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      logger: false
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      
      const collected = [];

      try {
        const uids = await client.search({ seen: false });
        if (!uids || uids.length === 0) {
          return;
        }
        console.log(`[IMAP] Found ${uids.length} unseen message(s).`);

        // Collect all messages first, then mark seen after iteration
        for await (const msg of client.fetch(uids, { source: true, uid: true }, { uid: true })) {
          const parsed = await simpleParser(msg.source);
          collected.push({ uid: msg.uid, parsed });
        }

        // Mark all as seen in a batch after fetch loop completes
        if (collected.length > 0) {
          const seenUids = collected.map(c => c.uid);
          await client.messageFlagsAdd(seenUids, ['\\Seen'], { uid: true }).catch(() => {});
        }
      } finally {
        lock.release();
      }

      // Process collected messages after lock is released
      for (const { parsed } of collected) {
        const msgId = parsed.messageId || String(Math.random());

        if (seenMessageIds.has(msgId)) continue;
        seenMessageIds.add(msgId);

        const fromEmail = parsed.from?.value?.[0]?.address;
        if (!fromEmail || fromEmail.toLowerCase() === (process.env.SMTP_USER || '').toLowerCase()) {
          continue;
        }

        const textContent = (parsed.text || '')
          .split('\n')
          .filter(l => !l.trimStart().startsWith('>'))
          .join('\n')
          .trim();

        const inReplyTo = parsed.inReplyTo ? parsed.inReplyTo.toString().trim() : null;
        const references = parsed.references
          ? (Array.isArray(parsed.references) ? parsed.references.join(' ') : parsed.references.toString())
          : null;

        console.log(`[IMAP] User reply from ${fromEmail} | In-Reply-To: ${inReplyTo}`);
        onNewMessage({ from: fromEmail, subject: parsed.subject, text: textContent,
          date: parsed.date || new Date(), messageId: msgId, inReplyTo, references });
      }
    } catch (err) {
      console.error('[IMAP] Poll error:', err.message);
    } finally {
      try { await client.logout(); } catch (_) {}
    }
  };

  // Poll immediately on startup, then every 30s
  await poll();
  console.log(`[IMAP] Polling every ${POLL_INTERVAL_MS / 1000}s for new messages.`);
  setInterval(poll, POLL_INTERVAL_MS);
};

module.exports = { sendEmail, initImap };
