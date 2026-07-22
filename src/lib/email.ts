import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} belum dikonfigurasi.`);
  }

  return value;
}

function getGmailTransporter() {
  if (transporter) {
    return transporter;
  }

  const gmailUser = getRequiredEnv("GMAIL_USER");

  const gmailAppPassword = getRequiredEnv("GMAIL_APP_PASSWORD").replace(/\s+/g, "");

  transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },

    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });

  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type SendPasswordResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailInput) {
  const smtp = getGmailTransporter();

  const from = getRequiredEnv("EMAIL_FROM");

  const displayName = name.trim() || "Pengguna";

  const safeName = escapeHtml(displayName);

  const safeResetUrl = escapeHtml(resetUrl);

  await smtp.sendMail({
    from,
    to,

    subject: "Atur ulang kata sandi",

    text: [
      `Halo ${displayName},`,
      "",
      "Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.",
      "",
      "Gunakan tautan berikut untuk membuat kata sandi baru:",
      resetUrl,
      "",
      "Tautan ini berlaku selama 30 menit.",
      "",
      "Abaikan email ini apabila Anda tidak meminta pengaturan ulang kata sandi.",
    ].join("\n"),

    html: `
      <!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>
            Atur ulang kata sandi
          </title>
        </head>

        <body
          style="
            margin: 0;
            padding: 24px;
            background-color: #f4f4f5;
            color: #18181b;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    max-width: 560px;
                    overflow: hidden;
                    background-color: #ffffff;
                    border: 1px solid #e4e4e7;
                    border-radius: 12px;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 32px;
                      "
                    >
                      <h1
                        style="
                          margin: 0 0 20px;
                          font-size: 24px;
                          line-height: 1.3;
                        "
                      >
                        Atur ulang kata sandi
                      </h1>

                      <p
                        style="
                          margin: 0 0 16px;
                          line-height: 1.6;
                        "
                      >
                        Halo ${safeName},
                      </p>

                      <p
                        style="
                          margin: 0 0 24px;
                          color: #52525b;
                          line-height: 1.6;
                        "
                      >
                        Kami menerima permintaan
                        untuk mengatur ulang kata
                        sandi akun Anda.
                      </p>

                      <p
                        style="
                          margin: 0 0 24px;
                        "
                      >
                        <a
                          href="${safeResetUrl}"
                          style="
                            display: inline-block;
                            padding: 12px 18px;
                            background-color: #18181b;
                            color: #ffffff;
                            font-weight: 600;
                            text-decoration: none;
                            border-radius: 8px;
                          "
                        >
                          Atur ulang kata sandi
                        </a>
                      </p>

                      <p
                        style="
                          margin: 0 0 12px;
                          color: #52525b;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        Tautan ini berlaku selama
                        30 menit.
                      </p>

                      <p
                        style="
                          margin: 0;
                          color: #71717a;
                          font-size: 14px;
                          line-height: 1.6;
                        "
                      >
                        Abaikan email ini apabila
                        Anda tidak meminta
                        pengaturan ulang kata sandi.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
