const { sequelize, Sequelize } = require('../');

/**
* VideoModel describes 'news' table
*/
const NewModel = sequelize.define(
    'news',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        image: Sequelize.STRING,
        slug: Sequelize.STRING,
        description: Sequelize.STRING,
        content:Sequelize.TEXT,
        createdBy: Sequelize.STRING,
        likes: Sequelize.INTEGER,
        dislikes: Sequelize.INTEGER,
        comments: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'news',
    },
);

/**
* Describes relationships
*/
module.exports = NewModel;