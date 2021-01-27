const nodemailer = require('nodemailer');
const SettingController = require('../controllers/setting.controller');
const logger=require("../modules/logger")

/**
 * Mail smtp setting
 */
class MailService {

    /**
     * Send Mail function
     * @return send mail
     */
    static async sendMail(msg, template) {
        const config = {
            host: await SettingController.getSettingValueByKey('mail_host'),
            port: await SettingController.getSettingValueByKey('mail_port'),
            auth: {
                user: await SettingController.getSettingValueByKey('mail_username'),
                pass: await SettingController.getSettingValueByKey('mail_password'),
            },
        };
        try {
            const transporter = nodemailer.createTransport(config);

            const mailOptions = {
                from: config.auth.user,
                to: msg.reciver,
                subject: msg.subject,
                text: 'Bạn nhận được tin nhắn từ ' + config.auth.user,
                html:  this.mailTemplate(template),
            }

            await transporter.sendMail(mailOptions);
        } catch (err) {
            logger.error(`Send mail ${config.auth.user} to ${msg.reciver}  with subject ${msg.subject} fail!`, err)
            throw err
        }
    }

    /**
     * Get MailTemplate by type
     * @params {object} template
     * @return {string} mail_template
     */
    static mailTemplate(template) {
        let mail_template = '';
        if (template.type == 'register') {
            mail_template = `
                <h1>Xin chào ` + template.data.username + `! </h1>
                <p>Bạn đã đăng ký thành công từ website của chúng tôi.</p>
                <p>Vui lòng click <a style="color: red;" href="` + template.data.url + `/confirm-register/` + template.data.mail_token + `">HERE</a> để xác nhận đăng ký của bạn!</p>
            `
        }
        if (template.type == 'forgot password') {
            mail_template = `
                <h1>Xin chào ` + template.data.username + `! </h1>
                <p>Bạn đã gửi yêu cầu mật khẩu mới từ website của chúng tôi.</p>
                <p>Vui lòng click <a style="color: red;" href="` + template.data.url + `/forgot-pass/` + template.data.forgot_token + `">HERE</a> để xác nhận!</p>
            `
        }
        return mail_template;
    }
}

module.exports = MailService;