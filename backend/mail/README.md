# 📧 Mail

Optional SMTP email support.

When `SMTP_HOST` is **not** set, the module is a complete no-op — zero overhead, no connection attempted, no errors thrown.

When `SMTP_HOST` **is** set, `initMail()` creates a Nodemailer transporter and `sendMail()` delivers email through it.

---

## Quick Start

### With Mailpit (recommended for local dev)

[Mailpit](https://github.com/axllent/mailpit) is a lightweight local SMTP server with a web UI for inspecting sent emails.

1. Add Mailpit to your Docker Compose file, or run it directly:

   ```sh
   docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
   ```

2. Uncomment the SMTP vars in your `.env`:

   ```
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_FROM=My App <no-reply@localhost>
   ```

   No `SMTP_USER` / `SMTP_PASS` needed — Mailpit accepts unauthenticated connections.

3. Start the dev server — you should see:

   ```
   📧 Mail enabled → localhost:1025
   ```

4. Open the Mailpit web UI at [http://localhost:8025](http://localhost:8025) to inspect sent emails.

### With an external SMTP provider

Set the SMTP vars in your `.env` pointing at any provider (Gmail, Mailgun, Resend, Postmark, etc.):

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=secret
SMTP_FROM=My App <no-reply@example.com>
SMTP_SECURE=false
```

---

## Environment Variables

| Variable      | Required | Default              | Description                                                               |
| ------------- | -------- | -------------------- | ------------------------------------------------------------------------- |
| `SMTP_HOST`   | No       | —                    | SMTP server hostname. Mail is disabled when absent.                       |
| `SMTP_PORT`   | No       | `587`                | SMTP server port.                                                         |
| `SMTP_USER`   | No       | —                    | SMTP auth username. Auth is skipped when either field is missing.         |
| `SMTP_PASS`   | No       | —                    | SMTP auth password. Auth is skipped when either field is missing.         |
| `SMTP_FROM`   | No       | `no-reply@localhost` | Default sender address (e.g. `"My App <no-reply@example.com>"`).          |
| `SMTP_SECURE` | No       | `false`              | Set to `"true"` to use implicit TLS (port 465). Use `false` for STARTTLS. |

---

## Usage

```ts
import { sendMail } from '@backend/mail';

await sendMail({
  to: 'user@example.com',
  subject: 'Welcome to the app',
  html: '<p>Click <a href="https://example.com/set-password?token=abc">here</a> to set your password.</p>',
  text: 'Set your password at: https://example.com/set-password?token=abc',
});
```

- `sendMail` is a no-op when `SMTP_HOST` is not configured — returns immediately, never throws.
- `sendMail` **throws** if `subject` or `html`/`text` content is missing — this is a caller error, not a runtime condition.
- `checkMailHealth` returns `true` when mail is enabled and the SMTP connection is reachable, `false` otherwise. Used by the `/healthcheck` route.

---

## Initialisation Order

`initMail()` **must be called after `initTelemetry()`**, so the logger is available when it logs the startup message. On startup it creates the Nodemailer transporter **and** calls `transporter.verify()` to confirm the SMTP connection is reachable. It is called in `backend/server.ts` immediately after `initTelemetry()`.
