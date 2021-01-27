const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const CronJob = require('./modules/cronjob/job');

require('dotenv').config();

/**
* @module Crawler
* @requires module:express
* @requires module:dotenv
* @requires module:body-parser
*/
/**
* @class
* @classdesc Crawler class describes functions tos get data from outsite API source
*/
class Croner {
    constructor() {
        this.express = express();
    }

    /**
    * @description This method runs crawler.
    * @return {void}
    */
    run() {
        const { CRON_PORT } = process.env;

        this.express.use(
            cors({
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  
            }),
        );

        this.express.use(bodyParser.json({limit: '10mb', extended: true}));
        this.express.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
        this.express.listen(CRON_PORT, () => console.log(`Cronjob listening on port ${CRON_PORT}!`));

        CronJob.run();
    }
}

/**
* If this module is not main runs the crawler.
*/
if (!module.parent) {
    return new Croner().run();
}

module.exports = Croner;