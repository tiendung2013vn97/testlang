module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'transactions',
                'amountAfterTransaction', Sequelize.FLOAT
            ),
            queryInterface.addColumn(
                'transactions',
                'bankTitle', Sequelize.STRING
            ),
            queryInterface.addColumn(
                'transactions',
                'bankAccountName', Sequelize.STRING
            ),
            queryInterface.addColumn(
                'transactions',
                'bankAccountNumber', Sequelize.FLOAT
            ),
            queryInterface.addColumn(
                'transactions',
                'amountAfterFee', Sequelize.FLOAT
            ),
            queryInterface.addColumn(
                'transactions',
                'notes', Sequelize.STRING
            ),
        ]);
    }, 
};