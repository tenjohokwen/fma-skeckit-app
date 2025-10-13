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
   * Sends verification email to new user
   * @param {string} email - User email address
   * @param {string} verificationToken - Verification token
   */
  sendVerificationEmail: function(email, verificationToken) {
    const appName = this.getAppName();
    const baseUrl = this.getBaseUrl();
    const verificationLink = baseUrl + '/#/verify-email?email=' +
                            encodeURIComponent(email) +
                            '&token=' + verificationToken;

    const subject = appName + ' - Verify Your Email';

    const htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563eb;">Welcome to ' + appName + '!</h2>' +
      '<p>Thank you for signing up. Please verify your email address to complete your registration.</p>' +
      '<p style="margin: 30px 0;">' +
      '<a href="' + verificationLink + '" ' +
      'style="background-color: #2563eb; color: white; padding: 12px 24px; ' +
      'text-decoration: none; border-radius: 4px; display: inline-block;">' +
      'Verify Email Address' +
      '</a>' +
      '</p>' +
      '<p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>' +
      '<p style="color: #64748b; font-size: 12px; word-break: break-all;">' + verificationLink + '</p>' +
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">' +
      '<p style="color: #94a3b8; font-size: 12px;">This verification link will expire in 24 hours.</p>' +
      '<p style="color: #94a3b8; font-size: 12px;">If you did not create this account, please ignore this email.</p>' +
      '</div>';

    const plainBody =
      'Welcome to ' + appName + '!\n\n' +
      'Thank you for signing up. Please verify your email address by clicking the link below:\n\n' +
      verificationLink + '\n\n' +
      'This verification link will expire in 24 hours.\n\n' +
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
  }
};
