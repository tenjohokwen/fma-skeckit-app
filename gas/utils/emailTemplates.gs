/**
 * Email Templates Utility
 *
 * Provides bilingual (English/French) email templates for case status notifications
 * with professional HTML styling and plain text fallbacks.
 *
 * @module emailTemplates
 */

/**
 * Generates a status notification email in the specified language
 *
 * @param {string} language - Language code ('en' or 'fr')
 * @param {Object} data - Email data
 * @param {string} data.caseName - Name of the case
 * @param {string} data.status - New status value
 * @param {string} data.notes - Updated notes explaining the status change
 * @param {string} signature - Email signature from PropertiesService (optional)
 * @returns {Object} Email object with subject, htmlBody, and textBody properties
 * @throws {Error} If language is not 'en' or 'fr'
 */
function generateStatusNotificationEmail(language, data, signature) {
  // Validate language parameter
  if (language !== 'en' && language !== 'fr') {
    throw new Error('Language must be either "en" or "fr"');
  }

  // Validate required data fields
  if (!data || !data.caseName || !data.status || !data.notes) {
    throw new Error('Missing required fields: caseName, status, and notes are required');
  }

  // Handle signature - default to empty string if not provided
  const signatureContent = signature || '';

  // Generate template based on language
  if (language === 'en') {
    return generateEnglishTemplate(data, signatureContent);
  } else {
    return generateFrenchTemplate(data, signatureContent);
  }
}

/**
 * Generates English email template with professional HTML styling
 *
 * @param {Object} data - Email data
 * @param {string} signature - Email signature
 * @returns {Object} Email object with subject, htmlBody, and textBody
 */
function generateEnglishTemplate(data, signature) {
  const subject = `Status Update: ${data.caseName}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #ffffff; border-radius: 8px 8px 0 0; padding: 24px; border-bottom: 3px solid #2563eb;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #0f172a;">Case Status Update</h1>
    </div>

    <!-- Main Content -->
    <div style="background-color: #ffffff; padding: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #475569;">Dear Client,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">We would like to inform you of a status update for your case:</p>

      <!-- Info Box -->
      <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 4px; padding: 20px; margin: 24px 0;">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Case</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #0f172a;">${escapeHtml(data.caseName)}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">New Status</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #2563eb;">${escapeHtml(data.status)}</p>
        </div>

        <div>
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
          <p style="margin: 0; font-size: 16px; color: #334155; white-space: pre-wrap;">${escapeHtml(data.notes)}</p>
        </div>
      </div>

      <p style="margin: 24px 0 0 0; font-size: 16px; color: #475569;">If you have any questions about this update, please do not hesitate to contact us.</p>
    </div>

    <!-- Signature -->
    ${signature ? `
    <div style="background-color: #ffffff; padding: 24px; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 15px; color: #475569;">
        ${signature}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 16px 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">This is an automated notification from the case management system.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
CASE STATUS UPDATE

Dear Client,

We would like to inform you of a status update for your case:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASE
${data.caseName}

NEW STATUS
${data.status}

NOTES
${data.notes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have any questions about this update, please do not hesitate to contact us.

${signature ? '\n' + stripHtmlTags(signature) + '\n' : ''}
---
This is an automated notification from the case management system.
  `.trim();

  return {
    subject: subject,
    htmlBody: htmlBody,
    textBody: textBody
  };
}

/**
 * Generates French email template with professional HTML styling
 *
 * @param {Object} data - Email data
 * @param {string} signature - Email signature
 * @returns {Object} Email object with subject, htmlBody, and textBody
 */
function generateFrenchTemplate(data, signature) {
  const subject = `Mise à jour du statut : ${data.caseName}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mise à jour du statut</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #ffffff; border-radius: 8px 8px 0 0; padding: 24px; border-bottom: 3px solid #2563eb;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #0f172a;">Mise à jour du statut du dossier</h1>
    </div>

    <!-- Main Content -->
    <div style="background-color: #ffffff; padding: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #475569;">Cher client,</p>

      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">Nous tenons à vous informer d'une mise à jour du statut de votre dossier :</p>

      <!-- Info Box -->
      <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; border-radius: 4px; padding: 20px; margin: 24px 0;">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Dossier</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #0f172a;">${escapeHtml(data.caseName)}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Nouveau statut</p>
          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #2563eb;">${escapeHtml(data.status)}</p>
        </div>

        <div>
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
          <p style="margin: 0; font-size: 16px; color: #334155; white-space: pre-wrap;">${escapeHtml(data.notes)}</p>
        </div>
      </div>

      <p style="margin: 24px 0 0 0; font-size: 16px; color: #475569;">Si vous avez des questions concernant cette mise à jour, n'hésitez pas à nous contacter.</p>
    </div>

    <!-- Signature -->
    ${signature ? `
    <div style="background-color: #ffffff; padding: 24px; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 15px; color: #475569;">
        ${signature}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 16px 24px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">Ceci est une notification automatique du système de gestion des dossiers.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
MISE À JOUR DU STATUT DU DOSSIER

Cher client,

Nous tenons à vous informer d'une mise à jour du statut de votre dossier :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOSSIER
${data.caseName}

NOUVEAU STATUT
${data.status}

NOTES
${data.notes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si vous avez des questions concernant cette mise à jour, n'hésitez pas à nous contacter.

${signature ? '\n' + stripHtmlTags(signature) + '\n' : ''}
---
Ceci est une notification automatique du système de gestion des dossiers.
  `.trim();

  return {
    subject: subject,
    htmlBody: htmlBody,
    textBody: textBody
  };
}

/**
 * Escapes HTML special characters to prevent XSS
 *
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
function escapeHtml(text) {
  if (!text) return '';

  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return String(text).replace(/[&<>"'/]/g, function(match) {
    return htmlEscapeMap[match];
  });
}

/**
 * Strips HTML tags from text for plain text fallback
 *
 * @param {string} html - HTML string
 * @returns {string} Plain text without HTML tags
 */
function stripHtmlTags(html) {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#x2F;/g, '/');

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Retrieves the email signature from PropertiesService
 * Handles missing signature gracefully by returning empty string
 *
 * @returns {string} Email signature or empty string if not configured
 */
function getEmailSignature() {
  try {
    const props = PropertiesService.getScriptProperties();
    const signature = props.getProperty('SIGNATURE');
    return signature || '';
  } catch (error) {
    Logger.log('Error retrieving SIGNATURE property: ' + error.message);
    return '';
  }
}
