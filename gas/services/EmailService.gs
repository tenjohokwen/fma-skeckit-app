/**
 * EmailService.gs
 *
 * Handles email notifications for authentication flows.
 * Sends verification emails and password reset OTPs.
 *
 * Per constitution: Use GmailApp for sending emails in Google Apps Script.
 */

const EmailService = {
  /**
   * Gets the application name from environment
   * @returns {string} Application name
   */
  getAppName: function() {
    return 'File Management System';
  },

  /**
   * Gets the base URL for email links
   * @returns {string} Base URL
   */
  getBaseUrl: function() {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('APP_BASE_URL') || 'http://localhost:9000';
  },

  /**
   * Sends verification email to new user with token (no link)
   * @param {string} email - User email address
   * @param {string} verificationToken - Verification token
   */
  sendVerificationEmail: function(email, verificationToken) {
    const appName = this.getAppName();

    const subject = appName + ' - Verify Your Email';

    const htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563eb;">Welcome to ' + appName + '!</h2>' +
      '<p>Thank you for signing up. Please use the verification code below to complete your registration.</p>' +
      '<div style="background-color: #f1f5f9; padding: 20px; text-align: center; ' +
      'border-radius: 8px; margin: 30px 0;">' +
      '<p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Your Verification Code:</p>' +
      '<span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1e293b; ' +
      'font-family: monospace;">' +
      verificationToken +
      '</span>' +
      '</div>' +
      '<p>Enter this code in the application to verify your email address and activate your account.</p>' +
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">' +
      '<p style="color: #94a3b8; font-size: 12px;">This verification code will expire in 24 hours.</p>' +
      '<p style="color: #94a3b8; font-size: 12px;">If you did not create this account, please ignore this email.</p>' +
      '</div>';

    const plainBody =
      'Welcome to ' + appName + '!\n\n' +
      'Thank you for signing up. Please use the verification code below to complete your registration:\n\n' +
      'VERIFICATION CODE: ' + verificationToken + '\n\n' +
      'Enter this code in the application to verify your email address and activate your account.\n\n' +
      'This verification code will expire in 24 hours.\n\n' +
      'If you did not create this account, please ignore this email.';

    try {
      GmailApp.sendEmail(email, subject, plainBody, {
        htmlBody: htmlBody,
        name: appName
      });
      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  },

  /**
   * Sends password reset OTP email
   * @param {string} email - User email address
   * @param {string} otp - 6-digit OTP code
   */
  sendPasswordResetOTP: function(email, otp) {
    const appName = this.getAppName();

    const subject = appName + ' - Password Reset Code';

    const htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563eb;">Password Reset Request</h2>' +
      '<p>We received a request to reset your password. Use the code below to continue:</p>' +
      '<div style="background-color: #f1f5f9; padding: 20px; text-align: center; ' +
      'border-radius: 8px; margin: 30px 0;">' +
      '<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">' +
      otp +
      '</span>' +
      '</div>' +
      '<p>Enter this code in the password reset form to verify your identity.</p>' +
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">' +
      '<p style="color: #94a3b8; font-size: 12px;">This code will expire in 2 hours.</p>' +
      '<p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, ' +
      'please ignore this email or contact support if you have concerns.</p>' +
      '</div>';

    const plainBody =
      'Password Reset Request\n\n' +
      'We received a request to reset your password. Use the code below to continue:\n\n' +
      'CODE: ' + otp + '\n\n' +
      'Enter this code in the password reset form to verify your identity.\n\n' +
      'This code will expire in 2 hours.\n\n' +
      'If you did not request a password reset, please ignore this email.';

    try {
      GmailApp.sendEmail(email, subject, plainBody, {
        htmlBody: htmlBody,
        name: appName
      });
      console.log('Password reset OTP sent to:', email);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  },

  /**
   * Sends generic notification email
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   */
  sendNotification: function(email, subject, message) {
    const appName = this.getAppName();

    const htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563eb;">' + appName + '</h2>' +
      '<div style="margin: 20px 0;">' + message + '</div>' +
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">' +
      '<p style="color: #94a3b8; font-size: 12px;">This is an automated message from ' + appName + '.</p>' +
      '</div>';

    try {
      GmailApp.sendEmail(email, subject, message, {
        htmlBody: htmlBody,
        name: appName
      });
      console.log('Notification email sent to:', email);
    } catch (error) {
      console.error('Failed to send notification email:', error);
      throw error;
    }
  },

  /**
   * Feature 009: Sends case status update notification email to client
   * @param {Object} params - Email parameters
   * @param {string} params.clientEmail - Client email address
   * @param {string} params.clientFirstName - Client first name
   * @param {string} params.caseId - Case ID
   * @param {string} params.oldStatus - Previous status
   * @param {string} params.newStatus - New status
   * @param {string} params.notes - Case notes/context
   * @param {string} params.language - Language code ('en' or 'fr')
   * @returns {Object} Result { success: boolean, error?: string }
   */
  sendCaseStatusEmail: function(params) {
    try {
      // Validate required parameters
      if (!params.clientEmail || !params.clientFirstName || !params.caseId ||
          !params.newStatus || !params.notes || !params.language) {
        throw new Error('Missing required email parameters');
      }

      // Validate language
      if (params.language !== 'en' && params.language !== 'fr') {
        throw new Error('Invalid language. Must be "en" or "fr"');
      }

      // Get signature from PropertiesService
      const props = PropertiesService.getScriptProperties();
      const signature = props.getProperty('SIGNATURE') || 'File Management System Team';

      // Generate email using emailTemplates (global function from emailTemplates.gs)
      const emailContent = generateStatusNotificationEmail(
        params.language,
        {
          caseName: params.caseId,
          status: params.newStatus,
          notes: params.notes
        },
        signature
      );

      // Send email
      const appName = this.getAppName();
      GmailApp.sendEmail(
        params.clientEmail,
        emailContent.subject,
        emailContent.textBody,
        {
          htmlBody: emailContent.htmlBody,
          name: appName
        }
      );

      console.log('Case status email sent to:', params.clientEmail, 'Language:', params.language);
      return { success: true };

    } catch (error) {
      console.error('Failed to send case status email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }
};
