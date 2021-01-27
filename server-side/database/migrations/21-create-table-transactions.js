module.exports = {
    up: (queryInterface, Sequelize) =>
    queryInterface.createTable('transactions', {
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
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            }
        },
        transaction_code: Sequelize.STRING,
        amount: Sequelize.FLOAT,
        status: Sequelize.STRING,
        type: Sequelize.STRING,

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable('transactions'),
};