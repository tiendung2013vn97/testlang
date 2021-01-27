module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('comments', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'inactive',
        },
        content: {
            type: Sequelize.TEXT,
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
        parentId: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('comments'),
};