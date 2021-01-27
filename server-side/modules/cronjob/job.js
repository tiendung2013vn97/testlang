const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const CommonService = require('../../services/common.service');
const CacheService = require('../../services/cache.service');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class CronJob {
    /**
    * @description This method runs cronjob.
    * @return {void}
    */
    static async run() {
    }
}
module.exports = CronJob;