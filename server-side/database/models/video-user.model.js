const { sequelize, Sequelize } = require('..');
/**
* VideoUserModel describes 'video_user' table
*/
const VideoUserModel = sequelize.define(
    'video_user',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: Sequelize.STRING,
        },
        video_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "videos",
                key: "id"
            }
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            }
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'video_user',
    },
);

/**
* Describes relationships
*/
module.exports = VideoUserModel;