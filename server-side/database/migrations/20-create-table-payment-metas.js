module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('payment_metas', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        payment_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "payments",
                key: "id"
            }
        },
        key: Sequelize.STRING,
        value: Sequelize.STRING,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('payment_metas'),
};