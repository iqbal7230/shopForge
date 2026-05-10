import nodemailer from 'nodemailer';

let transporter;

export const initializeEmailService = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@shopforge.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const emailTemplates = {
  verification: (verificationLink) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering with ShopForge! Please verify your email to complete your registration.</p>
          <a href="${verificationLink}" class="button">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        </div>
      </body>
    </html>
  `,

  passwordReset: (resetLink) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to reset it.</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </body>
    </html>
  `,

  orderConfirmation: (orderData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f0f0f0; }
          .total { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order Number:</strong> ${orderData.order_number}</p>
          <table class="order-table">
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${orderData.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price}</td>
                <td>$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <p class="total">Total: $${orderData.total_amount}</p>
          <p>We'll send you a tracking number as soon as your order ships.</p>
        </div>
      </body>
    </html>
  `,

  welcome: (userName) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to ShopForge, ${userName}!</h2>
          <p>We're excited to have you join our community. Start exploring our amazing products today!</p>
          <p>Happy shopping!</p>
        </div>
      </body>
    </html>
  `
};
