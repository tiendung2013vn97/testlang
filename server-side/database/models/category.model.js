const { sequelize, Sequelize } = require('../');
const VideoModel = require('../models/video.model');
const NewsModel = require('../models/news.model');
const CategoryVideoModel = require('../models/category-video.model');
const CategoryNewModel = require('../models/category-new.model');
/**
* CategoryModel describes 'categories' table
*/
const CategoryModel = sequelize.define(
    'categories',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        slug: Sequelize.STRING,
        icon: Sequelize.STRING,
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
        tableName: 'categories',
    },
);

/**
* Describes relationships
*/
CategoryModel.belongsToMany(VideoModel, { foreignKey: 'category_id', through: CategoryVideoModel });
VideoModel.belongsToMany(CategoryModel, { foreignKey: 'video_id', through: CategoryVideoModel });

CategoryModel.belongsToMany(NewsModel, { foreignKey: 'category_id', through: CategoryNewModel });
NewsModel.belongsToMany(CategoryModel, { foreignKey: 'new_id', through: CategoryNewModel });
module.exports = CategoryModel;
