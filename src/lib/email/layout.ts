/**
 * Layout HTML base para todos los emails de Giro Lab
 */
export function emailLayout(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Giro Lab</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f5f0fa;font-family:'DM Sans',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0fa;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#421869;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
            <div style="display:inline-block;text-align:center;line-height:1;white-space:nowrap;">
              <span style="font-family:Raleway,Arial,sans-serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">GIRO</span><span style="font-family:'DM Sans',Arial,sans-serif;font-size:28px;font-weight:300;color:#ffa719;letter-spacing:5px;text-transform:uppercase;"> LAB</span>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px 40px;border-radius:0 0 16px 16px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#999;">
              Giro Lab · Tu plataforma de bienestar integral
            </p>
            <p style="margin:0;font-size:11px;color:#bbb;">
              Recibiste este correo porque tienes una cuenta en Giro Lab.
              <a href="https://girolab.net/dashboard" style="color:#421869;text-decoration:none;">Ir al Dashboard</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function btn(text: string, url: string, color = '#995bd5'): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr><td style="background:${color};border-radius:50px;padding:12px 28px;text-align:center;">
      <a href="${url}" style="color:#ffffff;font-family:Raleway,Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.3px;">${text}</a>
    </td></tr>
  </table>`
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f0e8ff;margin:24px 0;" />`
}

export function h1(text: string): string {
  return `<h1 style="font-family:Raleway,Arial,sans-serif;font-size:26px;font-weight:900;color:#421869;margin:0 0 16px;">${text}</h1>`
}

export function h2(text: string): string {
  return `<h2 style="font-family:Raleway,Arial,sans-serif;font-size:18px;font-weight:800;color:#421869;margin:24px 0 8px;">${text}</h2>`
}

export function p(text: string): string {
  return `<p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 14px;">${text}</p>`
}

export function stars(n: number): string {
  return `<span style="color:#ffa719;font-size:22px;letter-spacing:3px;">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="font-size:13px;color:#888;padding:6px 12px 6px 0;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="font-size:14px;color:#333;font-weight:600;padding:6px 0;vertical-align:top;">${value}</td>
  </tr>`
}

export function infoTable(rows: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="background:#faf5ff;border-radius:12px;padding:16px 20px;margin:16px 0;width:100%;">
    <tbody>${rows}</tbody>
  </table>`
}

/** Escapa texto de usuario antes de incrustarlo en el HTML del correo. */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
