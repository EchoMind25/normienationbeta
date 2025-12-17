/**
 * Professional password reset email template
 * Mobile-responsive with email-safe CSS
 */

export function generatePasswordResetEmail(resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - Normie Nation</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Wrapper Table -->
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Email Container -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Normie Nation
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; font-weight: 500;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 24px;">
                Hello,
              </p>

              <!-- Message -->
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 24px;">
                We received a request to reset your password for your Normie Nation account. Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <p style="margin: 20px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px; line-height: 20px; border-radius: 4px;">
                <strong>⏱️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
              </p>

              <!-- Rate Limit Notice -->
              <p style="margin: 20px 0; padding: 16px; background-color: #dbeafe; border-left: 4px solid #3b82f6; color: #1e40af; font-size: 14px; line-height: 20px; border-radius: 4px;">
                <strong>ℹ️ Note:</strong> Only 100 password reset requests can be made per day across all users. Please keep your password secure.
              </p>

              <!-- Fallback Link -->
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; word-break: break-all;">
                <a href="${resetLink}" style="color: #667eea; text-decoration: underline; font-size: 14px;">
                  ${resetLink}
                </a>
              </p>

              <!-- Security Notice -->
              <div style="margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 12px 0; color: #ef4444; font-size: 14px; line-height: 20px; font-weight: 600;">
                  🔒 Security Alert
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged. For your security, never share this link with anyone.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                Need help? Contact us at
                <a href="mailto:support@tryechomind.net" style="color: #667eea; text-decoration: none; font-weight: 600;">
                  support@tryechomind.net
                </a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                &copy; ${new Date().getFullYear()} Normie Nation. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!-- Spacer -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 20px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                This email was sent from Normie Nation. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
