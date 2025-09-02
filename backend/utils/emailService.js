const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Skip email setup if credentials not provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.log('Email credentials not provided. Email notifications will be disabled.');
      this.transporter = null;
    }
  }

  async sendBookingConfirmation(booking, cab) {
    try {
      if (!this.transporter) {
        console.log('Email service not configured. Skipping confirmation email.');
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.userEmail,
        subject: `Cab Booking Confirmation - ${booking.bookingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Cab Booking Confirmed!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
              <p><strong>From:</strong> ${booking.source}</p>
              <p><strong>To:</strong> ${booking.destination}</p>
              <p><strong>Route:</strong> ${booking.route.join(' → ')}</p>
              <p><strong>Estimated Time:</strong> ${booking.totalTime} minutes</p>
              <p><strong>Estimated Cost:</strong> $${booking.estimatedCost.toFixed(2)}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Cab Details</h3>
              <p><strong>Cab:</strong> ${cab.name}</p>
              <p><strong>Rate:</strong> $${cab.pricePerMinute}/minute</p>
              <p><strong>Start Time:</strong> ${new Date(booking.startTime).toLocaleString()}</p>
              <p><strong>Expected End Time:</strong> ${new Date(booking.endTime).toLocaleString()}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Note:</strong> Please be ready at your pickup location 5 minutes before the scheduled time.
              </p>
            </div>

            <p style="color: #6c757d; font-size: 14px;">
              Thank you for choosing our cab service. Have a safe journey!
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }

  async sendBookingUpdate(booking, cab, status) {
    try {
      if (!this.transporter) {
        console.log('Email service not configured. Skipping update email.');
        return false;
      }

      const statusMessages = {
        'in-progress': 'Your cab is on the way!',
        'completed': 'Your trip has been completed.',
        'cancelled': 'Your booking has been cancelled.'
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.userEmail,
        subject: `Booking Update - ${booking.bookingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Booking Status Update</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">${statusMessages[status]}</h3>
              <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p><strong>From:</strong> ${booking.source}</p>
              <p><strong>To:</strong> ${booking.destination}</p>
            </div>

            <p style="color: #6c757d; font-size: 14px;">
              Thank you for using our cab service!
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking update email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending booking update email:', error);
      return false;
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        console.log('Email service not configured');
        return false;
      }
      
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = EmailService;
