// Named import avoids the extra `.default` indirection Bun adds when bundling a
// CJS default export, which in some Bun 1.x versions causes the transporter's
// method context to be lost and produces spurious "Cannot destructure property"
// TypeErrors at the call site.
import { createTransport } from 'nodemailer';

import { logger } from '@backend/telemetry';

type MailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string; // overrides SMTP_FROM default
};

// Use the concrete return type so TypeScript tracks the full SMTP transporter
// interface without the extra generic layer of the `Transporter<T>` alias.
type MailTransporter = ReturnType<typeof createTransport>;

let _transporter: MailTransporter | null = null;

export const initMail = (): void => {
  const host = Bun.env.SMTP_HOST;
  if (!host) {
    return; // opt-in: do nothing when SMTP_HOST is absent
  }

  const port = Number(Bun.env.SMTP_PORT ?? 587);
  const secure = Bun.env.SMTP_SECURE === 'true';
  const user = Bun.env.SMTP_USER;
  const pass = Bun.env.SMTP_PASS;

  _transporter = createTransport({
    host,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });

  logger.info(`📧 Mail enabled → ${host}:${port}`);
};

export const isMailEnabled = (): boolean => _transporter !== null;

export const sendMail = async (options: MailOptions): Promise<void> => {
  if (!_transporter) {
    return; // no-op when mail is disabled
  }

  // Defence-in-depth: guard against null/undefined reaching this function.
  // Bun's JavaScriptCore throws "Cannot destructure property 'subject' from
  // null or undefined value" when a function with destructured params is called
  // with null — this guard produces a clear warning instead of a cryptic error.
  if (options == null) {
    logger.warn('📧 sendMail called with null/undefined options — skipping');
    return;
  }

  const from = options.from ?? Bun.env.SMTP_FROM ?? 'no-reply@localhost';
  const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;

  await _transporter.sendMail({
    from,
    to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};
