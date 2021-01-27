module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('history', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active',
        },
        count: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id",
            }
        },
        video_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "videos",
                key: "id",
            }
        },
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('history'),
};