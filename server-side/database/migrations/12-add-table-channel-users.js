module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('channel_users', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'sub'
        },
        channel_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "channel",
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
    down: (queryInterface, Sequelize) => queryInterface.dropTable('channel_users'),
};