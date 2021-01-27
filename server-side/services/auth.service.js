const UserModel = require('../database/models/user.model');
const ActiveTokenModel = require('../database/models/active-token.model');
const moment = require('moment');

class AuthService {

    /**
    * Get current user login
    */
    static async user(req){
        // Init
        let token = req.headers.authorization;

        if(token){
            let user = {};
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            const Base64 = {
                atob: (input = '') => {
                    let str = input.replace(/=+$/, '');
                    let output = '';

                    if (str.length % 4 == 1) {
                        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
                    }
                    for (let bc = 0, bs = 0, buffer, i = 0;
                    buffer = str.charAt(i++);

                    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                    ) {
                        buffer = chars.indexOf(buffer);
                    }

                    return output;
                }
            }
            try {
                token = token.split('.')[1];
                const base64 = token.replace('-', '+').replace('_', '/');
                user = decodeURIComponent(Base64.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }catch(error) {
                user = '{}';
            }

            user = JSON.parse(user);
            const token_data = user.id ? await ActiveTokenModel.findOne({ where: { user_id: user.id }, include: [{ model: UserModel, where: { status: 'active' }, required: true }] }) : '';
            const expired = moment(user.expired);
            const now = moment();
            if(!token_data || expired < now){
                return '';
            }
            return token_data.user;
        }
        return '';
    }
}

module.exports = AuthService;
