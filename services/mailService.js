const Mailer = require("nodemailer");
module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.name = user.name;
    this.from = `Bosta <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // sendgrid
    return Mailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send method for sending emails
  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  //   Send Email Verification Token
  async sendEmailVerification(token) {
    await this.send(
      "Email Verification",
      `This is your email verification token: ${token}`
    );
  }

  // Send Email to user when his check status is changed
  async sendStatusChangeEmail(status, checkedUrl) {
    await this.send(
      "Status Change",
      `Your check status for ${checkedUrl} has been changed to ${status}`
    );
  }
};
