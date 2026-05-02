# HTML Email Templates

All transactional emails use these HTML templates. Send via `sendTransactionalEmail` function.

## Template: Trial Expiring

Used 7 days before trial ends.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #432B7F; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .cta { background: #FFC020; color: #1a1a1a; padding: 12px 24px; text-align: center; display: inline-block; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Free Trial Ends Soon</h1>
    </div>
    <div class="content">
      <p>Hi {{charity_name}},</p>
      <p>Your CharityHub free trial ends in {{days}} days ({{trial_end_date}}).</p>
      <p>Upgrade now to keep using CharityHub and unlock all features:</p>
      <a href="https://charityhub.com/billing" class="cta">Upgrade to Paid Plan</a>
      <p>Our plans start from just £29/month. <a href="https://charityhub.com/pricing">View pricing →</a></p>
      <p>Questions? <a href="mailto:support@charityhub.com">Email us</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CharityHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Template: Payment Failed

Sent immediately when payment fails.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #dc2626;">
      <h1>Payment Failed</h1>
    </div>
    <div class="content">
      <p>Hi {{charity_name}},</p>
      <p>We tried to charge your account on {{payment_date}}, but it was declined.</p>
      <p><strong>Amount:</strong> £{{amount}}</p>
      <p><strong>Reason:</strong> {{failure_reason}}</p>
      <p>We'll retry in 3 days. To avoid service interruption, update your payment method now:</p>
      <a href="https://charityhub.com/billing" class="cta">Update Payment Method</a>
      <p>Need help? <a href="https://charityhub.com/support">Contact support</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CharityHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Template: Invoice Ready

Sent when invoice is generated.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #059669;">
      <h1>Invoice Ready</h1>
    </div>
    <div class="content">
      <p>Hi {{charity_name}},</p>
      <p>Your invoice #{{invoice_number}} is ready.</p>
      <p><strong>Amount:</strong> £{{amount}}</p>
      <p><strong>Period:</strong> {{period_start}} to {{period_end}}</p>
      <p><strong>Due Date:</strong> {{due_date}}</p>
      <a href="{{invoice_pdf_url}}" class="cta">Download Invoice</a>
      <p>Payment will be charged on {{due_date}} to your registered card.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CharityHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Template: Welcome Email

Sent on signup.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CharityHub! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi {{charity_name}},</p>
      <p>Your free 30-day trial is now active. You have full access to all CharityHub features.</p>
      <p><strong>Trial ends:</strong> {{trial_end_date}}</p>
      <a href="https://charityhub.com/dashboard" class="cta">Go to Dashboard</a>
      <h2>Quick Start:</h2>
      <ol>
        <li>Invite team members to collaborate</li>
        <li>Import your donor list</li>
        <li>Create your first campaign</li>
      </ol>
      <p>Need help? Check out our <a href="https://charityhub.com/help">help center</a> or <a href="mailto:support@charityhub.com">email support</a>.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 CharityHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Usage in Code

```javascript
await base44.integrations.Core.SendEmail({
  to: customer.email,
  subject: 'Your free trial ends in 7 days',
  body: emailTemplateHtml
    .replace('{{charity_name}}', 'ACME Charity')
    .replace('{{days}}', '7')
    .replace('{{trial_end_date}}', '2026-05-09'),
  from_name: 'CharityHub'
});
``