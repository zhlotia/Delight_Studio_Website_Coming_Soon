# Contact form backend (Google Apps Script)

The website is static, so the Contact form submits to a small **Google Apps
Script Web App** running in the studio's own Google account. That script emails
each submission to **thedelightstudio@gmail.com** (sent from Gmail, saved in the
Sent folder, with the visitor's address as reply-to).

- **Front-end wiring:** `js/main.js` POSTs the form (as `FormData`, `mode:"no-cors"`)
  to the deployed `/exec` URL. The URL is public by design (it lives in client-side
  JS); spam is mitigated by a hidden **honeypot** field named `company`.
- **Recipient:** change `RECIPIENT` in the script below, then redeploy.

## The script (paste into script.google.com → the project's `Code.gs`)

```javascript
// Delight Studio — website contact form handler
var RECIPIENT = 'thedelightstudio@gmail.com';

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Honeypot: real people leave "company" empty; bots fill it. Quietly ignore those.
    if (p.company) { return json({ ok: true }); }

    var name = (p.name||'').trim(), email = (p.email||'').trim();
    var subject = 'New inquiry — ' + ((p.event_type||'Event').trim()) + (name ? ' · ' + name : '');
    var body =
      'New photobooth inquiry from the website:\n\n' +
      'Name:          ' + name + '\n' +
      'Email:         ' + email + '\n' +
      'Phone:         ' + (p.phone||'').trim() + '\n' +
      'Event type:    ' + (p.event_type||'').trim() + '\n' +
      'Event date:    ' + (p.event_date||'').trim() + '\n' +
      'Venue name:    ' + (p.venue_name||'').trim() + '\n' +
      'Venue address: ' + (p.venue_address||'').trim() + '\n' +
      'Package:       ' + (p.package||'').trim() + '\n\n' +
      'Details:\n' + (p.message||'').trim() + '\n';

    // GmailApp: sends from your Gmail and keeps a copy in your Sent folder.
    GmailApp.sendEmail(RECIPIENT, subject, body, {
      replyTo: email || RECIPIENT,
      name: 'Delight Studio Website'
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, note: 'Delight Studio form endpoint is live.' }); }

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deploy / redeploy notes

1. script.google.com → open the project → paste/update the code → Save.
2. **Deploy → Manage deployments →** edit the existing Web app deployment (pencil) →
   **Version: New version → Deploy.** (Editing the existing deployment keeps the
   **same `/exec` URL**, so the website keeps working. Creating a *new* deployment
   makes a *new* URL that you'd have to update in `js/main.js`.)
3. Settings must stay: **Execute as: Me**, **Who has access: Anyone**.

## Fields the script expects

`name`, `email`, `phone`, `event_type`, `event_date`, `venue_name`,
`venue_address`, `package`, `message`, plus the honeypot `company`. These match the
`name="..."` attributes on the inputs in `contact.html`.
