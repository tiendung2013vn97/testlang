const { sequelize, Sequelize } = require('../');

const SubTitleModel = sequelize.define(
    'subtitle',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        start: {
            type: Sequelize.DECIMAL(11,3),
        },
        end: {
            type: Sequelize.DECIMAL(11,3),
        },
        exact_mean: {
            type: Sequelize.TEXT,
        },
        full_mean: {
            type: Sequelize.TEXT,
        },
        default_mean: {
            type: Sequelize.TEXT,
        },
        raw_mean: {
            type: Sequelize.TEXT,
        },
        pronunciation: {
            type: Sequelize.TEXT,
        },
        video_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "videos",
                key: "id"
            }
        },
        
        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'subtitle',
    },
);

module.exports = SubTitleModel;