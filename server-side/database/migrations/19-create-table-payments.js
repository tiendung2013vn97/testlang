module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('payments', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        position: Sequelize.INTEGER,
        title: Sequelize.STRING,
        image: Sequelize.STRING,
        content: Sequelize.TEXT, 
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('payments'),
};