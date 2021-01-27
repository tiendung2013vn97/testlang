module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('news', {
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
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('news'),
};