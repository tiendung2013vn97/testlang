module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('video_user', {
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

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('video_user'),
};