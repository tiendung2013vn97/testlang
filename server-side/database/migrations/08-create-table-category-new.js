module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('category_news', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        category_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "categories",
                key: "id"
            }
        },
        new_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "news",
                key: "id"
            }
        },

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('category_news'),
};