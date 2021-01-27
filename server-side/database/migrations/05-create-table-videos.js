module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('videos', {
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
        likes: Sequelize.INTEGER,
        dislikes: Sequelize.INTEGER,
        comments: Sequelize.INTEGER,
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            }
        },

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('videos'),
};