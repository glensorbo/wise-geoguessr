import nodemailer from 'nodemailer';

import { logger } from '@backend/telemetry';

import type { Transporter } from 'nodemailer';

type MailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

let _transporter: Transporter | null = null;

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
};

export const isMailEnabled = (): boolean => _transporter !== null;

export const sendMail = async (options: MailOptions): Promise<void> => {
  if (!_transporter) {
    return;
  }

  const from = options.from ?? Bun.env.SMTP_FROM ?? 'no-reply@localhost';

  await _transporter.sendMail({
    from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};
