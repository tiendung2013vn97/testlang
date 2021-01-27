module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('categories', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: Sequelize.STRING,
        slug: Sequelize.STRING,
        icon: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('categories'),
};