const { sequelize, Sequelize } = require('../');
const LangModel = require('./lang.model');

/**
* TranslateModel describes 'translate' table
*/
const TranslateModel = sequelize.define(
    'translate',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        words: Sequelize.STRING,
        translate: Sequelize.STRING,
        status: Sequelize.STRING,
        description: Sequelize.STRING,
        lang_id: Sequelize.INTEGER,
        lang_translate: Sequelize.INTEGER,
        count: Sequelize.INTEGER,
        type: Sequelize.STRING,
        pronunciation: Sequelize.STRING,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'translate',
    },
);

/**
* Describes relationships
*/
LangModel.hasMany(TranslateModel, { foreignKey: 'id', as: 'lang_trans' });
TranslateModel.belongsTo(LangModel, { foreignKey: 'lang_id', as: 'lang_trans' });

LangModel.hasMany(TranslateModel, { foreignKey: 'id', as: 'trans_lang' });
TranslateModel.belongsTo(LangModel, { foreignKey: 'lang_translate', as: 'trans_lang' });
module.exports = TranslateModel;