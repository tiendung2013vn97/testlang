module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('settings', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: Sequelize.STRING,
        value: Sequelize.TEXT,
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('settings'),
};
