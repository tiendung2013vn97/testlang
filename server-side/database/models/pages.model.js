const { sequelize, Sequelize } = require('..');
/**
* PageModel describes 'pages' table
*/
const PageModel = sequelize.define(
    'pages',
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
        content: Sequelize.TEXT,
        seo_title: Sequelize.STRING,
        seo_content: Sequelize.TEXT,
        seo_keywords: Sequelize.STRING,
        seo_image: Sequelize.STRING,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'pages',
    },
);

/**
* Describes relationships
*/
module.exports = PageModel;