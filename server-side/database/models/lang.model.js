const { sequelize, Sequelize } = require('../');
const VideoModel = require('./video.model');
/**
* LangModel describes 'langs' table
*/
const LangModel = sequelize.define(
    'langs',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        code: Sequelize.STRING,
        image: Sequelize.STRING,
        status: Sequelize.STRING,
        description: Sequelize.STRING,
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'langs',
    },
);

/**
* Describes relationships
*/

LangModel.hasMany(VideoModel, { foreignKey: 'id' , as: 'raw_lang'});
VideoModel.belongsTo(LangModel, { foreignKey: 'lang_id', as: 'raw_lang' });
LangModel.hasMany(VideoModel, { foreignKey: 'id', as: 'translate_lang' });
VideoModel.belongsTo(LangModel, { foreignKey: 'lang_translate', as: 'translate_lang' });
module.exports = LangModel;