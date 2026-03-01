/**
 * Email HTML templates with inline styles for broad client support.
 * Uses table-based layout and inline CSS where needed.
 */

const BRAND = {
    name: "Bill Do",
    primary: "#0d9488",
    primaryHover: "#0f766e",
    text: "#1f2937",
    textMuted: "#6b7280",
    border: "#e5e7eb",
    background: "#f8fafc",
    white: "#ffffff",
};

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Base layout wrapper: centered 560px container, background, header, content slot, footer.
 */
function baseLayout(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.5;color:${BRAND.text};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:${BRAND.white};border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryHover} 100%);padding:24px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:${BRAND.white};letter-spacing:-0.02em;">${BRAND.name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};text-align:center;">
              <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">
                You're receiving this because you use ${BRAND.name} to track your bills.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface BillsDueTemplateData {
    firstName: string;
    billCount: number;
    appUrl?: string;
}

/**
 * HTML for "bills due today" notification email.
 */
export function renderBillsDueEmail(data: BillsDueTemplateData): string {
    const { firstName, billCount, appUrl } = data;
    const safeName = escapeHtml(firstName || "there");
    const isOne = billCount === 1;
    const headline = isOne ? "A bill is due today" : `${billCount} bills are due today`;
    const bodyCopy = isOne
        ? "You have 1 bill due today. Open the app to view details and mark it paid when done."
        : `You have ${billCount} bills due today. Open the app to view them and mark as paid when done.`;

    const ctaBlock = appUrl
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:14px 28px;background-color:${BRAND.primary};color:${BRAND.white};text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;">View in app</a>
        </td>
      </tr>
    </table>`
        : `
    <p style="margin-top:24px;margin-bottom:0;font-size:15px;color:${BRAND.textMuted};">
      Open the app to see your bills and stay on track.
    </p>`;

    const content = `
    <p style="margin:0 0 8px;font-size:16px;color:${BRAND.textMuted};">
      Hi ${safeName},
    </p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${BRAND.text};line-height:1.3;">
      ${headline}
    </h1>
    <p style="margin:0;font-size:16px;color:${BRAND.text};line-height:1.6;">
      ${bodyCopy}
    </p>
    ${ctaBlock}
  `;

    return baseLayout(content);
}
