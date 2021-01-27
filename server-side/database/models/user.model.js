const { sequelize, Sequelize } = require('../');
const ActiveTokenModel = require('../models/active-token.model');
const VideoModel = require('../models/video.model');
const ChannelModel = require('./channel.model');
const SubcribeModel = require('./subcribe.model');
const CommentModel = require('./comment.model');
const VideoUserModel = require('./video-user.model');
const HistoryModel = require('./history.model');
const TransactionModel = require('../models/transaction.model');
const VideoPaymentModel = require('../models/video-payment.model');

/**
* UserModel describes 'users' table
*/
const UserModel = sequelize.define(
    'users',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: Sequelize.STRING,
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        account_type: Sequelize.STRING,
        mail_token: Sequelize.STRING,
        forgot_token: Sequelize.STRING,
        facebook_id:Sequelize.STRING,
        google_id:Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'inactive'
        },
        history_status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        avatar: Sequelize.STRING,
        phone: Sequelize.STRING,
        balance: {
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'users',
    },
);

/**
* Describes relationships
*/
UserModel.hasOne(ActiveTokenModel, { foreignKey: 'user_id' });
ActiveTokenModel.belongsTo(UserModel, { foreignKey: 'user_id' });

UserModel.hasMany(VideoModel, { foreignKey: 'user_id' });
VideoModel.belongsTo(UserModel, { foreignKey: 'user_id' });

UserModel.hasOne(ChannelModel, { foreignKey: 'user_id' });
ChannelModel.belongsTo(UserModel, { foreignKey: 'user_id' });

UserModel.hasMany(CommentModel, { foreignKey: 'user_id' });
CommentModel.belongsTo(UserModel, { foreignKey: 'user_id' });

UserModel.belongsToMany(ChannelModel, { as: 'channels_subcribe', foreignKey: 'user_id', through: SubcribeModel });
ChannelModel.belongsToMany(UserModel, { as: 'subcribers', foreignKey: 'channel_id', through: SubcribeModel });

UserModel.belongsToMany(VideoModel, { foreignKey: 'user_id', through: VideoUserModel });
VideoModel.belongsToMany(UserModel, { foreignKey: 'video_id', through: VideoUserModel });

UserModel.belongsToMany(VideoModel, { foreignKey: 'user_id', through: HistoryModel });
VideoModel.belongsToMany(UserModel, { foreignKey: 'video_id', through: HistoryModel });

UserModel.hasOne(TransactionModel, { foreignKey: 'user_id' });
TransactionModel.belongsTo(UserModel, { foreignKey: 'user_id' });

UserModel.belongsToMany(VideoModel, { foreignKey: 'user_buy', through: VideoPaymentModel, as: 'users_payments' });
VideoModel.belongsToMany(UserModel, { foreignKey: 'video_id', through: VideoPaymentModel, as: 'payments_users' });

module.exports = UserModel;