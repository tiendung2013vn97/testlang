const { sequelize, Sequelize } = require('../');
const CommentModel = require('./comment.model');
const ViewModel = require('./view.model');
const SubTitleModel = require('./subtitle.model');
const VideoPaymentModel = require('../models/video-payment.model');
/**
* VideoModel describes 'videos' table
*/
const VideoModel = sequelize.define(
    'videos',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        slug: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        description: Sequelize.TEXT,
        image: Sequelize.STRING,
        link: Sequelize.STRING,
        view: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        likes: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        dislikes: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        comments: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        user_id: Sequelize.INTEGER,
        lang_id: Sequelize.INTEGER,
        duration: Sequelize.DECIMAL(11,3),
        subtitles: Sequelize.TEXT,
        price: Sequelize.DECIMAL(11,3),
        type: Sequelize.STRING,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'videos',
    },
);

/**
* Describes relationships
*/

VideoModel.hasMany(CommentModel, { foreignKey: 'video_id', as: 'cmtVideo' });
CommentModel.belongsTo(VideoModel, { foreignKey: 'video_id', as: 'cmtVideo' });

VideoModel.hasMany(ViewModel, { foreignKey: 'video_id' });
ViewModel.belongsTo(VideoModel, { foreignKey: 'video_id' });

VideoModel.hasMany(SubTitleModel, { foreignKey: 'video_id', as: 'subVideo' });
SubTitleModel.belongsTo(VideoModel, { foreignKey: 'video_id', as: 'subVideo' });

VideoModel.hasMany(VideoPaymentModel, { foreignKey: 'video_id' });
VideoPaymentModel.belongsTo(VideoModel, { foreignKey: 'video_id' });
module.exports = VideoModel;