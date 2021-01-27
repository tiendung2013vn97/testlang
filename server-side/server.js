global.BASE_DIR=__dirname
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { JWTStrategy } = require('./services/jwt.service');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const SocketIO = require('./modules/io/socket');
const db = require('./database').db
const logger = require('./modules/logger')
require('dotenv').config();

/**
* Passport uses jwt strategy.
*/
passport.use(JWTStrategy);

/**
* @module Server
* @requires module:express
* @requires module:dotenv
* @requires module:body-parser
* @requires module:routes
*/
/**
* @class
* @classdesc Server class describes http server including with express framework.
* @property {object} express - instance express framework
*/
class Server {
    constructor() {
        this.express = express();
    }

    /**
    * @description This method runs server.
    * @return {void}
    */
    async run() {
        const { PORT, HTTPS_MODE, KEY_PATH, CERT_PATH } = process.env;

        this.express.use(
            cors({
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  
            }),
        );

        this.express.use(passport.initialize());
        this.express.use(bodyParser.json({limit: '4gb', extended: true}));
        this.express.use(bodyParser.urlencoded({limit: '4gb', extended: true}))
        this.express.use('/api', routes);
        await db.testConnect()
        if(HTTPS_MODE && HTTPS_MODE == 'true'){
            https.createServer({
                key: fs.readFileSync(KEY_PATH),
                cert: fs.readFileSync(CERT_PATH)
            }, this.express).listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
        }else{
            this.express.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));   
        }

        SocketIO.run();
    }
}

/**
* If this module is not main runs the server.
*/
if (!module.parent) {
    return new Server().run();
}

module.exports = Server;