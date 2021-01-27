module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('view', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        count: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
        ip_address: Sequelize.STRING,
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
    down: (queryInterface, Sequelize) => queryInterface.dropTable('view'),
};