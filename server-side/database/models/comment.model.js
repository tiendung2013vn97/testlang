const { sequelize, Sequelize } = require('../');
/**
* CommentModel describes 'comments' table
*/
const CommentModel = sequelize.define(
    'comments',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'inactive',
        },
        content: Sequelize.TEXT,
        parentId: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            hierarchy: true
        },
        user_id: Sequelize.INTEGER,
        video_id: Sequelize.INTEGER,

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'comments',
    }
);

/**
* Describes relationships
*/
CommentModel.hasMany(CommentModel, {as: 'children', foreignKey: 'parentId'})
CommentModel.belongsTo(CommentModel, {as: 'parent', foreignKey: 'parentId'})
module.exports = CommentModel;