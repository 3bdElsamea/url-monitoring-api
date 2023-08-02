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
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  // send method for sending emails just sending the message not html
  async send(subject, message) {
    // 1) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    // 2) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  //   Send Email Verification Token
  async sendEmailVerification(token) {
    await this.send(
      "Email Verification",
      `This is your email verification token: ${token}`
    );
  }

  async sendStatusChangeEmail(status, checkedUrl) {
    await this.send(
      "Status Change",
      `Your check status for ${checkedUrl} has been changed to ${status}`
    );
  }
};
