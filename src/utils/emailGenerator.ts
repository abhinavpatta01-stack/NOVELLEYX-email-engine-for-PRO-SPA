import { Hotspot, EmailConfig } from '../types';

export function generateEmailHtml(
  config: EmailConfig,
  hotspots: Hotspot[],
  base64Image: string,
  originalWidth: number,
  originalHeight: number,
  emailWidth: number = 600,
  targetBlank: boolean = true
): string {
  const companyName = config.companyName || "Our Brand";
  const mainUrl = config.fallbackUrl || "#";

  // Calculate email height based on configured email width
  const emailHeight = Math.round(emailWidth * (originalHeight / originalWidth)) || 400;

  // Image source: base64 or external url
  const imgSrc = config.imageType === 'base64' 
    ? base64Image || 'https://via.placeholder.com/600x400/101018/00f0ff?text=Upload+Image+To+Generate'
    : config.externalImageUrl || 'https://via.placeholder.com/600x400/101018/00f0ff?text=No+External+Image+Url';

  // Generate Image Map HTML
  let mapHtml = '';
  const useMapAttr = hotspots.length > 0 ? `usemap="#emailMap_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}"` : '';

  if (hotspots.length > 0) {
    const areasHtml = hotspots.map((h, index) => {
      // Calculate coordinates scaled to 600px email width
      const x1 = Math.round((h.left / 100) * emailWidth);
      const y1 = Math.round((h.top / 100) * emailHeight);
      const x2 = Math.round(((h.left + h.width) / 100) * emailWidth);
      const y2 = Math.round(((h.top + h.height) / 100) * emailHeight);
      
      return `<area shape="rect" coords="${x1},${y1},${x2},${y2}" href="${h.url}" target="${targetBlank ? '_blank' : '_self'}" alt="${h.label || `Link ${index + 1}`}">`;
    }).join('\n                                ');

    mapHtml = `<map name="emailMap_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}">\n                                ${areasHtml}\n                            </map>`;
  }

  // Preheader
  const preheaderHtml = config.preheader 
    ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 0; color: transparent; line-height: 0;">${config.preheader}</div>`
    : '';

  // Header Table Block
  let headerHtml = '';
  if (config.headerActive) {
    const navLinksHtml = config.navLinks.length > 0 
      ? `<tr>
          <td align="center" style="padding-top: 10px; padding-bottom: 5px;">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                ${config.navLinks.map((link, idx) => `
                  <td style="padding: 0 10px; font-family: Arial, sans-serif; font-size: 13px;">
                    <a href="${link.url}" target="${targetBlank ? '_blank' : '_self'}" style="color: ${config.headerTextColor}; text-decoration: none; font-weight: 500;">${link.text}</a>
                  </td>
                  ${idx < config.navLinks.length - 1 ? `<td style="color: ${config.headerTextColor}; opacity: 0.5; font-size: 13px;">|</td>` : ''}
                `).join('')}
              </tr>
            </table>
          </td>
         </tr>`
      : '';

    const brandLogoHtml = config.headerLogoUrl 
      ? `<img src="${config.headerLogoUrl}" alt="${companyName}" height="40" style="display: block; height: 40px; border: 0; outline: none; margin: 0 auto;">`
      : `<span style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: ${config.headerTextColor}; letter-spacing: 1px;">${companyName}</span>`;

    headerHtml = `
      <!-- BRAND HEADER -->
      <tr>
        <td align="center" bgcolor="${config.headerBgColor}" style="padding: 20px 10px; border-bottom: 2px solid rgba(0, 0, 0, 0.05);">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <a href="${mainUrl}" target="${targetBlank ? '_blank' : '_self'}" style="text-decoration: none;">
                  ${brandLogoHtml}
                </a>
              </td>
            </tr>
            ${navLinksHtml}
          </table>
        </td>
      </tr>
    `;
  }

  // Secondary CTA Block
  let ctaHtml = '';
  if (config.ctaActive) {
    ctaHtml = `
      <!-- SECONDARY CTA BLOCK -->
      <tr>
        <td align="center" style="padding: 40px 30px; background-color: #ffffff; border-top: 1px solid #eeeeee;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
            <tr>
              <td align="center" style="font-family: Arial, sans-serif; font-size: 22px; font-weight: bold; color: #1a1a1a; padding-bottom: 12px;">
                ${config.ctaTitle}
              </td>
            </tr>
            <tr>
              <td align="center" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #666666; padding-bottom: 25px;">
                ${config.ctaBody}
              </td>
            </tr>
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" bgcolor="${config.ctaBgColor}" style="border-radius: 4px;">
                      <a href="${config.ctaButtonUrl || mainUrl}" target="${targetBlank ? '_blank' : '_self'}" style="display: inline-block; padding: 12px 30px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; color: ${config.ctaTextColor}; text-decoration: none; border-radius: 4px; border: 1px solid ${config.ctaBgColor};">
                        ${config.ctaButtonText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // Social Links mapping helper (returning inline TD cells)
  // Inline SVG icons are NOT supported well in HTML Email.
  // Instead, standard practice is to use high-quality PNG icons hosted on a reliable CDN.
  // We will reference beautiful free social icons hosted on a reliable CDN.
  let socialHtml = '';
  if (config.socialActive) {
    const activeSocials = config.socialLinks.filter(s => s.active && s.url);
    if (activeSocials.length > 0) {
      // Free CDN icons mapping
      const iconUrls: Record<string, string> = {
        facebook: 'https://cdn-icons-png.flaticon.com/32/733/733547.png',
        x: 'https://cdn-icons-png.flaticon.com/32/5969/5969020.png', // Twitter/X
        instagram: 'https://cdn-icons-png.flaticon.com/32/2111/2111463.png',
        linkedin: 'https://cdn-icons-png.flaticon.com/32/3536/3536505.png',
        youtube: 'https://cdn-icons-png.flaticon.com/32/1384/1384060.png'
      };

      socialHtml = `
        <!-- SOCIAL MEDIA LINKS -->
        <tr>
          <td align="center" style="padding: 15px 0 10px 0;">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                ${activeSocials.map(s => `
                  <td style="padding: 0 10px;">
                    <a href="${s.url}" target="${targetBlank ? '_blank' : '_self'}">
                      <img src="${iconUrls[s.platform]}" alt="${s.platform}" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none;">
                    </a>
                  </td>
                `).join('')}
              </tr>
            </table>
          </td>
        </tr>
      `;
    }
  }

  // Footer block
  let footerHtml = '';
  if (config.footerActive) {
    footerHtml = `
      <!-- FOOTER -->
      <tr>
        <td align="center" style="padding: 30px 20px; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #888888; background-color: #f4f4f7; border-top: 1px solid #e0e0e0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
            ${socialHtml}
            <tr>
              <td align="center" style="padding-top: 10px; font-family: Arial, sans-serif; color: #999999;">
                ${config.footerText || `&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 12px; font-family: Arial, sans-serif; font-size: 11px;">
                You are receiving this email because you opted in at <a href="${mainUrl}" style="color: #666666; text-decoration: underline;">our website</a>.<br>
                <a href="${mainUrl}/unsubscribe" target="${targetBlank ? '_blank' : '_self'}" style="color: #888888; text-decoration: underline; margin: 0 5px;">Unsubscribe</a> | 
                <a href="${mainUrl}/privacy" target="${targetBlank ? '_blank' : '_self'}" style="color: #888888; text-decoration: underline; margin: 0 5px;">Privacy Policy</a> | 
                <a href="${mainUrl}/support" target="${targetBlank ? '_blank' : '_self'}" style="color: #888888; text-decoration: underline; margin: 0 5px;">Contact Support</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} - Promotion</title>
    <style>
        /* Email client specific resets */
        body, table, td, a { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f7; }
        
        /* Mobile responsive adjustments */
        @media screen and (max-width: ${emailWidth}px) {
            .email-container { width: 100% !important; max-width: ${emailWidth}px !important; }
            .fluid-img { width: 100% !important; height: auto !important; max-width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
    ${preheaderHtml}
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: ${emailWidth}px; background-color: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    
                    ${headerHtml}

                    <!-- MAIN HERO BANNER (MAPPED IMAGE) -->
                    <tr>
                        <td align="center" style="font-size: 0; line-height: 0;">
                            <a href="${mainUrl}" target="${targetBlank ? '_blank' : '_self'}" style="display: block; text-decoration: none; border: 0; outline: none;">
                                <img src="${imgSrc}" width="${emailWidth}" ${useMapAttr} alt="Promotional Offer" class="fluid-img" style="display: block; width: 100%; max-width: ${emailWidth}px; height: auto; border: 0; outline: none;">
                            </a>
                            ${mapHtml}
                        </td>
                    </tr>
                    
                    ${ctaHtml}
                    ${footerHtml}
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

export function generateImageMapOnlyHtml(
  config: EmailConfig,
  hotspots: Hotspot[],
  base64Image: string,
  originalWidth: number,
  originalHeight: number,
  emailWidth: number = 600,
  targetBlank: boolean = true
): string {
  const companyName = config.companyName || "Our Brand";
  const emailHeight = Math.round(emailWidth * (originalHeight / originalWidth)) || 400;

  const imgSrc = config.imageType === 'base64'
    ? base64Image || 'https://via.placeholder.com/600x400/101018/00f0ff?text=Upload+Image+To+Generate'
    : config.externalImageUrl || 'https://via.placeholder.com/600x400/101018/00f0ff?text=No+External+Image+Url';

  const mapName = `emailMap_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const useMapAttr = hotspots.length > 0 ? `usemap="#${mapName}"` : '';

  let mapHtml = '';
  if (hotspots.length > 0) {
    const areasHtml = hotspots.map((h, index) => {
      const x1 = Math.round((h.left / 100) * emailWidth);
      const y1 = Math.round((h.top / 100) * emailHeight);
      const x2 = Math.round(((h.left + h.width) / 100) * emailWidth);
      const y2 = Math.round(((h.top + h.height) / 100) * emailHeight);
      return `<area shape="rect" coords="${x1},${y1},${x2},${y2}" href="${h.url}" target="${targetBlank ? '_blank' : '_self'}" alt="${h.label || `Link ${index + 1}`}">`;
    }).join('\n  ');

    mapHtml = `\n<map name="${mapName}">\n  ${areasHtml}\n</map>`;
  }

  return `<img src="${imgSrc}" width="${emailWidth}" height="${emailHeight}" ${useMapAttr} alt="Promotional Offer" style="display: block; width: 100%; max-width: ${emailWidth}px; height: auto; border: 0; outline: none;">${mapHtml}`;
}
