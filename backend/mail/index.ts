import nodemailer from 'nodemailer';

import { logger } from '@backend/telemetry';

import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

type MailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

let _transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

export const initMail = (): void => {
  const host = Bun.env.SMTP_HOST;
  if (!host) {
    return;
  }

  const port = Number(Bun.env.SMTP_PORT ?? 587);
  const secure = Bun.env.SMTP_SECURE === 'true';
  const user = Bun.env.SMTP_USER;
  const pass = Bun.env.SMTP_PASS;

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });

  logger.info(`📧 Mail enabled → ${host}:${port}`);

  _transporter.verify().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('📧 Mail transporter failed verification — check SMTP config', {
      error: message,
    });
  });
};

export const isMailEnabled = (): boolean => _transporter !== null;

export const checkMailHealth = async (): Promise<boolean> => {
  if (!_transporter) {
    return false;
  }
  try {
    await Promise.race([
      _transporter.verify(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
};

export const sendMail = async (options: MailOptions): Promise<void> => {
  if (!_transporter) {
    return;
  }

  if (!options.subject) {
    throw new Error('sendMail: subject is required');
  }

  if (!options.html && !options.text) {
    throw new Error('sendMail: at least one of html or text is required');
  }

  const from = options.from ?? Bun.env.SMTP_FROM ?? 'no-reply@localhost';

  const info = await _transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (info.rejected.length > 0) {
    logger.warn(
      '📧 sendMail: some recipients were rejected by the SMTP server',
      { rejected: info.rejected.map(String) },
    );
  }
};
